package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.SubjectRequest;
import com.fptu.eduBoostBackend.dto.response.SubjectResponse;
import com.fptu.eduBoostBackend.service.SubjectService;
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
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Subject Management", description = "APIs for managing subjects")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @Operation(summary = "Get all subjects", 
               description = "Returns a list of all subjects in the system")
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        List<SubjectResponse> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subject by ID", 
               description = "Returns detailed information of a specific subject")
    public ResponseEntity<SubjectResponse> getSubjectById(
            @Parameter(description = "Subject ID", required = true)
            @PathVariable Long id) {
        SubjectResponse subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(subject);
    }

    @PostMapping
    @Operation(summary = "Create new subject",
               description = "Creates a new subject (Admin only)")
    public ResponseEntity<SubjectResponse> createSubject(
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse subject = subjectService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(subject);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update subject",
               description = "Updates an existing subject (Admin only)")
    public ResponseEntity<SubjectResponse> updateSubject(
            @Parameter(description = "Subject ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        SubjectResponse subject = subjectService.updateSubject(id, request);
        return ResponseEntity.ok(subject);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete subject",
               description = "Deletes a subject (Admin only)")
    public ResponseEntity<Void> deleteSubject(
            @Parameter(description = "Subject ID", required = true)
            @PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }
}
