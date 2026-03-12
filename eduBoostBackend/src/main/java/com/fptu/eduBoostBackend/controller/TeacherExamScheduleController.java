package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.ExamScheduleCreateRequest;
import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
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
}

