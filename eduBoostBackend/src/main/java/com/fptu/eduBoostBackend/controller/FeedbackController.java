package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.CreateFeedbackRequest;
import com.fptu.eduBoostBackend.dto.request.RespondFeedbackRequest;
import com.fptu.eduBoostBackend.dto.response.FeedbackResponse;
import com.fptu.eduBoostBackend.dto.response.FeedbackStatsResponse;
import com.fptu.eduBoostBackend.service.FeedbackService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
public class FeedbackController {

    private final FeedbackService feedbackService;

    /* ─────── Teacher ─────── */

    @PostMapping
    public ResponseEntity<FeedbackResponse> createFeedback(@Valid @RequestBody CreateFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.createFeedback(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<FeedbackResponse>> getMyFeedbacks() {
        return ResponseEntity.ok(feedbackService.getMyFeedbacks());
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<FeedbackResponse> getMyFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getMyFeedbackById(id));
    }

    /* ─────── Admin ─────── */

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackStatsResponse> getStats() {
        return ResponseEntity.ok(feedbackService.getStats());
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @PutMapping("/admin/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponse> respondToFeedback(
            @PathVariable Long id,
            @Valid @RequestBody RespondFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.respondToFeedback(id, request));
    }
}
