package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
import com.fptu.eduBoostBackend.dto.response.exam.StudentExamAttemptHistoryResponse;
import com.fptu.eduBoostBackend.service.ExamAttemptService;
import com.fptu.eduBoostBackend.service.ExamScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/exams")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Student Exams", description = "APIs for students to view upcoming exams and report lockdown violations")
public class StudentExamController {

    private final ExamScheduleService examScheduleService;
    private final ExamAttemptService examAttemptService;

    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get upcoming exam schedules for the current student")
    public ResponseEntity<List<ExamScheduleSummaryResponse>> getUpcomingExams() {
        List<ExamScheduleSummaryResponse> exams = examScheduleService.getStudentUpcomingExams();
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/schedules/{scheduleId}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current student's attempt history for a schedule")
    public ResponseEntity<List<StudentExamAttemptHistoryResponse>> getAttemptHistory(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(examAttemptService.getStudentScheduleAttempts(scheduleId));
    }

    /**
     * Report a lockdown violation (tab switch, fullscreen exit, etc.).
     * Body: { "violationType": "TAB_SWITCH" }
     */
    @PostMapping("/attempts/{attemptCode}/violations")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Report a lockdown violation for an active exam attempt")
    public ResponseEntity<Void> reportViolation(
            @PathVariable String attemptCode,
            @RequestBody Map<String, String> body) {
        String violationType = body.getOrDefault("violationType", "UNKNOWN");
        log.info("Violation report for attempt {}: {}", attemptCode, violationType);
        examAttemptService.reportViolation(attemptCode, violationType);
        return ResponseEntity.noContent().build();
    }
}
