package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSimpleResponse;
import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateClassRequest;
import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.GradeLevelRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public List<ClassResponse> getAllClasses() {
        List<SchoolClass> classes = classRepository.findAll();
        return classes.stream()
                .map(this::convertToClassResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ClassResponse getClassById(String classId) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("SchoolClass", "classId", classId));
        return convertToClassResponse(schoolClass);
    }

    @Override
    public List<ClassResponse> getClassesByGradeId(Long gradeLevelId) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", gradeLevelId));
        
        List<SchoolClass> classes = classRepository.findByGradeLevel(gradeLevel);
        return classes.stream()
                .map(this::convertToClassResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClassResponse createClass(CreateClassRequest request) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(request.getGradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", request.getGradeLevelId()));
        
        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "teacherId", request.getTeacherId()));
        }

        // Check if class code already exists
        if (classRepository.existsByClassCode(request.getClassCode())) {
            throw new IllegalArgumentException("Class code already exists: " + request.getClassCode());
        }

        SchoolClass schoolClass = SchoolClass.builder()
                .className(request.getClassName())
                .classCode(request.getClassCode())
                .gradeLevel(gradeLevel)
                .teacher(teacher)
                .schoolYear(request.getSchoolYear())
                .description(request.getDescription())
                .status("ACTIVE")
                .build();

        SchoolClass savedClass = classRepository.save(schoolClass);
        return convertToClassResponse(savedClass);
    }

    @Override
    @Transactional
    public ClassResponse updateClass(String classId, UpdateClassRequest request) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("SchoolClass", "classId", classId));

        // Update basic info if provided
        if (request.getClassName() != null && !request.getClassName().trim().isEmpty()) {
            schoolClass.setClassName(request.getClassName());
        }

        if (request.getDescription() != null) {
            schoolClass.setDescription(request.getDescription());
        }

        if (request.getSchoolYear() != null && !request.getSchoolYear().trim().isEmpty()) {
            schoolClass.setSchoolYear(request.getSchoolYear());
        }

        if (request.getTeacherId() != null) {
            if (request.getTeacherId().isEmpty() || request.getTeacherId().equals("0")) {
                // Remove teacher
                schoolClass.setTeacher(null);
            } else {
                Teacher teacher = teacherRepository.findById(request.getTeacherId())
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher", "teacherId", request.getTeacherId()));
                schoolClass.setTeacher(teacher);
            }
        }

        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            schoolClass.setStatus(request.getStatus());
        }

        SchoolClass updatedClass = classRepository.save(schoolClass);
        return convertToClassResponse(updatedClass);
    }

    @Override
    @Transactional
    public void deleteClass(String classId) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("SchoolClass", "classId", classId));
        
        // Check if class has students
        int studentCount = classRepository.countStudentsByClassId(classId);
        if (studentCount > 0) {
            throw new IllegalStateException("Cannot delete class with " + studentCount + " students");
        }
        
        classRepository.delete(schoolClass);
    }

    @Override
    public List<TeacherSimpleResponse> getAllAvailableTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        
        return teachers.stream()
                .map(teacher -> {
                    // Find current class taught by this teacher
                    List<SchoolClass> classes = classRepository.findByTeacher(teacher);
                    SchoolClass currentClass = classes.isEmpty() ? null : classes.get(0);
                    
                    return TeacherSimpleResponse.builder()
                            .teacherId(teacher.getTeacherId())
                            .fullName(teacher.getUser().getFullName())
                            .email(teacher.getUser().getEmail())
                            .phoneNumber(null)
                            .currentClassId(currentClass != null ? currentClass.getClassId() : null)
                            .currentClassName(currentClass != null ? currentClass.getClassName() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private ClassResponse convertToClassResponse(SchoolClass schoolClass) {
        int studentCount = classRepository.countStudentsByClassId(schoolClass.getClassId());
        
        String teacherName = null;
        String teacherId = null;
        if (schoolClass.getTeacher() != null) {
            teacherName = schoolClass.getTeacher().getUser().getFullName();
            teacherId = schoolClass.getTeacher().getTeacherId();
        }

        return ClassResponse.builder()
                .classId(schoolClass.getClassId())
                .className(schoolClass.getClassName())
                .classCode(schoolClass.getClassCode())
                .gradeLevelName(schoolClass.getGradeLevel().getGradeName())
                .gradeLevelId(schoolClass.getGradeLevel().getGradeLevelId())
                .teacherId(teacherId)
                .teacherName(teacherName)
                .schoolYear(schoolClass.getSchoolYear())
                .description(schoolClass.getDescription())
                .status(schoolClass.getStatus())
                .studentCount(studentCount)
                .build();
    }
}
