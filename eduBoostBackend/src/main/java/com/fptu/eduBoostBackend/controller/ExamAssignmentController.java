package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.ExamAssignmentRequest;
import com.fptu.eduBoostBackend.dto.request.SubmitExamRequest;
import com.fptu.eduBoostBackend.dto.response.ExamAssignmentResponse;
import com.fptu.eduBoostBackend.dto.response.ExamResultDetailResponse;
import com.fptu.eduBoostBackend.entities.ExamViolationLog;
import com.fptu.eduBoostBackend.repositories.ExamViolationLogRepository;
import com.fptu.eduBoostBackend.service.impl.ExamAssignmentServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exam-assignments")
@RequiredArgsConstructor
public class ExamAssignmentController {

    private final ExamAssignmentServiceImpl service;
    private final ExamViolationLogRepository violationLogRepository;

    // ── Teacher endpoints ──────────────────────────────────────────────────

    /** Create assignment(s) for one or more classes */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ExamAssignmentResponse>> create(@RequestBody ExamAssignmentRequest request) {
        return ResponseEntity.ok(service.createAssignment(request));
    }

    /** Get all assignments created by the logged-in teacher */
    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ExamAssignmentResponse>> teacherList() {
        return ResponseEntity.ok(service.getTeacherAssignments());
    }

    /** Get classes the teacher teaches (for populating the assign form) */
    @GetMapping("/teacher/classes")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> teacherClasses() {
        return ResponseEntity.ok(service.getTeacherClasses());
    }

    /** Get per-assignment submission results (teacher view) */
    @GetMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ExamResultDetailResponse>> assignmentResults(@PathVariable Long id) {
        return ResponseEntity.ok(service.getAssignmentResults(id));
    }

    /** Get violation logs for an assignment (teacher view — for historical review) */
    @GetMapping("/{id}/violations")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<ExamViolationLog>> getViolationLogs(@PathVariable Long id) {
        return ResponseEntity.ok(violationLogRepository.findByAssignmentIdOrderByTimestampDesc(id));
    }

    /** Get grades for all students in a class across all assignments */
    @GetMapping("/teacher/grades")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Map<String, Object>> getClassGrades(@RequestParam String classId) {
        return ResponseEntity.ok(service.getClassGrades(classId));
    }

    // ── Student endpoints ──────────────────────────────────────────────────

    /** Student: get all assignments for their class */
    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamAssignmentResponse>> studentList() {
        return ResponseEntity.ok(service.getStudentAssignments());
    }

    /** Validate access code before entering exam */
    @PostMapping("/{id}/validate-code")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamAssignmentResponse> validateCode(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.validateCode(id, body.get("code")));
    }

    /** Submit exam answers */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamResultDetailResponse> submit(@RequestBody SubmitExamRequest request) {
        return ResponseEntity.ok(service.submitExam(request));
    }

    /** Report tab switch (anti-cheat) */
    @PostMapping("/{id}/report-focus-loss")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> reportFocusLoss(@PathVariable Long id) {
        service.incrementTabSwitch(id);
        return ResponseEntity.ok().build();
    }

    // ── Shared ────────────────────────────────────────────────────────────

    /** Get full result detail (student sees own, teacher sees all) */
    @GetMapping("/results/{resultId}")
    public ResponseEntity<ExamResultDetailResponse> getResult(@PathVariable Long resultId) {
        return ResponseEntity.ok(service.getResult(resultId));
    }

    /** Student: get exam questions for a validated assignment */
    @GetMapping("/{id}/questions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getAssignmentQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(service.getAssignmentQuestions(id));
    }
}

