package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.LessonResourceRequest;
import com.fptu.eduBoostBackend.dto.response.LessonResourceResponse;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.service.LessonResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Lesson Resource Management", description = "APIs for managing lesson resources")
public class LessonResourceController {

    private final LessonResourceService lessonResourceService;

    @GetMapping("/lessons/{lessonId}/resources")
    @Operation(summary = "Get resources by lesson",
            description = "Returns a list of resources for a specific lesson")
    public ResponseEntity<List<LessonResourceResponse>> getResourcesByLesson(
            @Parameter(description = "Lesson ID", required = true)
            @PathVariable Long lessonId) {

        List<LessonResourceResponse> resources =
                lessonResourceService.getResourcesByLesson(lessonId);

        return ResponseEntity.ok(resources);
    }

    @GetMapping("/resources/{id}")
    @Operation(summary = "Get resource by ID",
            description = "Returns detailed information of a specific resource")
    public ResponseEntity<LessonResourceResponse> getResourceById(
            @Parameter(description = "Resource ID", required = true)
            @PathVariable Long id) {

        LessonResourceResponse resource =
                lessonResourceService.getResourceById(id);

        return ResponseEntity.ok(resource);
    }

    @PostMapping(value = "/resources/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload DOCX resource",
            description = "Uploads a DOCX file resource")
    public ResponseEntity<LessonResourceResponse> uploadFileResource(
            @RequestParam("lessonId") Long lessonId,
            @RequestParam(value = "resourceName", required = false) String resourceName,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading DOCX file for lesson: {}, size: {}",
                lessonId, file.getSize());

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("DOCX file is required");
        }

        String filename = file.getOriginalFilename();

        if (filename == null || !filename.toLowerCase().endsWith(".docx")) {
            throw new BadRequestException("Only DOCX files are allowed");
        }

        LessonResourceRequest request = new LessonResourceRequest();
        request.setLessonId(lessonId);
        request.setResourceType(LessonResourceType.DOCX);
        request.setResourceName(resourceName);

        LessonResourceResponse resource =
                lessonResourceService.uploadResource(file, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(resource);
    }

    @GetMapping("/resources/{id}/download")
    @Operation(summary = "Download resource file",
            description = "Downloads the DOCX file associated with a resource")
    public ResponseEntity<Resource> downloadResource(
            @Parameter(description = "Resource ID", required = true)
            @PathVariable Long id) {

        LessonResourceResponse resourceInfo =
                lessonResourceService.getResourceById(id);

        Resource resource =
                lessonResourceService.downloadResource(id);

        String contentType = resourceInfo.getMimeType() != null
                ? resourceInfo.getMimeType()
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        String filename = resource.getFilename();

        if (filename == null || filename.isEmpty()) {
            filename = resourceInfo.getResourceName() != null
                    ? resourceInfo.getResourceName()
                    : "document.docx";

            if (!filename.endsWith(".docx")) {
                filename += ".docx";
            }
        }

        String headerValue = "attachment; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
    }

    @DeleteMapping("/resources/{id}")
    @Operation(summary = "Delete resource",
            description = "Deletes a resource")
    public ResponseEntity<Void> deleteResource(
            @Parameter(description = "Resource ID", required = true)
            @PathVariable Long id) {

        lessonResourceService.deleteResource(id);

        return ResponseEntity.noContent().build();
    }
}