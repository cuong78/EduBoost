package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.MatrixTemplateRequest;
import com.fptu.eduBoostBackend.dto.response.MatrixTemplateResponse;
import com.fptu.eduBoostBackend.service.MatrixTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Matrix Template Management", description = "APIs for managing exam matrix templates")
public class MatrixTemplateController {

    private final MatrixTemplateService matrixTemplateService;

    @GetMapping("/matrix-templates")
    @Operation(summary = "Get matrix templates",
            description = "Returns a list of matrix templates, optionally filtered by exam type, subject, and grade level")
    public ResponseEntity<List<MatrixTemplateResponse>> getMatrixTemplates(
            @Parameter(description = "Filter by exam type ID")
            @RequestParam(required = false) Long examTypeId,
            @Parameter(description = "Filter by subject ID")
            @RequestParam(required = false) Long subjectId,
            @Parameter(description = "Filter by grade level")
            @RequestParam(required = false) Integer gradeLevel) {
        log.info("Fetching matrix templates with filters - examTypeId: {}, subjectId: {}, gradeLevel: {}", 
                examTypeId, subjectId, gradeLevel);
        List<MatrixTemplateResponse> templates = matrixTemplateService.getMatrixTemplates(examTypeId, subjectId, gradeLevel);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/matrix-templates/{id}")
    @Operation(summary = "Get matrix template by ID",
            description = "Returns detailed information of a specific matrix template including its details")
    public ResponseEntity<MatrixTemplateResponse> getMatrixTemplateById(
            @Parameter(description = "Matrix template ID", required = true)
            @PathVariable Long id) {
        log.info("Fetching matrix template by id: {}", id);
        MatrixTemplateResponse template = matrixTemplateService.getMatrixTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @PostMapping("/matrix-templates")
    @Operation(summary = "Create new matrix template",
            description = "Creates a new matrix template with cognitive level distribution")
    public ResponseEntity<MatrixTemplateResponse> createMatrixTemplate(
            @Valid @RequestBody MatrixTemplateRequest request) {
        log.info("Creating matrix template: {}", request.getTemplateName());
        MatrixTemplateResponse template = matrixTemplateService.createMatrixTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @PutMapping("/matrix-templates/{id}")
    @Operation(summary = "Update matrix template",
            description = "Updates an existing matrix template")
    public ResponseEntity<MatrixTemplateResponse> updateMatrixTemplate(
            @Parameter(description = "Matrix template ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody MatrixTemplateRequest request) {
        log.info("Updating matrix template with id: {}", id);
        MatrixTemplateResponse template = matrixTemplateService.updateMatrixTemplate(id, request);
        return ResponseEntity.ok(template);
    }

    @DeleteMapping("/matrix-templates/{id}")
    @Operation(summary = "Delete matrix template",
            description = "Deletes a matrix template")
    public ResponseEntity<Void> deleteMatrixTemplate(
            @Parameter(description = "Matrix template ID", required = true)
            @PathVariable Long id) {
        log.info("Deleting matrix template with id: {}", id);
        matrixTemplateService.deleteMatrixTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
