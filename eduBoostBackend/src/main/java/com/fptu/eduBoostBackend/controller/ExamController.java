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

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get exams with filters",
            description = "Returns a paginated list of exams filtered by subject, grade, exam type, status, and creator")
    public ResponseEntity<Page<ExamResponse>> getExams(
            @Parameter(description = "Subject ID") @RequestParam(required = false) Long subjectId,
            @Parameter(description = "Grade level") @RequestParam(required = false) Integer gradeLevel,
            @Parameter(description = "Exam type ID") @RequestParam(required = false) Long examTypeId,
            @Parameter(description = "Exam status") @RequestParam(required = false) ExamStatus status,
            @Parameter(description = "Creator ID") @RequestParam(required = false) Long createdById,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching exams with filters - subjectId: {}, gradeLevel: {}, examTypeId: {}, status: {}", 
                subjectId, gradeLevel, examTypeId, status);
        Page<ExamResponse> exams = examService.getExams(subjectId, gradeLevel, examTypeId, status, createdById, pageable);
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID",
            description = "Returns detailed information of a specific exam including all questions")
    public ResponseEntity<ExamResponse> getExamById(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id) {
        log.info("Fetching exam with id: {}", id);
        ExamResponse exam = examService.getExamById(id);
        return ResponseEntity.ok(exam);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create new exam",
            description = "Creates a new exam with the specified configuration")
    public ResponseEntity<ExamResponse> createExam(
            @Valid @RequestBody ExamRequest request) {
        log.info("Creating exam: {}", request.getExamTitle());
        ExamResponse exam = examService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(exam);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update exam",
            description = "Updates an existing exam. Only DRAFT exams can be updated.")
    public ResponseEntity<ExamResponse> updateExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id,
            @Valid @RequestBody ExamRequest request) {
        log.info("Updating exam with id: {}", id);
        ExamResponse exam = examService.updateExam(id, request);
        return ResponseEntity.ok(exam);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete exam",
            description = "Deletes an exam. Only DRAFT exams can be deleted.")
    public ResponseEntity<Void> deleteExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id) {
        log.info("Deleting exam with id: {}", id);
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Question Management ====================

    @PostMapping("/{examId}/auto-select")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Auto-select questions for exam",
            description = "Automatically selects questions from the question bank based on exam configuration or matrix template")
    public ResponseEntity<AutoSelectQuestionsResponse> autoSelectQuestions(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId) {
        log.info("Auto-selecting questions for exam: {}", examId);
        AutoSelectQuestionsResponse response = examService.autoSelectQuestions(examId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{examId}/auto-select-with-config")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Auto-select questions with cognitive level distribution",
            description = "Automatically selects questions from the question bank based on lesson and cognitive level distribution. If questions are missing for a cognitive level, AI will generate them.")
    public ResponseEntity<AutoSelectQuestionsResponse> autoSelectQuestionsWithConfig(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Valid @RequestBody AutoSelectQuestionsRequest request) {
        log.info("Auto-selecting questions with config for exam: {}", examId);
        AutoSelectQuestionsResponse response = examService.autoSelectQuestionsWithConfig(examId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{examId}/questions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Add question to exam",
            description = "Manually adds a question to the exam from question bank or creates a new one")
    public ResponseEntity<ExamQuestionResponse> addQuestionToExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Valid @RequestBody AddQuestionToExamRequest request) {
        log.info("Adding question to exam: {}", examId);
        ExamQuestionResponse response = examService.addQuestionToExam(examId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{examId}/questions/ai-generate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "AI generate questions for exam",
            description = "Uses AI to generate new questions for the exam based on lesson content")
    public ResponseEntity<List<ExamQuestionResponse>> aiGenerateQuestionsForExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Valid @RequestBody ExamAIGenerateRequest request) {
        log.info("AI generating {} questions for exam: {}", request.getNumberOfQuestions(), examId);
        List<ExamQuestionResponse> questions = examService.aiGenerateQuestionsForExam(examId, request);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{examId}/questions/{examQuestionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Edit exam question",
            description = "Edits a question in the exam. The source flag will be updated to TEACHER_EDITED.")
    public ResponseEntity<ExamQuestionResponse> editExamQuestion(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Parameter(description = "Exam question ID", required = true) @PathVariable Long examQuestionId,
            @Valid @RequestBody EditExamQuestionRequest request) {
        log.info("Editing question {} in exam: {}", examQuestionId, examId);
        ExamQuestionResponse response = examService.editExamQuestion(examId, examQuestionId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{examId}/questions/{examQuestionId}/regenerate-wrong-answers")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Regenerate wrong answers",
            description = "Uses AI to regenerate wrong answer options for a question")
    public ResponseEntity<ExamQuestionResponse> regenerateWrongAnswers(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Parameter(description = "Exam question ID", required = true) @PathVariable Long examQuestionId) {
        log.info("Regenerating wrong answers for question {} in exam: {}", examQuestionId, examId);
        ExamQuestionResponse response = examService.regenerateWrongAnswers(examId, examQuestionId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{examId}/questions/{examQuestionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete exam question",
            description = "Removes a question from the exam")
    public ResponseEntity<Void> deleteExamQuestion(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Parameter(description = "Exam question ID", required = true) @PathVariable Long examQuestionId) {
        log.info("Deleting question {} from exam: {}", examQuestionId, examId);
        examService.deleteExamQuestion(examId, examQuestionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{examId}/questions/reorder")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Reorder exam questions",
            description = "Reorders questions in the exam")
    public ResponseEntity<Void> reorderQuestions(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Valid @RequestBody ReorderQuestionsRequest request) {
        log.info("Reordering questions in exam: {}", examId);
        examService.reorderQuestions(examId, request);
        return ResponseEntity.ok().build();
    }

    // ==================== Status Management ====================

    @PostMapping("/{examId}/approve")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Approve exam",
            description = "Approves the exam and saves new/edited questions to the question bank")
    public ResponseEntity<ApproveExamResponse> approveExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId) {
        log.info("Approving exam: {}", examId);
        ApproveExamResponse response = examService.approveExam(examId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{examId}/status")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Change exam status",
            description = "Changes the status of an exam (DRAFT -> PENDING_REVIEW/APPROVED -> PUBLISHED -> ARCHIVED)")
    public ResponseEntity<ExamResponse> changeExamStatus(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long examId,
            @Valid @RequestBody ChangeExamStatusRequest request) {
        log.info("Changing status of exam {} to: {}", examId, request.getNewStatus());
        ExamResponse exam = examService.changeExamStatus(examId, request);
        return ResponseEntity.ok(exam);
    }

    // ==================== Export ====================

    @GetMapping("/{id}/export")
    @Operation(summary = "Export exam",
            description = "Exports the exam to PDF or DOCX format")
    public ResponseEntity<byte[]> exportExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id,
            @Parameter(description = "Export format (pdf, docx)") @RequestParam(defaultValue = "pdf") String format) {
        log.info("Exporting exam {} to format: {}", id, format);
        byte[] content = examService.exportExam(id, format);
        
        String contentType = format.equalsIgnoreCase("pdf") 
                ? MediaType.APPLICATION_PDF_VALUE 
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        String filename = "exam_" + id + "." + format.toLowerCase();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }

    @GetMapping("/{id}/export-answer-key")
    @Operation(summary = "Export answer key",
            description = "Exports the answer key to PDF or DOCX format")
    public ResponseEntity<byte[]> exportAnswerKey(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id,
            @Parameter(description = "Export format (pdf, docx)") @RequestParam(defaultValue = "pdf") String format) {
        log.info("Exporting answer key for exam {} to format: {}", id, format);
        byte[] content = examService.exportAnswerKey(id, format);
        
        String contentType = format.equalsIgnoreCase("pdf") 
                ? MediaType.APPLICATION_PDF_VALUE 
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        String filename = "answer_key_" + id + "." + format.toLowerCase();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }

    // ==================== Clone ====================

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Clone exam",
            description = "Creates a copy of an exam including all questions")
    public ResponseEntity<ExamResponse> cloneExam(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id) {
        log.info("Cloning exam: {}", id);
        ExamResponse exam = examService.cloneExam(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(exam);
    }

    // ==================== Statistics ====================

    @GetMapping("/{id}/statistics")
    @Operation(summary = "Get exam statistics",
            description = "Returns statistics about the exam including question distribution by cognitive level and lesson")
    public ResponseEntity<ExamStatisticsResponse> getExamStatistics(
            @Parameter(description = "Exam ID", required = true) @PathVariable Long id) {
        log.info("Getting statistics for exam: {}", id);
        ExamStatisticsResponse statistics = examService.getExamStatistics(id);
        return ResponseEntity.ok(statistics);
    }

    // ==================== My Exams ====================

    @GetMapping("/my-exams")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get my exams",
            description = "Returns all exams created by the current user")
    public ResponseEntity<List<ExamResponse>> getMyExams() {
        log.info("Fetching exams for current user");
        List<ExamResponse> exams = examService.getMyExams();
        return ResponseEntity.ok(exams);
    }
}
