package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.*;
import com.fptu.eduBoostBackend.dto.response.*;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import com.fptu.eduBoostBackend.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Exam Management", description = "APIs for managing exams")
public class ExamController {

    private final ExamService examService;

    // ==================== CRUD ====================

    @GetMapping
    @Operation(summary = "Get exams with filters",
            description = "Get exams of the current teacher (DRAFT, USED, PUBLISHED). Paginated, filterable by subject/grade/type/status.")
    public ResponseEntity<Page<ExamResponse>> getExams(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Integer gradeLevel,
            @RequestParam(required = false) Long examTypeId,
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(required = false) Long createdById,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ExamResponse> exams = examService.getExams(subjectId, gradeLevel, examTypeId, status, createdById, pageable);
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID",
            description = "Returns full exam detail including all questions. Owner sees any status; others only see PUBLISHED.")
    public ResponseEntity<ExamResponse> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create new exam", description = "Creates a new exam in DRAFT status.")
    public ResponseEntity<ExamResponse> createExam(@Valid @RequestBody ExamRequest request) {
        log.info("Creating exam: {}", request.getExamTitle());
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createExam(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update exam",
            description = "Update exam metadata. Allowed for DRAFT and USED. PUBLISHED exam must be unpublished first.")
    public ResponseEntity<ExamResponse> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete exam",
            description = "Delete exam. Allowed for DRAFT and USED. PUBLISHED exam must be unpublished first.")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Published (Public View) ====================

    @GetMapping("/published")
    @Operation(summary = "Get all published exams",
            description = "Returns PUBLISHED exams visible to everyone. Supports filtering by subject, grade, and exam type. " +
                          "Viewers can also access the associated matrix template details.")
    public ResponseEntity<List<ExamResponse>> getPublishedExams(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Integer gradeLevel,
            @RequestParam(required = false) Long examTypeId) {
        return ResponseEntity.ok(examService.getPublishedExams(subjectId, gradeLevel, examTypeId));
    }

    // ==================== Question Management ====================

    @PostMapping("/{examId}/auto-select")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Auto-select questions for exam",
            description = "Automatically selects questions from the question bank based on chapter. Falls back to AI generation if bank is insufficient.")
    public ResponseEntity<AutoSelectQuestionsResponse> autoSelectQuestions(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.autoSelectQuestions(examId));
    }

    @PostMapping("/{examId}/auto-select-with-config")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Auto-select questions with cognitive level distribution",
            description = "Selects questions per lesson and cognitive level (Bloom's taxonomy). AI generates questions when bank is insufficient.")
    public ResponseEntity<AutoSelectQuestionsResponse> autoSelectQuestionsWithConfig(
            @PathVariable Long examId,
            @Valid @RequestBody AutoSelectQuestionsRequest request) {
        return ResponseEntity.ok(examService.autoSelectQuestionsWithConfig(examId, request));
    }

    @PostMapping("/{examId}/questions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Add question to exam", description = "Manually add a question from the bank to the exam.")
    public ResponseEntity<ExamQuestionResponse> addQuestionToExam(
            @PathVariable Long examId,
            @Valid @RequestBody AddQuestionToExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.addQuestionToExam(examId, request));
    }

    @PostMapping("/{examId}/questions/ai-generate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "AI generate questions for exam",
            description = "Uses AI to generate questions for a specific lesson and cognitive level.")
    public ResponseEntity<List<ExamQuestionResponse>> aiGenerateQuestionsForExam(
            @PathVariable Long examId,
            @Valid @RequestBody ExamAIGenerateRequest request) {
        return ResponseEntity.ok(examService.aiGenerateQuestionsForExam(examId, request));
    }

    @PutMapping("/{examId}/questions/{examQuestionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Edit exam question",
            description = "Edit a question within a DRAFT exam. Source flag automatically changes to TEACHER_EDITED.")
    public ResponseEntity<ExamQuestionResponse> editExamQuestion(
            @PathVariable Long examId,
            @PathVariable Long examQuestionId,
            @Valid @RequestBody EditExamQuestionRequest request) {
        return ResponseEntity.ok(examService.editExamQuestion(examId, examQuestionId, request));
    }

    @PostMapping("/{examId}/questions/{examQuestionId}/regenerate-wrong-answers")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Regenerate wrong answers",
            description = "Uses AI to regenerate the 3 distractor answer options for a question.")
    public ResponseEntity<ExamQuestionResponse> regenerateWrongAnswers(
            @PathVariable Long examId,
            @PathVariable Long examQuestionId) {
        return ResponseEntity.ok(examService.regenerateWrongAnswers(examId, examQuestionId));
    }

    @DeleteMapping("/{examId}/questions/{examQuestionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete exam question", description = "Remove a question from a DRAFT exam.")
    public ResponseEntity<Void> deleteExamQuestion(
            @PathVariable Long examId,
            @PathVariable Long examQuestionId) {
        examService.deleteExamQuestion(examId, examQuestionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{examId}/questions/reorder")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Reorder exam questions", description = "Reorder questions within a DRAFT exam.")
    public ResponseEntity<Void> reorderQuestions(
            @PathVariable Long examId,
            @Valid @RequestBody ReorderQuestionsRequest request) {
        examService.reorderQuestions(examId, request);
        return ResponseEntity.ok().build();
    }

    // ==================== Status Management ====================

    @PutMapping("/{examId}/status")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Change exam status",
            description = "Valid transitions: DRAFT→PUBLISHED, USED→PUBLISHED, PUBLISHED→DRAFT, PUBLISHED→USED. " +
                          "Once PUBLISHED, exam is visible to all other teachers (read-only).")
    public ResponseEntity<ExamResponse> changeExamStatus(
            @PathVariable Long examId,
            @Valid @RequestBody ChangeExamStatusRequest request) {
        return ResponseEntity.ok(examService.changeExamStatus(examId, request));
    }

    // ==================== Export (auto-sets USED) ====================

    @GetMapping("/{id}/export")
    @Operation(summary = "Export exam to PDF",
            description = "Exports the exam questions to PDF. " +
                          "If the exam is currently DRAFT, its status is automatically set to USED after export.")
    public ResponseEntity<byte[]> exportExam(
            @PathVariable Long id,
            @Parameter(description = "Export format: 'pdf' (exam paper) or 'answer-key' (with correct answers highlighted)")
            @RequestParam(defaultValue = "pdf") String format) {
        log.info("Exporting exam {} format: {}", id, format);
        byte[] content = examService.exportExam(id, format);
        String filename = "exam_" + id + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }


    // ==================== Statistics ====================

    @GetMapping("/{id}/statistics")
    @Operation(summary = "Get exam statistics",
            description = "Returns question distribution by cognitive level, lesson, and source (bank/AI/edited).")
    public ResponseEntity<ExamStatisticsResponse> getExamStatistics(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamStatistics(id));
    }

    // ==================== My Exams ====================

    @GetMapping("/my-exams")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get my exams",
            description = "Returns all exams (DRAFT, USED, PUBLISHED) created by the current user.")
    public ResponseEntity<List<ExamResponse>> getMyExams() {
        return ResponseEntity.ok(examService.getMyExams());
    }
}
