package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.DocumentExtractionResult;
import com.fptu.eduBoostBackend.dto.request.LessonResourceRequest;
import com.fptu.eduBoostBackend.dto.response.LessonResourceResponse;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.LessonResource;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.repositories.LessonResourceRepository;
import com.fptu.eduBoostBackend.service.DocumentProcessingService;
import com.fptu.eduBoostBackend.service.FileStorageService;
import com.fptu.eduBoostBackend.service.LessonResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import static com.fptu.eduBoostBackend.entities.enums.LessonResourceType.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonResourceServiceImpl implements LessonResourceService {

    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final FileStorageService fileStorageService;
    private final DocumentProcessingService documentProcessingService;

    // File size limit: 100MB
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024;

    @Override
    @Transactional(readOnly = true)
    public List<LessonResourceResponse> getResourcesByLesson(Long lessonId) {
        log.info("Fetching resources for lesson: {}", lessonId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        List<LessonResource> resources = lessonResourceRepository.findByLesson(lesson);
        return resources.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResourceResponse getResourceById(Long id) {
        log.info("Fetching resource with id: {}", id);
        LessonResource resource = lessonResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    @Override
    @Transactional
    public LessonResourceResponse uploadResource(MultipartFile file, LessonResourceRequest request) {
        log.info("Uploading resource for lesson: {}", request.getLessonId());

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User uploadedBy = (User) authentication.getPrincipal();

        // Validate based on resource type
        validateResourceRequest(request, file);

        LessonResource resource = new LessonResource();
        resource.setLesson(lesson);
        resource.setResourceName(request.getResourceName());
        resource.setResourceType(request.getResourceType());
        resource.setUploadedBy(uploadedBy);

        String extractedContent = null;

        switch (request.getResourceType()) {
            case PDF:
            case DOCX:
                // Validate file
                if (file == null || file.isEmpty()) {
                    throw new BadRequestException("File is required for PDF/DOCX resources");
                }
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new BadRequestException("File size exceeds maximum limit of 100MB");
                }

                // Upload to MinIO
                log.info("Uploading {} file to MinIO: {}", request.getResourceType(), file.getOriginalFilename());
                String objectKey = fileStorageService.storeFile(file);
                resource.setFilePath(objectKey);
                resource.setFileSize(file.getSize());
                resource.setMimeType(file.getContentType());

                // Extract content using Apache Tika for AI processing
                try {
                    log.info("Extracting content from document using Apache Tika...");
                    DocumentExtractionResult extraction = documentProcessingService.extractContent(file);
                    resource.setExtractedContent(extraction.getContent());
                    
                    log.info("Document extraction successful - Words: {}, Pages: {}, Tokens: {}", 
                            extraction.getWordCount(), extraction.getPageCount(), extraction.getEstimatedTokens());
                } catch (IOException e) {
                    log.warn("Failed to extract content from file: {}", e.getMessage());
                }
                break;

            case URL:
                if (request.getFileUrl() == null || request.getFileUrl().trim().isEmpty()) {
                    throw new BadRequestException("URL is required for URL resources");
                }
                resource.setFileUrl(request.getFileUrl());
                break;

            case TEXT:
                if (request.getTextContent() == null || request.getTextContent().trim().isEmpty()) {
                    throw new BadRequestException("Text content is required for TEXT resources");
                }
                resource.setExtractedContent(request.getTextContent());
                break;

            case VIDEO:
            case IMAGE:
                if (file == null || file.isEmpty()) {
                    throw new BadRequestException("File is required for VIDEO/IMAGE resources");
                }
                if (file.getSize() > MAX_FILE_SIZE) {
                    throw new BadRequestException("File size exceeds maximum limit of 100MB");
                }

                log.info("Uploading {} to MinIO: {}", request.getResourceType(), file.getOriginalFilename());
                String mediaKey = fileStorageService.storeFile(file);
                resource.setFilePath(mediaKey);
                resource.setFileSize(file.getSize());
                resource.setMimeType(file.getContentType());
                break;
        }

        // Set default resource name if not provided
        if (resource.getResourceName() == null || resource.getResourceName().trim().isEmpty()) {
            if (file != null) {
                resource.setResourceName(StringUtils.cleanPath(file.getOriginalFilename()));
            } else if (request.getResourceType() == LessonResourceType.TEXT) {
                resource.setResourceName("Text Content");
            } else if (request.getResourceType() == LessonResourceType.URL) {
                resource.setResourceName("External URL");
            }
        }

        LessonResource savedResource = lessonResourceRepository.save(resource);
        log.info("Resource uploaded to MinIO successfully - id: {}, objectKey: {}", 
                savedResource.getId(), savedResource.getFilePath());

        return mapToResponse(savedResource);
    }
    @Override
    @Transactional(readOnly = true)
    public Resource downloadResource(Long id) {
        log.info("Downloading resource with id: {}", id);

        LessonResource resource = lessonResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (resource.getFilePath() == null) {
            throw new BadRequestException("This resource does not have a downloadable file");
        }

        return fileStorageService.loadFileAsResource(resource.getFilePath());
    }

    @Override
    @Transactional
    public void deleteResource(Long id) {
        log.info("Deleting resource with id: {}", id);

        LessonResource resource = lessonResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        // Delete physical file if exists
        if (resource.getFilePath() != null) {
            fileStorageService.deleteFile(resource.getFilePath());
        }

        lessonResourceRepository.delete(resource);
        log.info("Resource deleted successfully with id: {}", id);
    }


    private void validateResourceRequest(LessonResourceRequest request, MultipartFile file) {
        switch (request.getResourceType()) {
            case PDF:
            case DOCX:
            case VIDEO:
            case IMAGE:
                if (file == null || file.isEmpty()) {
                    throw new BadRequestException("File is required for " +
                            request.getResourceType() + " resources");
                }
                break;
            case URL:
                if (request.getFileUrl() == null || request.getFileUrl().trim().isEmpty()) {
                    throw new BadRequestException("URL is required for URL resources");
                }
                break;
            case TEXT:
                if (request.getTextContent() == null || request.getTextContent().trim().isEmpty()) {
                    throw new BadRequestException("Text content is required for TEXT resources");
                }
                break;
        }
    }

    private LessonResourceResponse mapToResponse(LessonResource resource) {
        String uploadedByName = resource.getUploadedBy() != null ?
                resource.getUploadedBy().getFullName() : null;

        return LessonResourceResponse.builder()
                .id(resource.getId())
                .lessonId(resource.getLesson().getId())
                .lessonName(resource.getLesson().getLessonName())
                .resourceName(resource.getResourceName())
                .resourceType(resource.getResourceType())
                .fileUrl(resource.getFileUrl())
                .downloadUrl(resource.getFilePath() != null ?
                        "/api/resources/" + resource.getId() + "/download" : null)
                .fileSize(resource.getFileSize())
                .mimeType(resource.getMimeType())
                .hasExtractedContent(resource.getExtractedContent() != null &&
                        !resource.getExtractedContent().trim().isEmpty())
                .uploadedAt(resource.getUploadedAt())
                .uploadedByName(uploadedByName)
                .build();
    }
}