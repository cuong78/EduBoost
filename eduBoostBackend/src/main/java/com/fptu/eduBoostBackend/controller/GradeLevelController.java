package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.CreateGradeLevelRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateGradeLevelRequest;
import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelDetailResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelSimpleResponse;
import com.fptu.eduBoostBackend.service.GradeLevelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grade-levels")
@RequiredArgsConstructor
@Tag(name = "Grade Level", description = "Grade Level management APIs")
@SecurityRequirement(name = "api")
public class GradeLevelController {

    private final GradeLevelService gradeLevelService;

    @GetMapping("/with-stats")
    @Operation(summary = "Get all grade levels with statistics", 
               description = "Retrieve all grade levels with class count and student count")
    public ResponseEntity<List<GradeLevelDetailResponse>> getAllGradeLevelsWithStats() {
        List<GradeLevelDetailResponse> gradeLevels = gradeLevelService.getAllGradeLevelsWithStats();
        return ResponseEntity.ok(gradeLevels);
    }

    @GetMapping
    @Operation(summary = "Get all grade levels", description = "Retrieve all grade levels")
    public ResponseEntity<List<GradeLevelSimpleResponse>> getAllGradeLevels() {
        List<GradeLevelSimpleResponse> gradeLevels = gradeLevelService.getAllGradeLevels();
        return ResponseEntity.ok(gradeLevels);
    }

    @GetMapping("/{gradeLevelId}")
    @Operation(summary = "Get grade level by ID", description = "Retrieve a specific grade level by its ID")
    public ResponseEntity<GradeLevelSimpleResponse> getGradeLevelById(
            @Parameter(description = "Grade Level ID", required = true)
            @PathVariable Long gradeLevelId) {
        GradeLevelSimpleResponse gradeLevel = gradeLevelService.getGradeLevelById(gradeLevelId);
        return ResponseEntity.ok(gradeLevel);
    }

    @GetMapping("/{gradeLevelId}/detail")
    @Operation(summary = "Get grade level detail with statistics", 
               description = "Retrieve a specific grade level with class count and student count")
    public ResponseEntity<GradeLevelDetailResponse> getGradeLevelDetailById(
            @Parameter(description = "Grade Level ID", required = true)
            @PathVariable Long gradeLevelId) {
        GradeLevelDetailResponse gradeLevel = gradeLevelService.getGradeLevelDetailById(gradeLevelId);
        return ResponseEntity.ok(gradeLevel);
    }

    @GetMapping("/{gradeLevelId}/classes")
    @Operation(summary = "Get classes by grade level ID", description = "Retrieve all classes belonging to a specific grade level")
    public ResponseEntity<List<ClassResponse>> getClassesByGradeId(
            @Parameter(description = "Grade Level ID", required = true)
            @PathVariable Long gradeLevelId) {
        List<ClassResponse> classes = gradeLevelService.getClassesByGradeId(gradeLevelId);
        return ResponseEntity.ok(classes);
    }

    @PostMapping
    @Operation(summary = "Create new grade level", description = "Create a new grade level")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GradeLevelSimpleResponse> createGradeLevel(
            @Valid @RequestBody CreateGradeLevelRequest request) {
        GradeLevelSimpleResponse gradeLevel = gradeLevelService.createGradeLevel(request);
        return ResponseEntity.ok(gradeLevel);
    }

    @PutMapping("/{gradeLevelId}")
    @Operation(summary = "Update grade level", description = "Update an existing grade level")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GradeLevelSimpleResponse> updateGradeLevel(
            @Parameter(description = "Grade Level ID", required = true)
            @PathVariable Long gradeLevelId,
            @Valid @RequestBody UpdateGradeLevelRequest request) {
        GradeLevelSimpleResponse gradeLevel = gradeLevelService.updateGradeLevel(gradeLevelId, request);
        return ResponseEntity.ok(gradeLevel);
    }

    @DeleteMapping("/{gradeLevelId}")
    @Operation(summary = "Delete grade level", description = "Delete a grade level (only if no classes exist)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGradeLevel(
            @Parameter(description = "Grade Level ID", required = true)
            @PathVariable Long gradeLevelId) {
        gradeLevelService.deleteGradeLevel(gradeLevelId);
        return ResponseEntity.noContent().build();
    }
}
