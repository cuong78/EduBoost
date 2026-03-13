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

    // ─── VietQR bank receiving payment ───
    @Value("${payment.vietqr.bank-code:TPB}")
    private String bankCode;
    @Value("${payment.vietqr.account-no:0000000000}")
    private String accountNo;
    @Value("${payment.vietqr.account-name:EDUBOOST PLATFORM}")
    private String accountName;

    // ─── VietQR API (server calls VietQR to generate dynamic QR) ───
    @Value("${vietqr.api.base-url:https://dev.vietqr.org}")
    private String vietQrApiBaseUrl;
    @Value("${vietqr.api.username:}")
    private String vietQrApiUsername;
    @Value("${vietqr.api.password:}")
    private String vietQrApiPassword;

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

        // orderId max 13 chars (VietQR requirement)
        String orderId = "EDU" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        // Try to generate dynamic QR via VietQR API (enables callback)
        String qrImageUrl = null;
        String qrLink    = null;
        String vietQrToken = fetchVietQrToken();
        if (vietQrToken != null) {
            Map<String, Object> qrResult = generateDynamicQr(vietQrToken, plan, orderId);
            if (qrResult != null) {
                qrLink    = String.valueOf(qrResult.getOrDefault("qrLink", ""));
                qrImageUrl = buildQrImageFromLink(qrLink, qrResult, plan, orderId);
                log.info("Dynamic QR generated for orderId={} qrLink={}", orderId, qrLink);
            }
        }
        // Fallback: static VietQR image URL
        if (qrImageUrl == null) {
            log.warn("Falling back to static QR for orderId={}", orderId);
            qrImageUrl = buildStaticVietQrImageUrl(plan.getPrice(), orderId);
        }

        String qrContent = buildVietQrContent(plan.getPrice(), orderId);

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

    @Override
    @Transactional(readOnly = true)
    public PaymentTransactionResponse getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(this::mapTransaction)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
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

    // ─── VietQR Webhook Auto-Confirm ──────────────

    @Override
    @Transactional
    public boolean confirmPaymentByOrderId(String content, long amount) {
        if (content == null || content.isBlank()) return false;

        // Extract EDU-XXXXXXXX from transfer content (case-insensitive)
        String upper = content.toUpperCase();
        String orderId = null;
        int idx = upper.indexOf("EDU-");
        if (idx >= 0) {
            // take "EDU-" + up to 8 alphanumeric chars
            int end = idx + 4;
            while (end < upper.length() && end < idx + 12 && Character.isLetterOrDigit(upper.charAt(end))) {
                end++;
            }
            orderId = upper.substring(idx, end);
        }
        if (orderId == null) {
            log.warn("VietQR callback: cannot extract orderId from content=[{}]", content);
            return false;
        }

        final String finalOrderId = orderId;
        return transactionRepository
                .findByOrderIdAndPaymentStatus(finalOrderId, PaymentStatus.PENDING)
                .map(tx -> {
                    long expectedAmount = tx.getAmount().longValue();
                    if (Math.abs(expectedAmount - amount) > 500) {
                        // Allow ±500 VND tolerance for bank fee differences
                        log.warn("VietQR callback: amount mismatch orderId={} expected={} got={}", finalOrderId, expectedAmount, amount);
                        return false;
                    }

                    // Expire old active subscription
                    subscriptionRepository.findActiveByTeacherId(tx.getTeacher().getTeacherId())
                            .ifPresent(existing -> {
                                existing.setStatus(SubscriptionStatus.EXPIRED);
                                existing.setUpdatedAt(LocalDateTime.now());
                                subscriptionRepository.save(existing);
                            });

                    // Mark tx SUCCESS
                    tx.setPaymentStatus(PaymentStatus.SUCCESS);
                    tx.setPaidAt(LocalDateTime.now());
                    tx.setNote("Auto-confirmed by VietQR webhook");

                    // Create new ACTIVE subscription
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

                    log.info("✅ VietQR auto-confirmed: orderId={} teacher={} plan={}",
                            finalOrderId, tx.getTeacher().getTeacherId(), tx.getPlan().getPlanCode());
                    return true;
                })
                .orElseGet(() -> {
                    log.warn("VietQR callback: no PENDING transaction for orderId={}", finalOrderId);
                    return false;
                });
    }


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

    // ─── VietQR API helpers ───────────────────────────

    /** Step 1: get access token from VietQR
     *
     * Standard Basic Auth: Authorization: Basic Base64(username:password)
     * - VIETQR_API_USERNAME = username hệ thống từ portal VietQR
     * - VIETQR_API_PASSWORD = password hệ thống từ portal VietQR
     * - SANDBOX URL  : https://dev.vietqr.org
     * - PRODUCTION URL: https://api.vietqr.org  (chỉ dùng khi VietQR approve production)
     */
    private String fetchVietQrToken() {
        if (vietQrApiUsername.isBlank() || vietQrApiPassword.isBlank()) {
            log.warn("VietQR API credentials not configured — using static QR");
            return null;
        }
        try {
            // Standard HTTP Basic Auth: Base64(username:password)
            String raw   = vietQrApiUsername + ":" + vietQrApiPassword;
            String basic = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + basic);
            headers.setContentType(MediaType.APPLICATION_JSON);
            String url = vietQrApiBaseUrl + "/vqr/api/token_generate";
            log.info("VietQR: calling {}", url);
            ResponseEntity<Map> resp = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>("{}", headers), Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                String token = String.valueOf(resp.getBody().get("access_token"));
                log.info("VietQR: got access token successfully");
                return token;
            }
            log.warn("VietQR get token: unexpected response {}", resp.getStatusCode());
        } catch (Exception e) {
            log.warn("VietQR get token failed: {}", e.getMessage());
        }
        return null;
    }

    /** Step 2: generate dynamic QR code with orderId so VietQR can callback */
    @SuppressWarnings("unchecked")
    private Map<String, Object> generateDynamicQr(String token, SubscriptionPlan plan, String orderId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("bankCode",    bankCode);
            body.put("bankAccount", accountNo);
            body.put("userBankName", accountName);
            // nội dung CK là orderId (tối đa 23 ký tự: "EDU" + 10 chars = 13 chars ✓)
            body.put("content",    orderId);
            body.put("qrType",     0);            // 0 = dynamic QR (enables callback)
            body.put("amount",     plan.getPrice().longValue());
            body.put("orderId",    orderId);       // VietQR links this to the callback
            body.put("transType",  "C");           // C = incoming

            ResponseEntity<Map> resp = restTemplate.exchange(
                    vietQrApiBaseUrl + "/vqr/api/qr/generate-customer",
                    HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);

            if (resp.getStatusCode().is2xxSuccessful()) {
                return resp.getBody();
            }
        } catch (Exception e) {
            log.warn("VietQR generate QR failed: {}", e.getMessage());
        }
        return null;
    }

    private String buildQrImageFromLink(String qrLink, Map<String, Object> result, SubscriptionPlan plan, String orderId) {
        // Always use static img.vietqr.io for display (displayable image, correct QR content).
        // Dynamic QR API was called to register orderId with VietQR for callback tracking.
        // qrLink (https://pro.vietqr.vn/...) is a web page, NOT a direct image — skip it.
        return buildStaticVietQrImageUrl(plan.getPrice(), orderId);
    }

    private String buildStaticVietQrImageUrl(BigDecimal amount, String addInfo) {
        String encoded  = URLEncoder.encode(addInfo,    StandardCharsets.UTF_8);
        String nameEnc  = URLEncoder.encode(accountName, StandardCharsets.UTF_8);
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankCode, accountNo, amount.toPlainString(), encoded, nameEnc);
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
