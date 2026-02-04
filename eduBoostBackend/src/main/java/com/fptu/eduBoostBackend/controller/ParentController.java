package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.LinkStudentRequest;
import com.fptu.eduBoostBackend.dto.request.ValidateInvitationRequest;
import com.fptu.eduBoostBackend.dto.response.LinkStudentResponse;
import com.fptu.eduBoostBackend.dto.response.ParentStudentDetailResponse;
import com.fptu.eduBoostBackend.dto.response.ValidateInvitationResponse;
import com.fptu.eduBoostBackend.service.ParentService;
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
@RequestMapping("/api/parent")
@RequiredArgsConstructor
@Tag(name = "Parent", description = "Parent APIs for managing student invitations")
public class ParentController {

    private final ParentService parentService;

    
    @PostMapping("/link-student")
    @SecurityRequirement(name = "api")
    @Operation(
        summary = "Link parent with student",
        description = "Links an authenticated parent with a student using an invitation code. Creates a parent-student relationship and marks the invitation as used."
    )
    public ResponseEntity<LinkStudentResponse> linkStudent(
            @Valid @RequestBody LinkStudentRequest request) {
        LinkStudentResponse response = parentService.linkStudent(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/students")
    @SecurityRequirement(name = "api")
    @Operation(
        summary = "Get parent's students",
        description = "Returns a list of all students linked to the authenticated parent"
    )
    public ResponseEntity<List<ParentStudentDetailResponse>> getMyStudents() {
        List<ParentStudentDetailResponse> students = parentService.getMyStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/{studentId}")
    @SecurityRequirement(name = "api")
    @Operation(
        summary = "Get student detail",
        description = "Returns detailed information about a specific student linked to the authenticated parent"
    )
    public ResponseEntity<ParentStudentDetailResponse> getStudentDetail(
            @Parameter(description = "Student ID", required = true)
            @PathVariable String studentId) {
        ParentStudentDetailResponse student = parentService.getStudentDetail(studentId);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/students/{studentId}/unlink")
    @SecurityRequirement(name = "api")
    @Operation(
        summary = "Unlink student",
        description = "Removes the link between the authenticated parent and a specific student"
    )
    public ResponseEntity<Void> unlinkStudent(
            @Parameter(description = "Student ID", required = true)
            @PathVariable String studentId) {
        parentService.unlinkStudent(studentId);
        return ResponseEntity.noContent().build();
    }
}
