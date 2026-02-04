package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.SubjectRequest;
import com.fptu.eduBoostBackend.dto.response.SubjectResponse;
import com.fptu.eduBoostBackend.entities.Subject;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.SubjectRepository;
import com.fptu.eduBoostBackend.service.SubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponse> getAllSubjects() {
        log.info("Fetching all subjects");
        List<Subject> subjects = subjectRepository.findAll();
        return subjects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectResponse getSubjectById(Long id) {
        log.info("Fetching subject with id: {}", id);
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return mapToResponse(subject);
    }

    @Override
    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        log.info("Creating new subject with code: {}", request.getSubjectCode());

        // Validate subject code uniqueness
        if (subjectRepository.existsBySubjectCode(request.getSubjectCode())) {
            throw new ConflictException("Subject code already exists: " + request.getSubjectCode());
        }

        Subject subject = Subject.builder()
                .subjectCode(request.getSubjectCode())
                .description(request.getDescription())
                .build();

        Subject savedSubject = subjectRepository.save(subject);
        log.info("Subject created successfully with id: {}", savedSubject.getId());
        return mapToResponse(savedSubject);
    }

    @Override
    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        log.info("Updating subject with id: {}", id);

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        // Validate subject code uniqueness (excluding current subject)
        if (!subject.getSubjectCode().equals(request.getSubjectCode()) &&
                subjectRepository.existsBySubjectCode(request.getSubjectCode())) {
            throw new ConflictException("Subject code already exists: " + request.getSubjectCode());
        }

        subject.setSubjectCode(request.getSubjectCode());
        subject.setDescription(request.getDescription());

        Subject updatedSubject = subjectRepository.save(subject);
        log.info("Subject updated successfully with id: {}", updatedSubject.getId());
        return mapToResponse(updatedSubject);
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        log.info("Deleting subject with id: {}", id);

        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        // TODO: Add validation if subject is used by chapters/lessons/exams
        // For now, we'll allow deletion

        subjectRepository.delete(subject);
        log.info("Subject deleted successfully with id: {}", id);
    }

    private SubjectResponse mapToResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .subjectCode(subject.getSubjectCode())
                .description(subject.getDescription())
                .createdAt(subject.getCreatedAt())
                .build();
    }
}
