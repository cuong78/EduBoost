package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.ExamTypeResponse;
import com.fptu.eduBoostBackend.service.ExamTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Exam Type Management", description = "APIs for managing exam types")
public class ExamTypeController {

    private final ExamTypeService examTypeService;

    @GetMapping("/exam-types")
    @Operation(summary = "Get all exam types",
            description = "Returns a list of all exam types ordered by display order")
    public ResponseEntity<List<ExamTypeResponse>> getAllExamTypes() {
        log.info("Fetching all exam types");
        List<ExamTypeResponse> examTypes = examTypeService.getAllExamTypes();
        return ResponseEntity.ok(examTypes);
    }

    @GetMapping("/exam-types/{id}")
    @Operation(summary = "Get exam type by ID",
            description = "Returns detailed information of a specific exam type")
    public ResponseEntity<ExamTypeResponse> getExamTypeById(
            @Parameter(description = "Exam type ID", required = true)
            @PathVariable Long id) {
        log.info("Fetching exam type by id: {}", id);
        ExamTypeResponse examType = examTypeService.getExamTypeById(id);
        return ResponseEntity.ok(examType);
    }
}
