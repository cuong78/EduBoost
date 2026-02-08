package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateClassRequest;
import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSimpleResponse;
import com.fptu.eduBoostBackend.service.ClassService;
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
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Class Management", description = "APIs for managing classes")
public class ClassController {

    private final ClassService classService;

    @GetMapping
    @Operation(summary = "Get all classes", 
               description = "Returns a list of all classes in the system")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        List<ClassResponse> classes = classService.getAllClasses();
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/{classId}")
    @Operation(summary = "Get class by ID", 
               description = "Returns detailed information of a specific class")
    public ResponseEntity<ClassResponse> getClassById(
            @Parameter(description = "Class ID", required = true)
            @PathVariable String classId) {
        ClassResponse classResponse = classService.getClassById(classId);
        return ResponseEntity.ok(classResponse);
    }

    @GetMapping("/grade/{gradeLevelId}")
    @Operation(summary = "Get classes by grade level ID", 
               description = "Returns all classes belonging to a specific grade level")
    public ResponseEntity<List<ClassResponse>> getClassesByGradeId(
            @Parameter(description = "Grade Level ID", required = true)
            @PathVariable Long gradeLevelId) {
        List<ClassResponse> classes = classService.getClassesByGradeId(gradeLevelId);
        return ResponseEntity.ok(classes);
    }

    @PostMapping
    @Operation(summary = "Create new class", 
               description = "Creates a new class with the provided information")
    public ResponseEntity<ClassResponse> createClass(
            @Valid @RequestBody CreateClassRequest request) {
        ClassResponse createdClass = classService.createClass(request);
        return ResponseEntity.ok(createdClass);
    }

    @PutMapping("/{classId}")
    @Operation(summary = "Update class information", 
               description = "Updates class information including name, teacher, school year, and status")
    public ResponseEntity<ClassResponse> updateClass(
            @Parameter(description = "Class ID", required = true)
            @PathVariable String classId,
            @Valid @RequestBody UpdateClassRequest request) {
        ClassResponse updatedClass = classService.updateClass(classId, request);
        return ResponseEntity.ok(updatedClass);
    }

    @DeleteMapping("/{classId}")
    @Operation(summary = "Delete class", 
               description = "Deletes a class (only if no students are enrolled)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClass(
            @Parameter(description = "Class ID", required = true)
            @PathVariable String classId) {
        classService.deleteClass(classId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/teachers")
    @Operation(summary = "Get all available teachers", 
               description = "Returns a list of all teachers available for class assignment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherSimpleResponse>> getAllAvailableTeachers() {
        List<TeacherSimpleResponse> teachers = classService.getAllAvailableTeachers();
        return ResponseEntity.ok(teachers);
    }
}
