package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.ExamTypeResponse;
import com.fptu.eduBoostBackend.entities.ExamType;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ExamTypeRepository;
import com.fptu.eduBoostBackend.service.ExamTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamTypeServiceImpl implements ExamTypeService {

    private final ExamTypeRepository examTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ExamTypeResponse> getAllExamTypes() {
        log.info("Fetching all exam types");
        return examTypeRepository.findAllOrdered().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamTypeResponse getExamTypeById(Long id) {
        log.info("Fetching exam type by id: {}", id);
        ExamType examType = examTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam type not found with id: " + id));
        return mapToResponse(examType);
    }

    private ExamTypeResponse mapToResponse(ExamType examType) {
        return ExamTypeResponse.builder()
                .id(examType.getId())
                .typeCode(examType.getTypeCode())
                .typeName(examType.getTypeName())
                .requiresMatrix(examType.getRequiresMatrix())
                .description(examType.getDescription())
                .displayOrder(examType.getDisplayOrder())
                .build();
    }
}
