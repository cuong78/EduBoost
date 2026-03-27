package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.exam.AttemptAutoSaveRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptHeartbeatRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptStartRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptSubmitRequest;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStartResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStateResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptReviewResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptSubmitResponse;
import com.fptu.eduBoostBackend.service.ExamAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/exam-attempts")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Student Exam Attempts", description = "APIs for students to take exams online with auto-save and multi-tab protection")
public class StudentExamAttemptController {

    private final ExamAttemptService examAttemptService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start or resume an exam attempt for the current student")
    public ResponseEntity<AttemptStartResponse> startAttempt(@Valid @RequestBody AttemptStartRequest request) {
        log.info("Student starting exam attempt for examId={} scheduleId={}", request.getExamId(), request.getScheduleId());
        AttemptStartResponse response = examAttemptService.startAttempt(
                request.getExamId(),
                request.getScheduleId(),
                request.getSchedulePassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{attemptCode}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current state of an exam attempt for the current student")
    public ResponseEntity<AttemptStateResponse> getAttemptState(@PathVariable String attemptCode) {
        AttemptStateResponse response = examAttemptService.getAttemptState(attemptCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{attemptCode}/auto-save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Auto-save current answers and position for an exam attempt")
    public ResponseEntity<AttemptStateResponse> autoSave(@PathVariable String attemptCode,
                                                         @Valid @RequestBody AttemptAutoSaveRequest request) {
        AttemptStateResponse response = examAttemptService.autoSave(attemptCode, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{attemptCode}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit an exam attempt and get the result")
    public ResponseEntity<AttemptSubmitResponse> submit(@PathVariable String attemptCode,
                                                        @Valid @RequestBody AttemptSubmitRequest request) {
        AttemptSubmitResponse response = examAttemptService.submit(attemptCode, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{attemptCode}/heartbeat")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Heartbeat to keep an exam attempt active and detect idle timeout")
    public ResponseEntity<Void> heartbeat(@PathVariable String attemptCode,
                                          @Valid @RequestBody AttemptHeartbeatRequest request) {
        examAttemptService.heartbeat(attemptCode, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{attemptCode}/review")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Review submitted answers; answer key only when scores are visible")
    public ResponseEntity<AttemptReviewResponse> getReview(@PathVariable String attemptCode) {
        return ResponseEntity.ok(examAttemptService.getAttemptReview(attemptCode));
    }
}

