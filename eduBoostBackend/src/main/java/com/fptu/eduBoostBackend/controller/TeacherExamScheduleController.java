package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.ExamScheduleCreateRequest;
import com.fptu.eduBoostBackend.dto.request.ExamScheduleUpdateRequest;
import com.fptu.eduBoostBackend.dto.request.exam.TeacherAttemptGradeRequest;
import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptReviewResponse;
import com.fptu.eduBoostBackend.dto.response.exam.ExamScheduleResultResponse;
import com.fptu.eduBoostBackend.service.ExamAttemptService;
import com.fptu.eduBoostBackend.service.ExamScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/exam-schedules")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Teacher Exam Schedules", description = "APIs for teachers to create and manage exam schedules for classes")
public class TeacherExamScheduleController {

    private final ExamScheduleService examScheduleService;
    private final ExamAttemptService examAttemptService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Create exam schedule for a class")
    public ResponseEntity<ExamScheduleSummaryResponse> createSchedule(
            @Valid @RequestBody ExamScheduleCreateRequest request) {
        log.info("Teacher creating exam schedule for examId={} classId={}", request.getExamId(), request.getClassId());
        ExamScheduleSummaryResponse response = examScheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get exam schedules of a class for current teacher")
    public ResponseEntity<Page<ExamScheduleSummaryResponse>> getClassSchedules(
            @PathVariable String classId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ExamScheduleSummaryResponse> page = examScheduleService.getClassSchedules(classId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{scheduleId}")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Get detail of a specific exam schedule")
    public ResponseEntity<ExamScheduleSummaryResponse> getScheduleDetail(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(examScheduleService.getScheduleDetail(scheduleId));
    }

    @PatchMapping("/{scheduleId}/cancel")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Cancel an exam schedule")
    public ResponseEntity<Void> cancelSchedule(@PathVariable Long scheduleId) {
        examScheduleService.cancelSchedule(scheduleId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{scheduleId}")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Update an exam schedule (allowed only before results are announced)")
    public ResponseEntity<ExamScheduleSummaryResponse> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody ExamScheduleUpdateRequest request) {
        ExamScheduleSummaryResponse response = examScheduleService.updateSchedule(scheduleId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{scheduleId}/results")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<java.util.List<ExamScheduleResultResponse>> getScheduleResults(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(examScheduleService.getScheduleResults(scheduleId));
    }

    @PostMapping("/{scheduleId}/announce-results")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Announce results so students can see scores (AFTER_ANNOUNCE schedules only)")
    public ResponseEntity<Void> announceResults(@PathVariable Long scheduleId) {
        examScheduleService.announceResults(scheduleId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{scheduleId}/attempts/{attemptCode}/review")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Teacher review an exam attempt (includes correct answers and teacher override fields)")
    public ResponseEntity<AttemptReviewResponse> getTeacherAttemptReview(
            @PathVariable Long scheduleId,
            @PathVariable String attemptCode) {
        return ResponseEntity.ok(examAttemptService.getTeacherAttemptReview(scheduleId, attemptCode));
    }

    @PatchMapping("/{scheduleId}/attempts/{attemptCode}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Teacher manually grade FILL_BLANK questions and recompute score")
    public ResponseEntity<Void> gradeTeacherAttempt(
            @PathVariable Long scheduleId,
            @PathVariable String attemptCode,
            @Valid @RequestBody TeacherAttemptGradeRequest request) {
        examAttemptService.gradeTeacherAttempt(scheduleId, attemptCode, request);
        return ResponseEntity.ok().build();
    }
}
