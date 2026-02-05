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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        List<LessonResourceResponse> resources = lessonResourceService.getResourcesByLesson(lessonId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/resources/{id}")
    @Operation(summary = "Get resource by ID",
            description = "Returns detailed information of a specific resource")
    public ResponseEntity<LessonResourceResponse> getResourceById(
            @Parameter(description = "Resource ID", required = true)
            @PathVariable Long id) {
        LessonResourceResponse resource = lessonResourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    // For file-based resources (PDF, DOCX, VIDEO, IMAGE)
    @PostMapping(value = "/resources/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file resource",
            description = "Uploads a file resource (Admin only). For PDF, DOCX, VIDEO, IMAGE.")
    public ResponseEntity<LessonResourceResponse> uploadFileResource(
            @RequestParam("lessonId") Long lessonId,
            @RequestParam("resourceType") LessonResourceType resourceType,
            @RequestParam(value = "resourceName", required = false) String resourceName,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading file resource for lesson: {}, type: {}, file size: {}",
                lessonId, resourceType, file.getSize());

        // Create request object
        LessonResourceRequest request = new LessonResourceRequest();
        request.setLessonId(lessonId);
        request.setResourceType(resourceType);
        request.setResourceName(resourceName);

        LessonResourceResponse resource = lessonResourceService.uploadResource(file, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resource);
    }

    // For non-file resources (URL, TEXT) - uses JSON
    @PostMapping("/resources")
    @Operation(summary = "Create resource",
            description = "Creates a resource (Admin only). For URL and TEXT resources only.")
    public ResponseEntity<LessonResourceResponse> createResource(
            @Valid @RequestBody LessonResourceRequest request) {

        // Validate that it's only for URL/TEXT
        if (request.getResourceType() == LessonResourceType.PDF ||
                request.getResourceType() == LessonResourceType.DOCX ||
                request.getResourceType() == LessonResourceType.VIDEO ||
                request.getResourceType() == LessonResourceType.IMAGE) {
            throw new BadRequestException("Use /resources/file endpoint for " +
                    request.getResourceType() + " resources");
        }

        log.info("Creating resource for lesson: {}, type: {}",
                request.getLessonId(), request.getResourceType());

        LessonResourceResponse resource = lessonResourceService.uploadResource(null, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resource);
    }

    @GetMapping("/resources/{id}/download")
    @Operation(summary = "Download resource file",
            description = "Downloads the file associated with a resource")
    public ResponseEntity<Resource> downloadResource(
            @Parameter(description = "Resource ID", required = true)
            @PathVariable Long id) {

        // Get resource metadata first
        LessonResourceResponse resourceInfo = lessonResourceService.getResourceById(id);
        Resource resource = lessonResourceService.downloadResource(id);

        // Use actual MIME type from database, fallback to octet-stream
        String contentType = resourceInfo.getMimeType() != null 
                ? resourceInfo.getMimeType() 
                : "application/octet-stream";
        
        // Create filename with proper extension
        String filename = resource.getFilename();
        if (filename == null || filename.isEmpty()) {
            filename = resourceInfo.getResourceName() != null 
                    ? resourceInfo.getResourceName() 
                    : "download";
            
            // Add extension if not present
            if (!filename.contains(".")) {
                String extension = getExtensionFromMimeType(contentType, resourceInfo.getResourceType());
                filename += extension;
            }
        }

        String headerValue = "attachment; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
    }
    
    private String getExtensionFromMimeType(String mimeType, LessonResourceType resourceType) {
        // Try to get extension from MIME type first
        if (mimeType != null) {
            if (mimeType.contains("pdf")) return ".pdf";
            if (mimeType.contains("wordprocessingml") || mimeType.contains("msword")) return ".docx";
            if (mimeType.contains("video/mp4")) return ".mp4";
            if (mimeType.contains("image/jpeg")) return ".jpg";
            if (mimeType.contains("image/png")) return ".png";
        }
        
        // Fallback to resource type
        if (resourceType != null) {
            switch (resourceType) {
                case PDF: return ".pdf";
                case DOCX: return ".docx";
                case VIDEO: return ".mp4";
                case IMAGE: return ".png";
                default: return "";
            }
        }
        
        return "";
    }

    @DeleteMapping("/resources/{id}")
    @Operation(summary = "Delete resource",
            description = "Deletes a resource (Admin only)")
    public ResponseEntity<Void> deleteResource(
            @Parameter(description = "Resource ID", required = true)
            @PathVariable Long id) {
        lessonResourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

}
