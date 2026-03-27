package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.InitPaymentRequest;
import com.fptu.eduBoostBackend.dto.response.PaymentTransactionResponse;
import com.fptu.eduBoostBackend.dto.response.RevenueStatsResponse;
import com.fptu.eduBoostBackend.dto.response.SubscriptionPlanResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSubscriptionResponse;
import com.fptu.eduBoostBackend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /* ─────── Public ─────── */

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getActivePlans());
    }

    /* ─────── Teacher ─────── */

    @GetMapping("/my")
    public ResponseEntity<TeacherSubscriptionResponse> getMySubscription() {
        return ResponseEntity.ok(subscriptionService.getMySubscription());
    }

    @PostMapping("/initiate")
    public ResponseEntity<PaymentTransactionResponse> initiatePayment(
            @RequestBody InitPaymentRequest request) {
        return ResponseEntity.ok(subscriptionService.initiatePayment(request));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransactionResponse>> getMyTransactions() {
        return ResponseEntity.ok(subscriptionService.getMyTransactions());
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<PaymentTransactionResponse> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getTransactionById(id));
    }

    /* ─────── Admin ─────── */

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentTransactionResponse>> getPendingTransactions() {
        return ResponseEntity.ok(subscriptionService.getPendingTransactions());
    }

    /** GET /api/subscriptions/admin/all — All transactions (all statuses) */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentTransactionResponse>> getAllTransactions() {
        return ResponseEntity.ok(subscriptionService.getAllTransactions());
    }

    /** GET /api/subscriptions/admin/stats — Revenue statistics */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueStatsResponse> getRevenueStats() {
        return ResponseEntity.ok(subscriptionService.getRevenueStats());
    }

    @PostMapping("/admin/confirm/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherSubscriptionResponse> confirmPayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.getOrDefault("note", "") : "";
        return ResponseEntity.ok(subscriptionService.confirmPayment(id, note));
    }

    @PostMapping("/admin/cancel/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentTransactionResponse> cancelTransaction(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return ResponseEntity.ok(subscriptionService.cancelTransaction(id, reason));
    }
}
