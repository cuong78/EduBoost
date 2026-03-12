package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

/**
 * VietQR Webhook Endpoints
 *
 * VietQR sẽ gọi 2 endpoint này:
 *   1. POST /api/token_generate  — VietQR xin token để xác thực
 *   2. POST /bank/api/transaction-sync — VietQR gửi thông tin giao dịch khi có tiền về
 *
 * Cấu hình trong application.properties:
 *   vietqr.callback.username   (phải khớp với username bạn đăng ký với VietQR)
 *   vietqr.callback.password   (phải khớp với password bạn đăng ký với VietQR)
 *   vietqr.callback.secret-key (bí mật để sign/verify JWT giữa 2 bên)
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class VietQRCallbackController {

    private final SubscriptionService subscriptionService;

    @Value("${vietqr.callback.username:admintest}")
    private String callbackUsername;

    @Value("${vietqr.callback.password:123456@!}")
    private String callbackPassword;

    // Token cấp cho VietQR — đơn giản dùng UUID cố định (có thể rotate bằng cron nếu cần)
    @Value("${vietqr.callback.secret-key:eduboost-vietqr-secret-2025}")
    private String secretKey;

    // ─── 1. GET TOKEN ────────────────────────────────────────────────────────
    /**
     * VietQR gọi endpoint này để lấy token trước khi gửi callback.
     * Request: Basic Auth với username:password bạn đã đăng ký với VietQR.
     */
    @PostMapping("/api/token_generate")
    public ResponseEntity<?> generateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("VietQR get_token request received");

        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Missing Basic Authorization header"));
        }

        try {
            String base64 = authHeader.substring("Basic ".length()).trim();
            String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":", 2);
            if (parts.length != 2 || !callbackUsername.equals(parts[0]) || !callbackPassword.equals(parts[1])) {
                log.warn("VietQR get_token: invalid credentials");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Cannot decode Authorization header"));
        }

        // Token đơn giản: secretKey + UUID (VietQR sẽ gửi lại token này trong header của transaction-sync)
        String token = secretKey + ":" + UUID.randomUUID().toString().replace("-", "");
        String encoded = Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));

        log.info("VietQR get_token: issued token successfully");
        return ResponseEntity.ok(Map.of(
                "access_token", encoded,
                "token_type", "Bearer",
                "expires_in", 300
        ));
    }

    // ─── 2. TRANSACTION SYNC (CALLBACK) ──────────────────────────────────────
    /**
     * VietQR gọi endpoint này mỗi khi có tiền về tài khoản của bạn.
     * Body chứa thông tin giao dịch — ta dùng content + amount để tự động kích hoạt gói.
     */
    @PostMapping("/bank/api/transaction-sync")
    public ResponseEntity<?> transactionSync(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");
        log.info("VietQR transaction-sync received, auth=[{}]", authHeader != null ? "present" : "missing");

        // Validate Bearer token từ VietQR
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", true, "errorReason", "INVALID_AUTH",
                            "toastMessage", "Missing Bearer token", "object", null));
        }

        String receivedToken = authHeader.substring("Bearer ".length()).trim();
        try {
            String decoded = new String(Base64.getDecoder().decode(receivedToken), StandardCharsets.UTF_8);
            if (!decoded.startsWith(secretKey + ":")) {
                log.warn("VietQR transaction-sync: invalid token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", true, "errorReason", "INVALID_TOKEN",
                                "toastMessage", "Invalid or expired token", "object", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", true, "errorReason", "INVALID_TOKEN",
                            "toastMessage", "Cannot decode token", "object", null));
        }

        // Extract thông tin giao dịch
        String content     = String.valueOf(body.getOrDefault("content", ""));
        String transType   = String.valueOf(body.getOrDefault("transType", "C"));
        String transId     = String.valueOf(body.getOrDefault("transactionid", ""));
        Object amountRaw   = body.get("amount");
        long amount = 0;
        try { amount = amountRaw != null ? Long.parseLong(amountRaw.toString()) : 0; } catch (Exception ignored) {}

        log.info("VietQR callback: transType={} content=[{}] amount={} transId={}", transType, content, amount, transId);

        // Chỉ xử lý giao dịch GHI CÓ (C = tiền vào)
        if (!"C".equalsIgnoreCase(transType)) {
            log.info("VietQR callback: ignored transType={}", transType);
            return ResponseEntity.ok(Map.of("error", false, "errorReason", null,
                    "toastMessage", "Ignored (not incoming)", "object", Map.of("reftransactionid", transId)));
        }

        // Auto-confirm dựa trên orderId trong nội dung chuyển khoản
        boolean confirmed = subscriptionService.confirmPaymentByOrderId(content, amount);

        if (confirmed) {
            log.info("VietQR callback: ✅ auto-confirmed subscription for content=[{}]", content);
        } else {
            log.warn("VietQR callback: ⚠️ no matching PENDING transaction for content=[{}]", content);
        }

        // VietQR yêu cầu luôn trả về 200 OK ngay cả khi không match
        return ResponseEntity.ok(Map.of(
                "error", false,
                "errorReason", confirmed ? null : "NO_MATCH",
                "toastMessage", confirmed ? "Subscription activated" : "No matching order",
                "object", Map.of("reftransactionid", transId)
        ));
    }
}
