package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.MatrixTemplateDetailRequest;
import com.fptu.eduBoostBackend.dto.request.MatrixTemplateLessonDetailRequest;
import com.fptu.eduBoostBackend.dto.request.MatrixTemplateRequest;
import com.fptu.eduBoostBackend.dto.response.MatrixTemplateDetailResponse;
import com.fptu.eduBoostBackend.dto.response.MatrixTemplateLessonDetailResponse;
import com.fptu.eduBoostBackend.dto.response.MatrixTemplateResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.MatrixTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatrixTemplateServiceImpl implements MatrixTemplateService {

    private final ExamMatrixTemplateRepository templateRepository;
    private final ExamMatrixTemplateDetailRepository detailRepository;
    private final ExamMatrixLessonDetailRepository lessonDetailRepository;
    private final ExamTypeRepository examTypeRepository;
    private final SubjectRepository subjectRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final LessonRepository lessonRepository;
    private final ExamRepository examRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MatrixTemplateResponse> getMatrixTemplates(Long examTypeId, Long subjectId, Integer gradeLevel) {
        log.info("Fetching matrix templates with filters - examTypeId: {}, subjectId: {}, gradeLevel: {}",
                examTypeId, subjectId, gradeLevel);

        // Scope to current user: own templates + templates used in PUBLISHED exams
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<ExamMatrixTemplate> templates;
        if (isAdmin) {
            // Admin sees everything
            templates = templateRepository.findByFilters(examTypeId, subjectId, gradeLevel);
        } else {
            templates = templateRepository.findVisibleToUser(
                    currentUser.getUserId(), examTypeId, subjectId, gradeLevel);
        }
        return templates.stream()
                .map(this::mapToResponseWithDetails)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MatrixTemplateResponse getMatrixTemplateById(Long id) {
        log.info("Fetching matrix template by id: {}", id);
        ExamMatrixTemplate template = templateRepository.findByIdWithDetails(id);
        if (template == null) {
            throw new ResourceNotFoundException("Matrix template not found with id: " + id);
        }

        // Visibility check: non-owner can only see template if it's used in a PUBLISHED exam
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = template.getCreatedBy() != null &&
                template.getCreatedBy().getUserId().equals(currentUser.getUserId());
        if (!isOwner && !isAdmin) {
            // Check if this template is used in any PUBLISHED exam
            boolean usedInPublished = examRepository.existsByMatrixTemplateIdAndStatus(
                    id, com.fptu.eduBoostBackend.entities.enums.ExamStatus.PUBLISHED);
            if (!usedInPublished) {
                throw new ResourceNotFoundException("Matrix template not found with id: " + id);
            }
        }

        return mapToResponseWithDetails(template);
    }

    @Override
    @Transactional
    public MatrixTemplateResponse createMatrixTemplate(MatrixTemplateRequest request) {
        log.info("Creating matrix template: {}", request.getTemplateName());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        ExamType examType = examTypeRepository.findById(request.getExamTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam type not found with id: " + request.getExamTypeId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        // Calculate total questions from Part 1 details
        int totalQuestions = request.getDetails().stream()
                .mapToInt(MatrixTemplateDetailRequest::getNumberOfQuestions)
                .sum();

        ExamMatrixTemplate template = ExamMatrixTemplate.builder()
                .templateName(request.getTemplateName())
                .examType(examType)
                .subject(subject)
                .gradeLevel(request.getGradeLevel())
                .totalQuestions(totalQuestions)
                .description(request.getDescription())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .createdBy(currentUser)
                .build();

        template = templateRepository.save(template);

        // Create Part 1 details (by cognitive level)
        List<ExamMatrixTemplateDetail> details = createCognitiveLevelDetails(template, request.getDetails());

        // Create Part 2 details (by lesson × cognitive level)
        List<ExamMatrixLessonDetail> lessonDetails = new ArrayList<>();
        if (request.getLessonDetails() != null && !request.getLessonDetails().isEmpty()) {
            lessonDetails = createLessonDetails(template, request.getLessonDetails());
        }

        MatrixTemplateResponse response = mapToResponse(template);
        response.setDetails(details.stream().map(this::mapDetailToResponse).collect(Collectors.toList()));
        response.setLessonDetails(lessonDetails.stream().map(this::mapLessonDetailToResponse).collect(Collectors.toList()));
        response.setTotalPoints(calculateTotalPoints(details));

        return response;
    }

    @Override
    @Transactional
    public MatrixTemplateResponse updateMatrixTemplate(Long id, MatrixTemplateRequest request) {
        log.info("Updating matrix template with id: {}", id);

        ExamMatrixTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix template not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Only owner or ADMIN can edit
        if (template.getCreatedBy() != null &&
            !template.getCreatedBy().getUserId().equals(currentUser.getUserId()) &&
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only edit templates you created");
        }

        if (request.getExamTypeId() != null) {
            ExamType examType = examTypeRepository.findById(request.getExamTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exam type not found with id: " + request.getExamTypeId()));
            template.setExamType(examType);
        }
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
            template.setSubject(subject);
        }
        if (request.getTemplateName() != null) template.setTemplateName(request.getTemplateName());
        if (request.getGradeLevel() != null) template.setGradeLevel(request.getGradeLevel());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getIsDefault() != null) template.setIsDefault(request.getIsDefault());

        // Update Part 1 details
        List<ExamMatrixTemplateDetail> details;
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            detailRepository.deleteByTemplateId(id);
            int totalQuestions = request.getDetails().stream()
                    .mapToInt(MatrixTemplateDetailRequest::getNumberOfQuestions)
                    .sum();
            template.setTotalQuestions(totalQuestions);
            details = createCognitiveLevelDetails(template, request.getDetails());
        } else {
            details = detailRepository.findByTemplateIdWithCognitiveLevel(id);
        }

        // Update Part 2 details
        List<ExamMatrixLessonDetail> lessonDetails;
        if (request.getLessonDetails() != null) {
            lessonDetailRepository.deleteByTemplateId(id);
            lessonDetails = request.getLessonDetails().isEmpty()
                    ? new ArrayList<>()
                    : createLessonDetails(template, request.getLessonDetails());
        } else {
            lessonDetails = lessonDetailRepository.findByTemplateIdWithDetails(id);
        }

        template = templateRepository.save(template);

        MatrixTemplateResponse response = mapToResponse(template);
        response.setDetails(details.stream().map(this::mapDetailToResponse).collect(Collectors.toList()));
        response.setLessonDetails(lessonDetails.stream().map(this::mapLessonDetailToResponse).collect(Collectors.toList()));
        response.setTotalPoints(calculateTotalPoints(details));

        return response;
    }

    @Override
    @Transactional
    public void deleteMatrixTemplate(Long id) {
        log.info("Deleting matrix template with id: {}", id);

        ExamMatrixTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix template not found with id: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (template.getCreatedBy() != null &&
            !template.getCreatedBy().getUserId().equals(currentUser.getUserId()) &&
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only delete templates you created");
        }

        // Check if any exam is using this matrix template
        if (examRepository.existsByMatrixTemplateId(id)) {
            throw new BadRequestException(
                "Ma trận này đang được sử dụng bởi đề thi. Vui lòng xóa các đề thi liên quan trước khi xóa ma trận.");
        }

        lessonDetailRepository.deleteByTemplateId(id);
        detailRepository.deleteByTemplateId(id);
        templateRepository.delete(template);
    }

    // ====================== Private helpers ======================

    private List<ExamMatrixTemplateDetail> createCognitiveLevelDetails(ExamMatrixTemplate template,
                                                                        List<MatrixTemplateDetailRequest> detailRequests) {
        List<ExamMatrixTemplateDetail> details = new ArrayList<>();
        for (MatrixTemplateDetailRequest req : detailRequests) {
            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(req.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + req.getCognitiveLevelId()));

            BigDecimal totalPoints = req.getPointsPerQuestion()
                    .multiply(BigDecimal.valueOf(req.getNumberOfQuestions()));

            ExamMatrixTemplateDetail detail = ExamMatrixTemplateDetail.builder()
                    .template(template)
                    .cognitiveLevel(cognitiveLevel)
                    .numberOfQuestions(req.getNumberOfQuestions())
                    .pointsPerQuestion(req.getPointsPerQuestion())
                    .totalPoints(totalPoints)
                    .build();

            details.add(detailRepository.save(detail));
        }
        return details;
    }

    private List<ExamMatrixLessonDetail> createLessonDetails(ExamMatrixTemplate template,
                                                               List<MatrixTemplateLessonDetailRequest> lessonDetailRequests) {
        List<ExamMatrixLessonDetail> lessonDetails = new ArrayList<>();
        for (MatrixTemplateLessonDetailRequest req : lessonDetailRequests) {
            if (req.getNumberOfQuestions() == null || req.getNumberOfQuestions() < 0) continue;

            Lesson lesson = lessonRepository.findById(req.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + req.getLessonId()));

            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(req.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + req.getCognitiveLevelId()));

            ExamMatrixLessonDetail lessonDetail = ExamMatrixLessonDetail.builder()
                    .template(template)
                    .lesson(lesson)
                    .cognitiveLevel(cognitiveLevel)
                    .numberOfQuestions(req.getNumberOfQuestions())
                    .build();

            lessonDetails.add(lessonDetailRepository.save(lessonDetail));
        }
        return lessonDetails;
    }

    private MatrixTemplateResponse mapToResponse(ExamMatrixTemplate template) {
        return MatrixTemplateResponse.builder()
                .id(template.getId())
                .templateName(template.getTemplateName())
                .examTypeId(template.getExamType().getId())
                .examTypeName(template.getExamType().getTypeName())
                .subjectId(template.getSubject().getId())
                .subjectCode(template.getSubject().getSubjectCode())
                .subjectName(template.getSubject().getDescription())
                .gradeLevel(template.getGradeLevel())
                .totalQuestions(template.getTotalQuestions())
                .description(template.getDescription())
                .isDefault(template.getIsDefault())
                .createdById(template.getCreatedBy() != null ? template.getCreatedBy().getUserId() : null)
                .createdByName(template.getCreatedBy() != null ? template.getCreatedBy().getFullName() : null)
                .createdAt(template.getCreatedAt())
                .build();
    }

    private MatrixTemplateResponse mapToResponseWithDetails(ExamMatrixTemplate template) {
        MatrixTemplateResponse response = mapToResponse(template);

        // Part 1: by cognitive level
        List<ExamMatrixTemplateDetail> details = detailRepository.findByTemplateIdWithCognitiveLevel(template.getId());
        response.setDetails(details.stream().map(this::mapDetailToResponse).collect(Collectors.toList()));
        response.setTotalPoints(calculateTotalPoints(details));

        // Part 2: by lesson x cognitive level
        List<ExamMatrixLessonDetail> lessonDetails = lessonDetailRepository.findByTemplateIdWithDetails(template.getId());
        response.setLessonDetails(lessonDetails.stream().map(this::mapLessonDetailToResponse).collect(Collectors.toList()));

        return response;
    }

    private MatrixTemplateDetailResponse mapDetailToResponse(ExamMatrixTemplateDetail detail) {
        return MatrixTemplateDetailResponse.builder()
                .id(detail.getId())
                .cognitiveLevelId(detail.getCognitiveLevel().getId())
                .cognitiveLevelName(detail.getCognitiveLevel().getLevel())
                .numberOfQuestions(detail.getNumberOfQuestions())
                .pointsPerQuestion(detail.getPointsPerQuestion())
                .totalPoints(detail.getTotalPoints())
                .build();
    }

    private MatrixTemplateLessonDetailResponse mapLessonDetailToResponse(ExamMatrixLessonDetail detail) {
        return MatrixTemplateLessonDetailResponse.builder()
                .id(detail.getId())
                .lessonId(detail.getLesson().getId())
                .lessonName(detail.getLesson().getLessonName())
                .lessonContent(detail.getLesson().getDescription())
                .lessonOrder(detail.getLesson().getLessonNumber())
                .cognitiveLevelId(detail.getCognitiveLevel().getId())
                .cognitiveLevelName(detail.getCognitiveLevel().getLevel())
                .numberOfQuestions(detail.getNumberOfQuestions())
                .build();
    }

    private BigDecimal calculateTotalPoints(List<ExamMatrixTemplateDetail> details) {
        return details.stream()
                .map(ExamMatrixTemplateDetail::getTotalPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
