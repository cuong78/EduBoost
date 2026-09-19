package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.TeacherSimpleResponse;
import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateClassRequest;
import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.GradeLevelRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import com.fptu.eduBoostBackend.service.ClassService;
import com.fptu.eduBoostBackend.service.QRCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final TeacherRepository teacherRepository;
    private final QRCodeService qrCodeService;
    private final ActivityLogService activityLogService;

    @Override
    public List<ClassResponse> getAllClasses() {
        List<SchoolClass> classes = classRepository.findAll();
        return classes.stream()
                .map(this::convertToClassResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "classes", key = "#classId")
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
    @CacheEvict(value = "classes", allEntries = true)
    public ClassResponse createClass(CreateClassRequest request) {
        GradeLevel gradeLevel = gradeLevelRepository.findById(request.getGradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("GradeLevel", "gradeLevelId", request.getGradeLevelId()));
        
        Teacher teacher = null;
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", "teacherId", request.getTeacherId()));
        }

        // Generate guaranteed unique class code
        String finalClassCode = generateUniqueClassCode(request.getClassCode(), request.getClassName(), request.getSchoolYear());

        SchoolClass schoolClass = SchoolClass.builder()
                .className(request.getClassName())
                .classCode(finalClassCode)
                .gradeLevel(gradeLevel)
                .teacher(teacher)
                .schoolYear(request.getSchoolYear())
                .description(request.getDescription())
                .status("ACTIVE")
                .build();

        SchoolClass savedClass = classRepository.save(schoolClass);

        // Generate QR code for class enrollment
        try {
            byte[] qrBytes = qrCodeService.generateClassQRCode(savedClass.getClassId());
            savedClass.setQrCodeData(qrBytes);
            savedClass.setQrCodeGeneratedAt(LocalDateTime.now());
            classRepository.save(savedClass);
        } catch (Exception e) {
            log.error("Failed to generate QR code for class: {}", savedClass.getClassId(), e);
            // Không throw exception để không block class creation
        }

        activityLogService.log("Tạo lớp mới: " + schoolClass.getClassName() );
        return convertToClassResponse(savedClass);
    }

    @Override
    @Transactional
    @CacheEvict(value = "classes", allEntries = true)
    public ClassResponse updateClass(String classId, UpdateClassRequest request) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("SchoolClass", "classId", classId));
        String oldName = schoolClass.getClassName();

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
        activityLogService.log("Cập nhật lớp: " + oldName + " → " + schoolClass.getClassName() );

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
        activityLogService.log("Xoá lớp: " + schoolClass.getClassName() );

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
                .qrCodeUrl("/api/classes/" + schoolClass.getClassId() + "/qr-code")
                .build();
    }

    @Override
    @Transactional
    public byte[] getClassQRCode(String classId) {
        SchoolClass schoolClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("SchoolClass", "classId", classId));
        if (schoolClass.getQrCodeData() == null) {
            try {
                byte[] qrBytes = qrCodeService.generateClassQRCode(schoolClass.getClassId());
                schoolClass.setQrCodeData(qrBytes);
                schoolClass.setQrCodeGeneratedAt(LocalDateTime.now());
                classRepository.save(schoolClass);
            } catch (Exception e) {
                log.error("Failed to generate QR code for class: {}", classId, e);
                throw new BadRequestException("Failed to generate QR code for class: " + e.getMessage());
            }
        }
        return schoolClass.getQrCodeData();
    }

    private String generateUniqueClassCode(String providedCode, String className, String schoolYear) {
        String baseCode;
        if (providedCode != null && !providedCode.isBlank()) {
            baseCode = providedCode.trim();
        } else {
            String cleanName = className.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
            String cleanYear = (schoolYear != null ? schoolYear.replaceAll("[^a-zA-Z0-9]", "") : "");
            baseCode = cleanName + (cleanYear.isEmpty() ? "" : "-" + cleanYear);
        }

        if (baseCode.length() > 40) {
            baseCode = baseCode.substring(0, 40);
        }

        String candidateCode = baseCode;
        int attempts = 0;
        java.security.SecureRandom random = new java.security.SecureRandom();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        while (classRepository.existsByClassCode(candidateCode)) {
            attempts++;
            StringBuilder suffix = new StringBuilder("-");
            for (int i = 0; i < 4; i++) {
                suffix.append(chars.charAt(random.nextInt(chars.length())));
            }
            candidateCode = (baseCode.length() > 40 ? baseCode.substring(0, 40) : baseCode) + suffix;
            if (attempts > 50) {
                candidateCode = (baseCode.length() > 35 ? baseCode.substring(0, 35) : baseCode) + "-" + (System.currentTimeMillis() % 100000);
                break;
            }
        }
        return candidateCode;
    }
}
