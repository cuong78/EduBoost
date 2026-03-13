package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.InitPaymentRequest;
import com.fptu.eduBoostBackend.dto.response.PaymentTransactionResponse;
import com.fptu.eduBoostBackend.dto.response.SubscriptionPlanResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSubscriptionResponse;
import com.fptu.eduBoostBackend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /* ─────── Public ─────── */

    /**
     * GET /api/subscriptions/plans
     * Public — allow unauthenticated access (added to SecurityConstants.PUBLIC_ENDPOINTS)
     */
    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getActivePlans());
    }

    /* ─────── Teacher (requires authentication — anyRequest().authenticated() handles it) ─────── */

    /** GET /api/subscriptions/my */
    @GetMapping("/my")
    public ResponseEntity<TeacherSubscriptionResponse> getMySubscription() {
        return ResponseEntity.ok(subscriptionService.getMySubscription());
    }

    /** POST /api/subscriptions/initiate */
    @PostMapping("/initiate")
    public ResponseEntity<PaymentTransactionResponse> initiatePayment(
            @RequestBody InitPaymentRequest request) {
        return ResponseEntity.ok(subscriptionService.initiatePayment(request));
    }

    /** GET /api/subscriptions/transactions */
    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransactionResponse>> getMyTransactions() {
        return ResponseEntity.ok(subscriptionService.getMyTransactions());
    }

    /** GET /api/subscriptions/transactions/{id} — poll payment status */
    @GetMapping("/transactions/{id}")
    public ResponseEntity<PaymentTransactionResponse> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getTransactionById(id));
    }

    /* ─────── Admin ─────── */

    /** GET /api/subscriptions/admin/pending */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentTransactionResponse>> getPendingTransactions() {
        return ResponseEntity.ok(subscriptionService.getPendingTransactions());
    }

    /** POST /api/subscriptions/admin/confirm/{id} */
    @PostMapping("/admin/confirm/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherSubscriptionResponse> confirmPayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.getOrDefault("note", "") : "";
        return ResponseEntity.ok(subscriptionService.confirmPayment(id, note));
    }

    /** POST /api/subscriptions/admin/cancel/{id} */
    @PostMapping("/admin/cancel/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentTransactionResponse> cancelTransaction(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return ResponseEntity.ok(subscriptionService.cancelTransaction(id, reason));
    }
}
