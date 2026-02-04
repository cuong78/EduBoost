package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.LessonRequest;
import com.fptu.eduBoostBackend.dto.response.LessonResponse;
import com.fptu.eduBoostBackend.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Lesson Management", description = "APIs for managing lessons")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/chapters/{chapterId}/lessons")
    @Operation(summary = "Get lessons by chapter",
            description = "Returns a list of lessons for a specific chapter")
    public ResponseEntity<List<LessonResponse>> getLessonsByChapter(
            @Parameter(description = "Chapter ID", required = true)
            @PathVariable Long chapterId) {
        List<LessonResponse> lessons = lessonService.getLessonsByChapter(chapterId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/lessons/{id}")
    @Operation(summary = "Get lesson by ID",
            description = "Returns detailed information of a specific lesson")
    public ResponseEntity<LessonResponse> getLessonById(
            @Parameter(description = "Lesson ID", required = true)
            @PathVariable Long id) {
        LessonResponse lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(lesson);
    }

    @PostMapping("/lessons")
    @Operation(summary = "Create new lesson",
            description = "Creates a new lesson (Admin only)")
    public ResponseEntity<LessonResponse> createLesson(
            @Valid @RequestBody LessonRequest request) {
        LessonResponse lesson = lessonService.createLesson(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(lesson);
    }

    @PutMapping("/lessons/{id}")
    @Operation(summary = "Update lesson",
            description = "Updates an existing lesson (Admin only)")
    public ResponseEntity<LessonResponse> updateLesson(
            @Parameter(description = "Lesson ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody LessonRequest request) {
        LessonResponse lesson = lessonService.updateLesson(id, request);
        return ResponseEntity.ok(lesson);
    }

    @DeleteMapping("/lessons/{id}")
    @Operation(summary = "Delete lesson",
            description = "Deletes a lesson (Admin only)")
    public ResponseEntity<Void> deleteLesson(
            @Parameter(description = "Lesson ID", required = true)
            @PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}