package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.MatrixTemplateDetailRequest;
import com.fptu.eduBoostBackend.dto.request.MatrixTemplateRequest;
import com.fptu.eduBoostBackend.dto.response.MatrixTemplateDetailResponse;
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
    private final ExamTypeRepository examTypeRepository;
    private final SubjectRepository subjectRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MatrixTemplateResponse> getMatrixTemplates(Long examTypeId, Long subjectId, Integer gradeLevel) {
        log.info("Fetching matrix templates with filters - examTypeId: {}, subjectId: {}, gradeLevel: {}", 
                examTypeId, subjectId, gradeLevel);
        
        List<ExamMatrixTemplate> templates = templateRepository.findByFilters(examTypeId, subjectId, gradeLevel);
        
        return templates.stream()
                .map(this::mapToResponse)
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
        
        return mapToResponseWithDetails(template);
    }

    @Override
    @Transactional
    public MatrixTemplateResponse createMatrixTemplate(MatrixTemplateRequest request) {
        log.info("Creating matrix template: {}", request.getTemplateName());
        
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Validate exam type
        ExamType examType = examTypeRepository.findById(request.getExamTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam type not found with id: " + request.getExamTypeId()));
        
        // Validate subject
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
        
        // Calculate total questions from details
        int totalQuestions = request.getDetails().stream()
                .mapToInt(MatrixTemplateDetailRequest::getNumberOfQuestions)
                .sum();
        
        // Create template
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
        
        // Create details
        List<ExamMatrixTemplateDetail> details = createDetails(template, request.getDetails());
        
        // Return response with details
        MatrixTemplateResponse response = mapToResponse(template);
        response.setDetails(details.stream()
                .map(this::mapDetailToResponse)
                .collect(Collectors.toList()));
        response.setTotalPoints(calculateTotalPoints(details));
        
        return response;
    }

    @Override
    @Transactional
    public MatrixTemplateResponse updateMatrixTemplate(Long id, MatrixTemplateRequest request) {
        log.info("Updating matrix template with id: {}", id);
        
        ExamMatrixTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix template not found with id: " + id));
        
        // Get current user for authorization check
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user can edit
        if (template.getCreatedBy() != null && 
            !template.getCreatedBy().getUserId().equals(currentUser.getUserId()) && 
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only edit templates you created");
        }
        
        // Update exam type if provided
        if (request.getExamTypeId() != null) {
            ExamType examType = examTypeRepository.findById(request.getExamTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exam type not found with id: " + request.getExamTypeId()));
            template.setExamType(examType);
        }
        
        // Update subject if provided
        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
            template.setSubject(subject);
        }
        
        // Update other fields
        if (request.getTemplateName() != null) {
            template.setTemplateName(request.getTemplateName());
        }
        if (request.getGradeLevel() != null) {
            template.setGradeLevel(request.getGradeLevel());
        }
        if (request.getDescription() != null) {
            template.setDescription(request.getDescription());
        }
        if (request.getIsDefault() != null) {
            template.setIsDefault(request.getIsDefault());
        }
        
        // Update details if provided
        List<ExamMatrixTemplateDetail> details = null;
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            // Delete existing details
            detailRepository.deleteByTemplateId(id);
            
            // Calculate new total questions
            int totalQuestions = request.getDetails().stream()
                    .mapToInt(MatrixTemplateDetailRequest::getNumberOfQuestions)
                    .sum();
            template.setTotalQuestions(totalQuestions);
            
            // Create new details
            details = createDetails(template, request.getDetails());
        } else {
            details = detailRepository.findByTemplateIdWithCognitiveLevel(id);
        }
        
        template = templateRepository.save(template);
        
        // Return response with details
        MatrixTemplateResponse response = mapToResponse(template);
        response.setDetails(details.stream()
                .map(this::mapDetailToResponse)
                .collect(Collectors.toList()));
        response.setTotalPoints(calculateTotalPoints(details));
        
        return response;
    }

    @Override
    @Transactional
    public void deleteMatrixTemplate(Long id) {
        log.info("Deleting matrix template with id: {}", id);
        
        ExamMatrixTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrix template not found with id: " + id));
        
        // Get current user for authorization check
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Check if user can delete
        if (template.getCreatedBy() != null && 
            !template.getCreatedBy().getUserId().equals(currentUser.getUserId()) && 
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only delete templates you created");
        }
        
        // Delete details first
        detailRepository.deleteByTemplateId(id);
        
        // Delete template
        templateRepository.delete(template);
    }
    
    private List<ExamMatrixTemplateDetail> createDetails(ExamMatrixTemplate template, List<MatrixTemplateDetailRequest> detailRequests) {
        List<ExamMatrixTemplateDetail> details = new ArrayList<>();
        
        for (MatrixTemplateDetailRequest detailRequest : detailRequests) {
            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(detailRequest.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + detailRequest.getCognitiveLevelId()));
            
            BigDecimal totalPoints = detailRequest.getPointsPerQuestion()
                    .multiply(BigDecimal.valueOf(detailRequest.getNumberOfQuestions()));
            
            ExamMatrixTemplateDetail detail = ExamMatrixTemplateDetail.builder()
                    .template(template)
                    .cognitiveLevel(cognitiveLevel)
                    .numberOfQuestions(detailRequest.getNumberOfQuestions())
                    .pointsPerQuestion(detailRequest.getPointsPerQuestion())
                    .totalPoints(totalPoints)
                    .build();
            
            details.add(detailRepository.save(detail));
        }
        
        return details;
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
        
        List<ExamMatrixTemplateDetail> details = detailRepository.findByTemplateIdWithCognitiveLevel(template.getId());
        response.setDetails(details.stream()
                .map(this::mapDetailToResponse)
                .collect(Collectors.toList()));
        response.setTotalPoints(calculateTotalPoints(details));
        
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
    
    private BigDecimal calculateTotalPoints(List<ExamMatrixTemplateDetail> details) {
        return details.stream()
                .map(ExamMatrixTemplateDetail::getTotalPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
