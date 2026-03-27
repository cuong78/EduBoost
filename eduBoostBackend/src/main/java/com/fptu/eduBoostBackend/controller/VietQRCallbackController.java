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
 * VietQR Webhook Endpoints — server mình expose cho VietQR gọi vào.
 *
 *   1. POST /api/token_generate         — VietQR xin token (Basic Auth)
 *   2. POST /bank/api/transaction-sync   — VietQR gửi thông tin giao dịch (Bearer token)
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class VietQRCallbackController {

    private final SubscriptionService subscriptionService;

    @Value("${vietqr.callback.username}")
    private String cbUsername;

    @Value("${vietqr.callback.password}")
    private String cbPassword;

    @Value("${vietqr.callback.secret-key}")
    private String secretKey;

    // ═══════════════════════════════════════════════════════════════════
    // 1. GET TOKEN — VietQR gọi để lấy Bearer token
    // ═══════════════════════════════════════════════════════════════════
    @PostMapping("/api/token_generate")
    public ResponseEntity<?> tokenGenerate(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        log.info("VietQR /api/token_generate called");

        // Validate Basic Auth
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            log.warn("VietQR token_generate: missing Basic Auth");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "FAILED", "message", "Missing Basic Authorization"));
        }

        try {
            String decoded = new String(
                    Base64.getDecoder().decode(authHeader.substring(6).trim()),
                    StandardCharsets.UTF_8);
            String[] parts = decoded.split(":", 2);

            if (parts.length != 2
                    || !cbUsername.equals(parts[0])
                    || !cbPassword.equals(parts[1])) {
                log.warn("VietQR token_generate: invalid credentials user=[{}]", parts.length > 0 ? parts[0] : "?");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("status", "FAILED", "message", "Invalid credentials"));
            }
        } catch (Exception e) {
            log.warn("VietQR token_generate: cannot decode header: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "FAILED", "message", "Cannot decode Authorization header"));
        }

        // Issue token = Base64(secretKey:uuid)
        String raw = secretKey + ":" + UUID.randomUUID().toString().replace("-", "");
        String token = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));

        log.info("VietQR token_generate: issued token OK");
        return ResponseEntity.ok(Map.of(
                "access_token", token,
                "token_type", "Bearer",
                "expires_in", 300
        ));
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. TRANSACTION SYNC — VietQR gửi thông tin giao dịch khi có tiền về
    // ═══════════════════════════════════════════════════════════════════
    @PostMapping("/bank/api/transaction-sync")
    public ResponseEntity<?> transactionSync(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");
        log.info("VietQR /bank/api/transaction-sync called, auth=[{}]",
                authHeader != null ? "present" : "missing");

        // Validate Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return syncResponse(true, "INVALID_AUTH", "Missing Bearer token", "");
        }

        String receivedToken = authHeader.substring(7).trim();
        try {
            String decoded = new String(Base64.getDecoder().decode(receivedToken), StandardCharsets.UTF_8);
            if (!decoded.startsWith(secretKey + ":")) {
                log.warn("VietQR transaction-sync: invalid token");
                return syncResponse(true, "INVALID_TOKEN", "Invalid token", "");
            }
        } catch (Exception e) {
            log.warn("VietQR transaction-sync: cannot decode token: {}", e.getMessage());
            return syncResponse(true, "INVALID_TOKEN", "Cannot decode token", "");
        }

        // Extract fields theo tài liệu VietQR
        String orderId       = str(body, "orderId");
        String content       = str(body, "content");
        String transType     = str(body, "transType");
        String transId       = str(body, "transactionid");
        String refNumber     = str(body, "referencenumber");
        long amount = 0;
        try { amount = Long.parseLong(String.valueOf(body.getOrDefault("amount", "0"))); }
        catch (Exception ignored) {}

        log.info("VietQR callback: orderId=[{}] content=[{}] amount={} transType={} transId={} ref={}",
                orderId, content, amount, transType, transId, refNumber);

        // Chỉ xử lý giao dịch GHI CÓ (C = tiền vào)
        if (!"C".equalsIgnoreCase(transType)) {
            log.info("VietQR callback: ignored transType={}", transType);
            return syncResponse(false, null, "Ignored (not credit)", transId);
        }

        // Auto-confirm dùng orderId trực tiếp (KHÔNG parse từ content)
        boolean confirmed = subscriptionService.confirmPaymentByOrderId(orderId, amount);

        if (confirmed) {
            log.info("VietQR callback: ✅ auto-confirmed orderId=[{}]", orderId);
        } else {
            log.warn("VietQR callback: ⚠️ no matching PENDING for orderId=[{}]", orderId);
        }

        // VietQR yêu cầu luôn trả 200 OK
        return syncResponse(false,
                confirmed ? null : "NO_MATCH",
                confirmed ? "Subscription activated" : "No matching order",
                transId);
    }

    // ─── helpers ────────────────────────────────────────────────────

    private String str(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v != null ? v.toString() : "";
    }

    private ResponseEntity<?> syncResponse(boolean error, String reason, String msg, String refTxId) {
        return ResponseEntity.ok(Map.of(
                "error", error,
                "errorReason", reason != null ? reason : "",
                "toastMessage", msg != null ? msg : "",
                "object", Map.of("reftransactionid", refTxId != null ? refTxId : "")
        ));
    }
}
