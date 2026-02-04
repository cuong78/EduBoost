package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.QuestionBankImportRequest;
import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.service.QuestionBankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Question Bank Management", description = "APIs for managing question bank")
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    @GetMapping("/question-bank")
    @Operation(summary = "Get questions with filters",
            description = "Returns a list of questions filtered by lessonId, cognitiveLevelId, and sourceType")
    public ResponseEntity<List<QuestionBankResponse>> getQuestions(
            @Parameter(description = "Lesson ID") @RequestParam(required = false) Long lessonId,
            @Parameter(description = "Cognitive Level ID") @RequestParam(required = false) Long cognitiveLevelId,
            @Parameter(description = "Source type") @RequestParam(required = false) QuestionSourceType sourceType) {
        log.info("Fetching questions with filters");
        List<QuestionBankResponse> questions = questionBankService.getQuestions(lessonId, cognitiveLevelId, sourceType);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/question-bank/{id}")
    @Operation(summary = "Get question by ID",
            description = "Returns detailed information of a specific question")
    public ResponseEntity<QuestionBankResponse> getQuestionById(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id) {
        log.info("Fetching question with id: {}", id);
        QuestionBankResponse question = questionBankService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }

    @PostMapping("/question-bank")
    @Operation(summary = "Create question",
            description = "Creates a new question in the question bank")
    public ResponseEntity<QuestionBankResponse> createQuestion(
            @Valid @RequestBody QuestionBankRequest request) {
        log.info("Creating question for lesson: {}", request.getLessonId());
        QuestionBankResponse question = questionBankService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(question);
    }

    @PutMapping("/question-bank/{id}")
    @Operation(summary = "Update question",
            description = "Updates an existing question")
    public ResponseEntity<QuestionBankResponse> updateQuestion(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id,
            @Valid @RequestBody QuestionBankRequest request) {
        log.info("Updating question with id: {}", id);
        QuestionBankResponse question = questionBankService.updateQuestion(id, request);
        return ResponseEntity.ok(question);
    }

    @DeleteMapping("/question-bank/{id}")
    @Operation(summary = "Delete question",
            description = "Deletes a question from the question bank")
    public ResponseEntity<Void> deleteQuestion(
            @Parameter(description = "Question ID", required = true) @PathVariable Long id) {
        log.info("Deleting question with id: {}", id);
        questionBankService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/question-bank/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import questions from Excel",
            description = "Imports questions from an Excel file and returns parsed questions")
    public ResponseEntity<QuestionBankImportResponse> importFromExcel(
            @Parameter(description = "Excel file", required = true) @RequestParam("file") MultipartFile file,
            @Parameter(description = "Lesson ID", required = true) @RequestParam("lessonId") Long lessonId) {
        log.info("Importing questions from Excel file: {}", file.getOriginalFilename());
        QuestionBankImportResponse response = questionBankService.importFromExcel(file, lessonId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/question-bank/batch")
    @Operation(summary = "Create questions in batch",
            description = "Creates multiple questions at once")
    public ResponseEntity<List<QuestionBankResponse>> createQuestionsBatch(
            @Valid @RequestBody QuestionBankImportRequest request) {
        log.info("Creating {} questions in batch", request.getQuestions().size());
        List<QuestionBankResponse> questions = questionBankService.createQuestionsBatch(request.getQuestions());
        return ResponseEntity.status(HttpStatus.CREATED).body(questions);
    }

    @GetMapping("/question-bank/template")
    @Operation(summary = "Download Excel template",
            description = "Downloads an Excel template for importing questions")
    public ResponseEntity<Resource> downloadTemplate() {
        log.info("Downloading Excel template");
        Resource resource = questionBankService.downloadTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=question-import-template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @GetMapping("/question-bank/stats")
    @Operation(summary = "Get question bank statistics",
            description = "Returns statistics about the question bank")
    public ResponseEntity<QuestionBankStatsResponse> getStats(
            @Parameter(description = "Subject ID") @RequestParam(required = false) Long subjectId,
            @Parameter(description = "Grade level") @RequestParam(required = false) Integer gradeLevel) {
        log.info("Fetching question bank statistics");
        QuestionBankStatsResponse stats = questionBankService.getStats(subjectId, gradeLevel);
        return ResponseEntity.ok(stats);
    }
}
