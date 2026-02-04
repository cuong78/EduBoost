package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.ChapterRequest;
import com.fptu.eduBoostBackend.dto.response.ChapterResponse;
import com.fptu.eduBoostBackend.service.ChapterService;
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
@Tag(name = "Chapter Management", description = "APIs for managing chapters")
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping("/subjects/{subjectId}/chapters")
    @Operation(summary = "Get chapters by subject", 
               description = "Returns a list of chapters for a specific subject, optionally filtered by grade level")
    public ResponseEntity<List<ChapterResponse>> getChaptersBySubject(
            @Parameter(description = "Subject ID", required = true)
            @PathVariable Long subjectId,
            @Parameter(description = "Grade level filter (optional)")
            @RequestParam(required = false) Integer gradeLevel) {
        List<ChapterResponse> chapters = chapterService.getChaptersBySubject(subjectId, gradeLevel);
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/chapters/{id}")
    @Operation(summary = "Get chapter by ID", 
               description = "Returns detailed information of a specific chapter")
    public ResponseEntity<ChapterResponse> getChapterById(
            @Parameter(description = "Chapter ID", required = true)
            @PathVariable Long id) {
        ChapterResponse chapter = chapterService.getChapterById(id);
        return ResponseEntity.ok(chapter);
    }

    @PostMapping("/subjects/{subjectId}/chapters")
    @Operation(summary = "Create new chapter",
               description = "Creates a new chapter for a specific subject (Admin/Teacher only)")
    public ResponseEntity<ChapterResponse> createChapter(
            @Parameter(description = "Subject ID", required = true)
            @PathVariable Long subjectId,
            @Valid @RequestBody ChapterRequest request) {
        ChapterResponse chapter = chapterService.createChapter(subjectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(chapter);
    }

    @PutMapping("/chapters/{id}")
    @Operation(summary = "Update chapter",
               description = "Updates an existing chapter (Admin/Teacher only)")
    public ResponseEntity<ChapterResponse> updateChapter(
            @Parameter(description = "Chapter ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody ChapterRequest request) {
        ChapterResponse chapter = chapterService.updateChapter(id, request);
        return ResponseEntity.ok(chapter);
    }

    @DeleteMapping("/chapters/{id}")
    @Operation(summary = "Delete chapter",
               description = "Deletes a chapter (Admin only)")
    public ResponseEntity<Void> deleteChapter(
            @Parameter(description = "Chapter ID", required = true)
            @PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.noContent().build();
    }
}
