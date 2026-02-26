package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.CreateGradeLevelRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateGradeLevelRequest;
import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelDetailResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelSimpleResponse;
import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.GradeLevelRepository;
import com.fptu.eduBoostBackend.service.GradeLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeLevelServiceImpl implements GradeLevelService {

    private final GradeLevelRepository gradeLevelRepository;
    private final ClassRepository classRepository;

    @Override
    public List<GradeLevelDetailResponse> getAllGradeLevelsWithStats() {
        List<GradeLevel> gradeLevels = gradeLevelRepository.findAll();
        return gradeLevels.stream()
                .map(this::convertToDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GradeLevelSimpleResponse> getAllGradeLevels() {
        List<GradeLevel> gradeLevels = gradeLevelRepository.findAll();
        return gradeLevels.stream()
                .map(gradeLevel -> GradeLevelSimpleResponse.builder()
                        .gradeLevelId(gradeLevel.getGradeLevelId())
                        .gradeName(gradeLevel.getGradeName())
                        .description(gradeLevel.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public GradeLevelSimpleResponse getGradeLevelById(Long gradeLevelId) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", gradeLevelId));
        
        return GradeLevelSimpleResponse.builder()
                .gradeLevelId(gradeLevel.getGradeLevelId())
                .gradeName(gradeLevel.getGradeName())
                .description(gradeLevel.getDescription())
                .build();
    }

    @Override
    public GradeLevelDetailResponse getGradeLevelDetailById(Long gradeLevelId) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", gradeLevelId));
        
        return convertToDetailResponse(gradeLevel);
    }

    @Override
    public List<ClassResponse> getClassesByGradeId(Long gradeLevelId) {
        // Verify grade level exists
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", gradeLevelId));
        
        List<SchoolClass> classes = classRepository.findByGradeLevel(gradeLevel);
        
        return classes.stream()
                .map(classEntity -> {
                    int studentCount = classRepository.countStudentsByClassId(classEntity.getClassId());
                    String teacherName = (classEntity.getTeacher() != null) ? 
                            classEntity.getTeacher().getUser().getFullName() : null;
                    String teacherId = (classEntity.getTeacher() != null) ? 
                            classEntity.getTeacher().getTeacherId() : null;
                    
                    return ClassResponse.builder()
                            .classId(classEntity.getClassId())
                            .className(classEntity.getClassName())
                            .classCode(classEntity.getClassCode())
                            .gradeLevelName(classEntity.getGradeLevel().getGradeName())
                            .gradeLevelId(classEntity.getGradeLevel().getGradeLevelId())
                            .teacherId(teacherId)
                            .teacherName(teacherName)
                            .schoolYear(classEntity.getSchoolYear())
                            .description(classEntity.getDescription())
                            .status(classEntity.getStatus())
                            .studentCount(studentCount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GradeLevelSimpleResponse createGradeLevel(CreateGradeLevelRequest request) {
        // Check if grade name already exists
        if (gradeLevelRepository.existsByGradeName(request.getGradeName())) {
            throw new IllegalArgumentException("Grade level already exists: " + request.getGradeName());
        }

        GradeLevel gradeLevel = GradeLevel.builder()
                .gradeName(request.getGradeName())
                .description(request.getDescription())
                .build();

        GradeLevel savedGradeLevel = gradeLevelRepository.save(gradeLevel);

        return GradeLevelSimpleResponse.builder()
                .gradeLevelId(savedGradeLevel.getGradeLevelId())
                .gradeName(savedGradeLevel.getGradeName())
                .description(savedGradeLevel.getDescription())
                .build();
    }

    @Override
    @Transactional
    public GradeLevelSimpleResponse updateGradeLevel(Long gradeLevelId, UpdateGradeLevelRequest request) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", gradeLevelId));

        // Update fields if provided
        if (request.getGradeName() != null && !request.getGradeName().trim().isEmpty()) {
            // Check if new grade name already exists (excluding current grade)
            if (!gradeLevel.getGradeName().equals(request.getGradeName()) && 
                gradeLevelRepository.existsByGradeName(request.getGradeName())) {
                throw new IllegalArgumentException("Grade level already exists: " + request.getGradeName());
            }
            gradeLevel.setGradeName(request.getGradeName());
        }

        if (request.getDescription() != null) {
            gradeLevel.setDescription(request.getDescription());
        }

        GradeLevel updatedGradeLevel = gradeLevelRepository.save(gradeLevel);

        return GradeLevelSimpleResponse.builder()
                .gradeLevelId(updatedGradeLevel.getGradeLevelId())
                .gradeName(updatedGradeLevel.getGradeName())
                .description(updatedGradeLevel.getDescription())
                .build();
    }

    @Override
    @Transactional
    public void deleteGradeLevel(Long gradeLevelId) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", gradeLevelId));

        // Check if grade level has classes
        List<SchoolClass> classes = classRepository.findByGradeLevel(gradeLevel);
        if (!classes.isEmpty()) {
            throw new IllegalStateException("Cannot delete grade level with " + classes.size() + " classes");
        }

        gradeLevelRepository.delete(gradeLevel);
    }

    private GradeLevelDetailResponse convertToDetailResponse(GradeLevel gradeLevel) {
        List<SchoolClass> classes = classRepository.findByGradeLevel(gradeLevel);
        int classCount = classes.size();
        
        // Calculate total students across all classes in this grade
        int totalStudents = classes.stream()
                .mapToInt(schoolClass -> classRepository.countStudentsByClassId(schoolClass.getClassId()))
                .sum();

        return GradeLevelDetailResponse.builder()
                .gradeLevelId(gradeLevel.getGradeLevelId())
                .gradeName(gradeLevel.getGradeName())
                .description(gradeLevel.getDescription())
                .classCount(classCount)
                .studentCount(totalStudents)
                .build();
    }
}
