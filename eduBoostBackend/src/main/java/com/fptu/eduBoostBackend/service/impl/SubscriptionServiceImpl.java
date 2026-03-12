package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.InitPaymentRequest;
import com.fptu.eduBoostBackend.dto.response.PaymentTransactionResponse;
import com.fptu.eduBoostBackend.dto.response.SubscriptionPlanResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSubscriptionResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.PaymentStatus;
import com.fptu.eduBoostBackend.entities.enums.SubscriptionStatus;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final TeacherSubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final TeacherRepository teacherRepository;

    // ─── VietQR config (bank receiving payment) ───
    @Value("${payment.vietqr.bank-code:VCB}")
    private String bankCode;

    @Value("${payment.vietqr.account-no:0000000000}")
    private String accountNo;

    @Value("${payment.vietqr.account-name:EDUBOOST PLATFORM}")
    private String accountName;

    // ─── Public ───────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getActivePlans() {
        return planRepository.findByIsActiveTrueOrderByPriceAsc()
                .stream()
                .map(this::mapPlan)
                .collect(Collectors.toList());
    }

    // ─── Teacher ──────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TeacherSubscriptionResponse getMySubscription() {
        Teacher teacher = getCurrentTeacher();
        return subscriptionRepository.findActiveByTeacherId(teacher.getTeacherId())
                .map(this::mapSubscription)
                .orElseGet(() -> buildFreeResponse(teacher));
    }

    @Override
    @Transactional
    public PaymentTransactionResponse initiatePayment(InitPaymentRequest request) {
        Teacher teacher = getCurrentTeacher();
        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (plan.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("FREE plan does not require payment");
        }

        // Generate unique order ID
        String orderId = "EDU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String transferNote = orderId; // teacher will put this in transfer note

        // Build VietQR deeplink: https://img.vietqr.io/image/{bankCode}-{accountNo}-compact.png?amount=...&addInfo=...&accountName=...
        String qrImageUrl = buildVietQrImageUrl(plan.getPrice(), transferNote);
        String qrContent = buildVietQrContent(plan.getPrice(), transferNote);

        PaymentTransaction tx = PaymentTransaction.builder()
                .orderId(orderId)
                .teacher(teacher)
                .plan(plan)
                .amount(plan.getPrice())
                .currency("VND")
                .bankCode(bankCode)
                .accountNo(accountNo)
                .accountName(accountName)
                .qrContent(qrContent)
                .qrImageUrl(qrImageUrl)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        tx = transactionRepository.save(tx);
        log.info("Initiated payment {} for teacher {} plan {}", orderId, teacher.getTeacherId(), plan.getPlanCode());
        return mapTransaction(tx);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getMyTransactions() {
        Teacher teacher = getCurrentTeacher();
        return transactionRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getTeacherId())
                .stream().map(this::mapTransaction).collect(Collectors.toList());
    }

    // ─── Admin ────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getPendingTransactions() {
        return transactionRepository.findByPaymentStatus(PaymentStatus.PENDING)
                .stream().map(this::mapTransaction).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeacherSubscriptionResponse confirmPayment(Long transactionId, String note) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User adminUser = (User) auth.getPrincipal();

        PaymentTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (tx.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Transaction is not in PENDING status");
        }

        // Mark transaction SUCCESS
        tx.setPaymentStatus(PaymentStatus.SUCCESS);
        tx.setPaidAt(LocalDateTime.now());
        tx.setConfirmedByUserId(adminUser.getUserId());
        tx.setNote(note);

        // Expire any existing active subscription
        subscriptionRepository.findActiveByTeacherId(tx.getTeacher().getTeacherId())
                .ifPresent(existing -> {
                    existing.setStatus(SubscriptionStatus.EXPIRED);
                    existing.setUpdatedAt(LocalDateTime.now());
                    subscriptionRepository.save(existing);
                });

        // Create new active subscription
        LocalDate now = LocalDate.now();
        LocalDate endDate = tx.getPlan().getDurationDays() != null
                ? now.plusDays(tx.getPlan().getDurationDays())
                : null;

        TeacherSubscription subscription = TeacherSubscription.builder()
                .teacher(tx.getTeacher())
                .plan(tx.getPlan())
                .startDate(now)
                .endDate(endDate)
                .status(SubscriptionStatus.ACTIVE)
                .build();
        subscription = subscriptionRepository.save(subscription);

        tx.setSubscription(subscription);
        transactionRepository.save(tx);

        log.info("Confirmed payment {} → activated subscription {} for teacher {}",
                tx.getOrderId(), subscription.getId(), tx.getTeacher().getTeacherId());

        return mapSubscription(subscription);
    }

    @Override
    @Transactional
    public PaymentTransactionResponse cancelTransaction(Long transactionId, String reason) {
        PaymentTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (tx.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Only PENDING transactions can be cancelled");
        }
        tx.setPaymentStatus(PaymentStatus.CANCELLED);
        tx.setNote(reason);
        return mapTransaction(transactionRepository.save(tx));
    }

    // ─── Scheduled ────────────────────────────────

    @Override
    @Scheduled(cron = "0 0 1 * * *") // 1 AM daily
    @Transactional
    public void expireSubscriptions() {
        List<TeacherSubscription> active = subscriptionRepository.findByStatus(SubscriptionStatus.ACTIVE);
        LocalDate today = LocalDate.now();
        int expired = 0;
        for (TeacherSubscription sub : active) {
            if (sub.getEndDate() != null && sub.getEndDate().isBefore(today)) {
                sub.setStatus(SubscriptionStatus.EXPIRED);
                sub.setUpdatedAt(LocalDateTime.now());
                subscriptionRepository.save(sub);
                expired++;
            }
        }
        if (expired > 0) log.info("Expired {} subscriptions", expired);
    }

    // ─── VietQR helpers ───────────────────────────

    private String buildVietQrImageUrl(BigDecimal amount, String addInfo) {
        // https://img.vietqr.io/image/{bankCode}-{accountNo}-compact2.png?amount=xxx&addInfo=xxx&accountName=xxx
        String encoded = URLEncoder.encode(addInfo, StandardCharsets.UTF_8);
        String nameEncoded = URLEncoder.encode(accountName, StandardCharsets.UTF_8);
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankCode, accountNo, amount.toPlainString(), encoded, nameEncoded);
    }

    private String buildVietQrContent(BigDecimal amount, String transferNote) {
        // VietQR EMV string format (simplified)
        return String.format("TK:%s/%s | Nội dung: %s | Số tiền: %s VND",
                bankCode, accountNo, transferNote, String.format("%,.0f", amount));
    }

    // ─── Mapping helpers ──────────────────────────

    private Teacher getCurrentTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return teacherRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
    }

    private SubscriptionPlanResponse mapPlan(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .planCode(plan.getPlanCode())
                .planName(plan.getPlanName())
                .price(plan.getPrice())
                .billingCycle(plan.getBillingCycle() != null ? plan.getBillingCycle().name() : null)
                .durationDays(plan.getDurationDays())
                .maxClasses(plan.getMaxClasses())
                .maxStudents(plan.getMaxStudents())
                .maxExamsPerMonth(plan.getMaxExamsPerMonth())
                .maxAIRequestsPerMonth(plan.getMaxAIRequestsPerMonth())
                .description(plan.getDescription())
                .isActive(plan.isActive())
                .build();
    }

    private TeacherSubscriptionResponse mapSubscription(TeacherSubscription sub) {
        Long daysLeft = null;
        if (sub.getEndDate() != null) {
            daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), sub.getEndDate());
        }
        return TeacherSubscriptionResponse.builder()
                .id(sub.getId())
                .teacherId(sub.getTeacher().getTeacherId())
                .teacherName(sub.getTeacher().getUser().getFullName())
                .plan(mapPlan(sub.getPlan()))
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .status(sub.getStatus().name())
                .autoRenew(sub.isAutoRenew())
                .createdAt(sub.getCreatedAt())
                .daysRemaining(daysLeft)
                .build();
    }

    private TeacherSubscriptionResponse buildFreeResponse(Teacher teacher) {
        return planRepository.findByPlanCode("FREE").map(freePlan ->
            TeacherSubscriptionResponse.builder()
                .id(null)
                .teacherId(teacher.getTeacherId())
                .teacherName(teacher.getUser().getFullName())
                .plan(mapPlan(freePlan))
                .status(SubscriptionStatus.ACTIVE.name())
                .daysRemaining(null)
                .build()
        ).orElse(null);
    }

    private PaymentTransactionResponse mapTransaction(PaymentTransaction tx) {
        User teacherUser = tx.getTeacher().getUser();
        return PaymentTransactionResponse.builder()
                .id(tx.getId())
                .orderId(tx.getOrderId())
                .teacherName(teacherUser.getFullName())
                .teacherEmail(teacherUser.getEmail())
                .planCode(tx.getPlan().getPlanCode())
                .planName(tx.getPlan().getPlanName())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .bankCode(tx.getBankCode())
                .accountNo(tx.getAccountNo())
                .accountName(tx.getAccountName())
                .qrContent(tx.getQrContent())
                .qrImageUrl(tx.getQrImageUrl())
                .paymentStatus(tx.getPaymentStatus().name())
                .note(tx.getNote())
                .createdAt(tx.getCreatedAt())
                .paidAt(tx.getPaidAt())
                .subscriptionId(tx.getSubscription() != null ? tx.getSubscription().getId() : null)
                .build();
    }
}
