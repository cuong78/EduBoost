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

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonResourceServiceImpl implements LessonResourceService {

    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final FileStorageService fileStorageService;
    private final DocumentProcessingService documentProcessingService;

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024;

    @Override
    @Transactional(readOnly = true)
    public List<LessonResourceResponse> getResourcesByLesson(Long lessonId) {

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        return lessonResourceRepository.findByLesson(lesson)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResourceResponse getResourceById(Long id) {

        LessonResource resource = lessonResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        return mapToResponse(resource);
    }

    @Override
    @Transactional
    public LessonResourceResponse uploadResource(MultipartFile file, LessonResourceRequest request) {

        log.info("Uploading DOCX resource for lesson: {}", request.getLessonId());

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User uploadedBy = (User) authentication.getPrincipal();

        if (request.getResourceType() != LessonResourceType.DOCX) {
            throw new BadRequestException("Only DOCX resources are supported");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("DOCX file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 100MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".docx")) {
            throw new BadRequestException("Uploaded file must be a DOCX document");
        }

        LessonResource resource = new LessonResource();
        resource.setLesson(lesson);
        resource.setUploadedBy(uploadedBy);
        resource.setResourceType(LessonResourceType.DOCX);

        if (request.getResourceName() != null && !request.getResourceName().trim().isEmpty()) {
            resource.setResourceName(request.getResourceName());
        } else {
            resource.setResourceName(StringUtils.cleanPath(filename));
        }

        String objectKey = fileStorageService.storeFile(file);

        resource.setFilePath(objectKey);
        resource.setFileSize(file.getSize());
        resource.setMimeType(file.getContentType());

        try {

            DocumentExtractionResult extraction = documentProcessingService.extractContent(file);

            resource.setExtractedContent(extraction.getContent());

            log.info("Extraction success - words: {}, pages: {}",
                    extraction.getWordCount(),
                    extraction.getPageCount());

        } catch (IOException e) {
            log.warn("Failed to extract DOCX content: {}", e.getMessage());
        }

        LessonResource saved = lessonResourceRepository.save(resource);

        log.info("DOCX uploaded successfully - id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadResource(Long id) {

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

        LessonResource resource = lessonResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (resource.getFilePath() != null) {
            fileStorageService.deleteFile(resource.getFilePath());
        }

        lessonResourceRepository.delete(resource);
    }

    private LessonResourceResponse mapToResponse(LessonResource resource) {

        String uploadedByName = resource.getUploadedBy() != null
                ? resource.getUploadedBy().getFullName()
                : null;

        return LessonResourceResponse.builder()
                .id(resource.getId())
                .lessonId(resource.getLesson().getId())
                .lessonName(resource.getLesson().getLessonName())
                .resourceName(resource.getResourceName())
                .resourceType(resource.getResourceType())
                .downloadUrl("/api/resources/" + resource.getId() + "/download")
                .fileSize(resource.getFileSize())
                .mimeType(resource.getMimeType())
                .hasExtractedContent(resource.getExtractedContent() != null
                        && !resource.getExtractedContent().trim().isEmpty())
                .uploadedAt(resource.getUploadedAt())
                .uploadedByName(uploadedByName)
                .build();
    }
}