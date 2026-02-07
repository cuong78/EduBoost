package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelSimpleResponse;
import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.GradeLevelRepository;
import com.fptu.eduBoostBackend.service.GradeLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeLevelServiceImpl implements GradeLevelService {

    private final GradeLevelRepository gradeLevelRepository;
    private final ClassRepository classRepository;

    @Override
    public List<GradeLevelSimpleResponse> getAllGradeLevels() {
        List<GradeLevel> gradeLevels = gradeLevelRepository.findAll();
        return gradeLevels.stream()
                .map(gradeLevel -> GradeLevelSimpleResponse.builder()
                        .gradeLevelId(gradeLevel.getGradeLevelId())
                        .gradeName(gradeLevel.getGradeName())
                        .build())
                .collect(Collectors.toList());
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
                            .teacherId(teacherId)
                            .teacherName(teacherName)
                            .schoolYear(classEntity.getSchoolYear())
                            .description(classEntity.getDescription())
                            .studentCount(studentCount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
