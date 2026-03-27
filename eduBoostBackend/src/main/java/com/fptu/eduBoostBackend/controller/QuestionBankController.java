package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.QuestionBankImportRequest;
import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.service.FileStorageService;
import com.fptu.eduBoostBackend.service.QuestionBankService;
import com.fptu.eduBoostBackend.service.WordImportService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Question Bank Management", description = "APIs for managing question bank")
public class QuestionBankController {

    private final QuestionBankService questionBankService;
    private final WordImportService wordImportService;
    private final FileStorageService fileStorageService;

    @GetMapping("/question-bank")
    @Operation(summary = "Get questions with filters (paginated)",
            description = "Returns a paginated list of questions filtered by lessonId, cognitiveLevelId, sourceType, and chapterId.")
    public ResponseEntity<Page<QuestionBankResponse>> getQuestions(
            @Parameter(description = "Lesson ID") @RequestParam(required = false) Long lessonId,
            @Parameter(description = "Cognitive Level ID") @RequestParam(required = false) Long cognitiveLevelId,
            @Parameter(description = "Source type") @RequestParam(required = false) QuestionSourceType sourceType,
            @Parameter(description = "Chapter ID") @RequestParam(required = false) Long chapterId,
            @Parameter(description = "Created By User ID") @RequestParam(required = false) Long createdById,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching questions with filters (paged)");
        Page<QuestionBankResponse> questions = questionBankService.getQuestionsPaged(lessonId, cognitiveLevelId, sourceType, chapterId, createdById, pageable);
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

    // ====== WORD IMPORT ======

    @PostMapping(value = "/question-bank/import-word", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import questions from Word (.docx) file",
            description = "Parses a Word document to extract questions, math formulas (LaTeX), and images (MinIO). "
                    + "Auto-detects question types: MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK.")
    public ResponseEntity<List<QuestionBankResponse>> importFromWord(
            @Parameter(description = "Word (.docx) file", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Lesson ID to associate questions with", required = true)
            @RequestParam("lessonId") Long lessonId,
            @Parameter(description = "Use AI to auto-classify cognitive levels")
            @RequestParam(value = "useAiClassification", defaultValue = "true") boolean useAiClassification) {

        log.info("Importing questions from Word file: {}, lessonId: {}", file.getOriginalFilename(), lessonId);

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".docx")) {
            return ResponseEntity.badRequest().build();
        }

        List<QuestionBankResponse> questions = wordImportService.importFromWord(file, lessonId, useAiClassification);
        return ResponseEntity.status(HttpStatus.CREATED).body(questions);
    }

    // ====== IMAGE UPLOAD ======

    @PostMapping(value = "/question-bank/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image for a question",
            description = "Uploads an image to MinIO and returns the object key (URL)")
    public ResponseEntity<Map<String, String>> uploadImage(
            @Parameter(description = "Image file", required = true)
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading question image: {}", file.getOriginalFilename());
        String objectKey = fileStorageService.storeFile(file);
        return ResponseEntity.ok(Map.of("imageUrl", objectKey));
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
