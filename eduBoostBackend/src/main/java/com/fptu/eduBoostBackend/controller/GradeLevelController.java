package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelSimpleResponse;
import com.fptu.eduBoostBackend.service.GradeLevelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grade-levels")
@RequiredArgsConstructor
@Tag(name = "Grade Level", description = "Grade Level management APIs")
@SecurityRequirement(name = "api")
public class GradeLevelController {

    private final GradeLevelService gradeLevelService;

    @GetMapping
    @Operation(summary = "Get all grade levels", description = "Retrieve all grade levels without classes")
    public ResponseEntity<List<GradeLevelSimpleResponse>> getAllGradeLevels() {
        List<GradeLevelSimpleResponse> gradeLevels = gradeLevelService.getAllGradeLevels();
        return ResponseEntity.ok(gradeLevels);
    }

    @GetMapping("/{gradeLevelId}/classes")
    @Operation(summary = "Get classes by grade level ID", description = "Retrieve all classes belonging to a specific grade level")
    public ResponseEntity<List<ClassResponse>> getClassesByGradeId(@PathVariable Long gradeLevelId) {
        List<ClassResponse> classes = gradeLevelService.getClassesByGradeId(gradeLevelId);
        return ResponseEntity.ok(classes);
    }
}
