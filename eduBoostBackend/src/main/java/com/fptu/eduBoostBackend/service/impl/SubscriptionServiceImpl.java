package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.InitPaymentRequest;
import com.fptu.eduBoostBackend.dto.response.PaymentTransactionResponse;
import com.fptu.eduBoostBackend.dto.response.RevenueStatsResponse;
import com.fptu.eduBoostBackend.dto.response.SubscriptionPlanResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSubscriptionResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.PaymentStatus;
import com.fptu.eduBoostBackend.entities.enums.SubscriptionStatus;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import com.fptu.eduBoostBackend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final TeacherSubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final TeacherRepository teacherRepository;
    private final RestTemplate restTemplate;
    private final ActivityLogService activityLogService;

    // ─── Tài khoản ngân hàng nhận tiền ───
    @Value("${payment.vietqr.bank-code:MB}")
    private String bankCode;
    @Value("${payment.vietqr.account-no:0369053640}")
    private String accountNo;
    @Value("${payment.vietqr.account-name:LE THI MAI HUONG}")
    private String accountName;

    // ─── VietQR API (ta gọi VietQR) ───
    @Value("${vietqr.api.base-url:https://dev.vietqr.org}")
    private String vietQrBaseUrl;
    @Value("${vietqr.api.username:}")
    private String vietQrApiUser;
    @Value("${vietqr.api.password:}")
    private String vietQrApiPass;

    // ═══════════════════════════════════════════════════════════════
    // Public
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getActivePlans() {
        return planRepository.findByIsActiveTrueOrderByPriceAsc()
                .stream().map(this::mapPlan).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    // Teacher
    // ═══════════════════════════════════════════════════════════════

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

        // orderId tối đa 13 chars (yêu cầu VietQR)
        String orderId = "EDU" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 10).toUpperCase();

        // ─── Tạo Dynamic QR qua VietQR API ───
        String qrImageUrl = null;
        String vietQrFullContent = orderId; // fallback nếu VietQR API fail
        String vietQrToken = fetchVietQrToken();
        if (vietQrToken != null) {
            Map<String, Object> qrResult = generateDynamicQr(vietQrToken, plan, orderId);
            if (qrResult != null) {
                // Lấy full content từ VietQR (dạng "VQRf04a9c372c EDU69C4CCF81E")
                // Content này PHẢI được dùng làm nội dung CK để VietQR match & callback
                String fullContent = String.valueOf(qrResult.getOrDefault("content", orderId));
                if (fullContent != null && !fullContent.isBlank()) {
                    vietQrFullContent = fullContent;
                }
                log.info("Dynamic QR registered: orderId={}, fullContent={}", orderId, vietQrFullContent);
            }
        }
        // Dùng VietQR full content (VQR... EDU...) làm addInfo trong QR image
        // Khi user quét QR → bank tự điền đúng nội dung → VietQR match → callback
        qrImageUrl = buildStaticQrImageUrl(plan.getPrice(), vietQrFullContent);
        String qrContent = buildQrContent(plan.getPrice(), vietQrFullContent);

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

        log.info("Initiated payment {} for teacher {} plan {}",
                orderId, teacher.getTeacherId(), plan.getPlanCode());
        activityLogService.log("Tạo yêu cầu đăng ký gói");
        return mapTransaction(tx);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getMyTransactions() {
        Teacher teacher = getCurrentTeacher();
        return transactionRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getTeacherId())
                .stream().map(this::mapTransaction).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentTransactionResponse getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(this::mapTransaction)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    // ═══════════════════════════════════════════════════════════════
    // Admin
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getPendingTransactions() {
        return transactionRepository.findByPaymentStatus(PaymentStatus.PENDING)
                .stream().map(this::mapTransaction).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getAllTransactions() {
        return transactionRepository.findAllOrderByCreatedAtDesc()
                .stream().map(this::mapTransaction).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueStatsResponse getRevenueStats() {
        BigDecimal totalRevenue = transactionRepository.sumSuccessRevenue();

        // This month & last month
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        BigDecimal revenueThisMonth = transactionRepository.sumSuccessRevenueBetween(startOfMonth, now);
        BigDecimal revenueLastMonth = transactionRepository.sumSuccessRevenueBetween(startOfLastMonth, startOfMonth);

        // Counts
        long successCount   = transactionRepository.countByPaymentStatus(PaymentStatus.SUCCESS);
        long pendingCount    = transactionRepository.countByPaymentStatus(PaymentStatus.PENDING);
        long cancelledCount  = transactionRepository.countByPaymentStatus(PaymentStatus.CANCELLED);
        long failedCount     = transactionRepository.countByPaymentStatus(PaymentStatus.FAILED);
        long totalTx         = successCount + pendingCount + cancelledCount + failedCount;

        // Active subscriptions
        long activeSubs = subscriptionRepository.findByStatus(SubscriptionStatus.ACTIVE).size();

        // Monthly revenue (last 6 months)
        List<RevenueStatsResponse.MonthlyRevenue> monthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime from = startOfMonth.minusMonths(i);
            LocalDateTime to = from.plusMonths(1);
            BigDecimal amt = transactionRepository.sumSuccessRevenueBetween(from, to);
            long cnt = 0;
            // Count SUCCESS transactions in this month
            for (PaymentTransaction tx : transactionRepository.findByPaymentStatus(PaymentStatus.SUCCESS)) {
                if (tx.getPaidAt() != null && !tx.getPaidAt().isBefore(from) && tx.getPaidAt().isBefore(to)) {
                    cnt++;
                }
            }
            monthly.add(RevenueStatsResponse.MonthlyRevenue.builder()
                    .month(from.getYear() + "-" + String.format("%02d", from.getMonthValue()))
                    .amount(amt)
                    .count(cnt)
                    .build());
        }

        return RevenueStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .revenueThisMonth(revenueThisMonth)
                .revenueLastMonth(revenueLastMonth)
                .totalTransactions(totalTx)
                .successCount(successCount)
                .pendingCount(pendingCount)
                .cancelledCount(cancelledCount)
                .failedCount(failedCount)
                .activeSubscriptions(activeSubs)
                .monthlyRevenue(monthly)
                .build();
    }

    @Override
    @Transactional
    public TeacherSubscriptionResponse confirmPayment(Long transactionId, String note) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User adminUser = (User) auth.getPrincipal();

        PaymentTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (tx.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Transaction is not PENDING");
        }

        tx.setPaymentStatus(PaymentStatus.SUCCESS);
        tx.setPaidAt(LocalDateTime.now());
        tx.setConfirmedByUserId(adminUser.getUserId());
        tx.setNote(note);

        TeacherSubscription sub = activateSubscription(tx);
        return mapSubscription(sub);
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

    // ═══════════════════════════════════════════════════════════════
    // VietQR Webhook — auto-confirm
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public boolean confirmPaymentByOrderId(String orderId, long amount) {
        if (orderId == null || orderId.isBlank()) return false;

        return transactionRepository
                .findByOrderIdAndPaymentStatus(orderId.trim(), PaymentStatus.PENDING)
                .map(tx -> {
                    long expected = tx.getAmount().longValue();
                    if (Math.abs(expected - amount) > 500) {
                        log.warn("VietQR: amount mismatch orderId={} expected={} got={}",
                                orderId, expected, amount);
                        return false;
                    }

                    tx.setPaymentStatus(PaymentStatus.SUCCESS);
                    tx.setPaidAt(LocalDateTime.now());
                    tx.setNote("Auto-confirmed by VietQR callback");

                    activateSubscription(tx);

                    log.info("✅ VietQR auto-confirmed: orderId={} teacher={} plan={}",
                            orderId, tx.getTeacher().getTeacherId(), tx.getPlan().getPlanCode());
                    activityLogService.log("Đã thanh toán gói thành công");
                    return true;
                })
                .orElseGet(() -> {
                    log.warn("VietQR: no PENDING transaction for orderId={}", orderId);
                    return false;
                });
    }

    // ═══════════════════════════════════════════════════════════════
    // Scheduled
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Scheduled(cron = "0 0 1 * * *")
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

    // ═══════════════════════════════════════════════════════════════
    // VietQR API helpers — ta gọi VietQR
    // ═══════════════════════════════════════════════════════════════

    /**
     * Bước 1: Lấy access_token từ VietQR.
     * POST {baseUrl}/vqr/api/token_generate
     * Authorization: Basic Base64(username:password)
     */
    private String fetchVietQrToken() {
        if (vietQrApiUser == null || vietQrApiUser.isBlank()) {
            log.warn("VietQR API credentials not configured — skip dynamic QR");
            return null;
        }
        try {
            String raw = vietQrApiUser + ":" + vietQrApiPass;
            String basic = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + basic);
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = vietQrBaseUrl + "/vqr/api/token_generate";
            log.info("VietQR API: GET token from {}", url);

            ResponseEntity<Map> resp = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>("{}", headers), Map.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                String token = String.valueOf(resp.getBody().get("access_token"));
                log.info("VietQR API: got token OK");
                return token;
            }
            log.warn("VietQR API: token response {}", resp.getStatusCode());
        } catch (Exception e) {
            log.warn("VietQR API: get token failed: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Bước 2: Tạo Dynamic QR.
     * POST {baseUrl}/vqr/api/qr/generate-customer
     * Authorization: Bearer <token>
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> generateDynamicQr(String token, SubscriptionPlan plan, String orderId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("bankCode",     bankCode);
            body.put("bankAccount",  accountNo);
            body.put("userBankName", accountName);
            body.put("content",      orderId);       // nội dung CK
            body.put("qrType",       0);             // 0 = dynamic QR
            body.put("amount",       plan.getPrice().longValue());
            body.put("orderId",      orderId);       // VietQR dùng để callback
            body.put("transType",    "C");

            String url = vietQrBaseUrl + "/vqr/api/qr/generate-customer";
            ResponseEntity<Map> resp = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                log.info("VietQR API: dynamic QR generated, orderId={}", orderId);
                return resp.getBody();
            }
            log.warn("VietQR API: generate QR response {}", resp.getStatusCode());
        } catch (Exception e) {
            log.warn("VietQR API: generate QR failed: {}", e.getMessage());
        }
        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // Shared helpers
    // ═══════════════════════════════════════════════════════════════

    /** Kích hoạt subscription cho transaction đã confirmed */
    private TeacherSubscription activateSubscription(PaymentTransaction tx) {
        // Expire sub cũ
        subscriptionRepository.findActiveByTeacherId(tx.getTeacher().getTeacherId())
                .ifPresent(existing -> {
                    existing.setStatus(SubscriptionStatus.EXPIRED);
                    existing.setUpdatedAt(LocalDateTime.now());
                    subscriptionRepository.save(existing);
                });

        // Tạo sub mới
        LocalDate now = LocalDate.now();
        LocalDate endDate = tx.getPlan().getDurationDays() != null
                ? now.plusDays(tx.getPlan().getDurationDays()) : null;

        TeacherSubscription sub = TeacherSubscription.builder()
                .teacher(tx.getTeacher())
                .plan(tx.getPlan())
                .startDate(now)
                .endDate(endDate)
                .status(SubscriptionStatus.ACTIVE)
                .build();
        sub = subscriptionRepository.save(sub);

        tx.setSubscription(sub);
        transactionRepository.save(tx);
        return sub;
    }

    private String buildStaticQrImageUrl(BigDecimal amount, String addInfo) {
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankCode, accountNo, amount.toPlainString(),
                URLEncoder.encode(addInfo, StandardCharsets.UTF_8),
                URLEncoder.encode(accountName, StandardCharsets.UTF_8));
    }

    private String buildQrContent(BigDecimal amount, String note) {
        return String.format("TK:%s/%s | Nội dung: %s | Số tiền: %s VND",
                bankCode, accountNo, note, String.format("%,.0f", amount));
    }

    private Teacher getCurrentTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return teacherRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
    }

    // ═══════════════════════════════════════════════════════════════
    // Mapping
    // ═══════════════════════════════════════════════════════════════

    private SubscriptionPlanResponse mapPlan(SubscriptionPlan p) {
        return SubscriptionPlanResponse.builder()
                .id(p.getId()).planCode(p.getPlanCode()).planName(p.getPlanName())
                .price(p.getPrice())
                .billingCycle(p.getBillingCycle() != null ? p.getBillingCycle().name() : null)
                .durationDays(p.getDurationDays())
                .maxClasses(p.getMaxClasses()).maxStudents(p.getMaxStudents())
                .maxExamsPerMonth(p.getMaxExamsPerMonth())
                .maxAIRequestsPerMonth(p.getMaxAIRequestsPerMonth())
                .description(p.getDescription()).isActive(p.isActive())
                .build();
    }

    private TeacherSubscriptionResponse mapSubscription(TeacherSubscription s) {
        Long daysLeft = s.getEndDate() != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), s.getEndDate()) : null;
        return TeacherSubscriptionResponse.builder()
                .id(s.getId())
                .teacherId(s.getTeacher().getTeacherId())
                .teacherName(s.getTeacher().getUser().getFullName())
                .plan(mapPlan(s.getPlan()))
                .startDate(s.getStartDate()).endDate(s.getEndDate())
                .status(s.getStatus().name())
                .autoRenew(s.isAutoRenew()).createdAt(s.getCreatedAt())
                .daysRemaining(daysLeft)
                .build();
    }

    private TeacherSubscriptionResponse buildFreeResponse(Teacher teacher) {
        return planRepository.findByPlanCode("FREE").map(fp ->
                TeacherSubscriptionResponse.builder()
                        .id(null)
                        .teacherId(teacher.getTeacherId())
                        .teacherName(teacher.getUser().getFullName())
                        .plan(mapPlan(fp))
                        .status(SubscriptionStatus.ACTIVE.name())
                        .daysRemaining(null)
                        .build()
        ).orElse(null);
    }

    private PaymentTransactionResponse mapTransaction(PaymentTransaction tx) {
        User u = tx.getTeacher().getUser();
        return PaymentTransactionResponse.builder()
                .id(tx.getId()).orderId(tx.getOrderId())
                .teacherName(u.getFullName()).teacherEmail(u.getEmail())
                .planCode(tx.getPlan().getPlanCode()).planName(tx.getPlan().getPlanName())
                .amount(tx.getAmount()).currency(tx.getCurrency())
                .bankCode(tx.getBankCode()).accountNo(tx.getAccountNo())
                .accountName(tx.getAccountName())
                .qrContent(tx.getQrContent()).qrImageUrl(tx.getQrImageUrl())
                .paymentStatus(tx.getPaymentStatus().name())
                .note(tx.getNote())
                .createdAt(tx.getCreatedAt()).paidAt(tx.getPaidAt())
                .subscriptionId(tx.getSubscription() != null ? tx.getSubscription().getId() : null)
                .build();
    }
}
