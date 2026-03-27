package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Serving", description = "Serve files from MinIO storage")
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/**")
    @Operation(summary = "Serve file by objectKey",
            description = "Serves a file from MinIO storage using its objectKey path (e.g., images/uuid.png)")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        // Extract objectKey from the URL path after /api/files/
        String requestUri = request.getRequestURI();
        String objectKey = requestUri.substring(requestUri.indexOf("/api/files/") + "/api/files/".length());

        // URL-decode the objectKey
        objectKey = java.net.URLDecoder.decode(objectKey, java.nio.charset.StandardCharsets.UTF_8);

        log.debug("Serving file: {}", objectKey);

        Resource resource = fileStorageService.loadFileAsResource(objectKey);

        // Determine content type from extension
        String contentType = determineContentType(objectKey);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400") // Cache 1 day
                .body(resource);
    }

    private String determineContentType(String objectKey) {
        String lower = objectKey.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".bmp")) return "image/bmp";
        if (lower.endsWith(".emf")) return "image/png"; // EMF fallback
        if (lower.endsWith(".wmf")) return "image/png"; // WMF fallback
        if (lower.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }
}
