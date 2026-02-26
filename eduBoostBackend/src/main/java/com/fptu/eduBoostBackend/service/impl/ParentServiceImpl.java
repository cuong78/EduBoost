package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.LinkStudentRequest;
import com.fptu.eduBoostBackend.dto.request.ValidateInvitationRequest;
import com.fptu.eduBoostBackend.dto.response.LinkStudentResponse;
import com.fptu.eduBoostBackend.dto.response.ParentStudentDetailResponse;
import com.fptu.eduBoostBackend.dto.response.ValidateInvitationResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ParentRepository;
import com.fptu.eduBoostBackend.repositories.ParentStudentRepository;
import com.fptu.eduBoostBackend.repositories.StudentInvitationRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.ParentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentServiceImpl implements ParentService {

    private final StudentInvitationRepository studentInvitationRepository;
    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final ParentStudentRepository parentStudentRepository;

    @Override
    @Transactional(readOnly = true)
    public ValidateInvitationResponse validateInvitation(ValidateInvitationRequest request) {
        log.info("Validating invitation code: {}", request.getInvitationCode());

        // Tìm invitation
        StudentInvitation invitation = studentInvitationRepository
                .findByInvitationCode(request.getInvitationCode())
                .orElse(null);

        // Kiểm tra tồn tại
        if (invitation == null) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .error("Mã mời không tồn tại")
                    .errorCode("INVITATION_NOT_FOUND")
                    .build();
        }

        // Kiểm tra status
        if (invitation.getStatus() == InvitationStatus.USED) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .error("Mã mời đã được sử dụng")
                    .errorCode("INVITATION_USED")
                    .build();
        }

        if (invitation.getStatus() == InvitationStatus.REVOKED) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .error("Mã mời đã bị thu hồi")
                    .errorCode("INVITATION_REVOKED")
                    .build();
        }

        if (invitation.getStatus() == InvitationStatus.EXPIRED) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .error("Mã mời đã hết hạn")
                    .errorCode("INVITATION_EXPIRED")
                    .build();
        }

        // Kiểm tra thời gian hết hạn
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ValidateInvitationResponse.builder()
                    .valid(false)
                    .error("Mã mời đã hết hạn")
                    .errorCode("INVITATION_EXPIRED")
                    .build();
        }

        // Lấy thông tin student
        Student student = invitation.getStudent();
        String className = student.getSchoolClass() != null ? student.getSchoolClass().getClassName() : "N/A";
        String gradeLevel = extractGradeLevel(className);

        // Build response cho mã hợp lệ
        ValidateInvitationResponse.StudentInfoDTO studentInfo = ValidateInvitationResponse.StudentInfoDTO.builder()
                .studentCode(student.getStudentCode())
                .fullName(student.getUser().getFullName() != null ? 
                        student.getUser().getFullName() : student.getUser().getUsername())
                .className(className)
                .gradeLevel(gradeLevel)
                .build();

        ValidateInvitationResponse.InvitationInfoDTO invitationInfo = ValidateInvitationResponse.InvitationInfoDTO.builder()
                .expiresAt(invitation.getExpiresAt())
                .remainingUses(1) // Giả định mỗi invitation chỉ dùng 1 lần
                .build();

        log.info("Invitation validated successfully for student: {}", student.getStudentCode());

        return ValidateInvitationResponse.builder()
                .valid(true)
                .studentInfo(studentInfo)
                .invitation(invitationInfo)
                .build();
    }

    private String extractGradeLevel(String className) {
        if (className == null || className.equals("N/A")) {
            return "N/A";
        }
        // Trích xuất số lớp từ tên class (ví dụ: "10A1" -> "10")
        String digits = className.replaceAll("[^0-9]", "");
        if (digits.length() >= 2) {
            return digits.substring(0, 2);
        } else if (digits.length() == 1) {
            return digits;
        }
        return "N/A";
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Parent getCurrentParent() {
        User currentUser = getCurrentUser();
        return parentRepository.findByUser(currentUser)
                .orElseThrow(() -> new ForbiddenException("User is not a parent"));
    }

    @Override
    @Transactional
    public LinkStudentResponse linkStudent(LinkStudentRequest request) {
        Parent parent = getCurrentParent();
        log.info("Parent {} attempting to link with student using code: {}", 
                parent.getParentId(), request.getInvitationCode());

        // Validate invitation
        StudentInvitation invitation = studentInvitationRepository
                .findByInvitationCode(request.getInvitationCode())
                .orElseThrow(() -> new BadRequestException("Mã mời không tồn tại"));

        // Kiểm tra status
        if (invitation.getStatus() == InvitationStatus.USED) {
            throw new BadRequestException("Mã mời đã được sử dụng");
        }
        if (invitation.getStatus() == InvitationStatus.REVOKED) {
            throw new BadRequestException("Mã mời đã bị thu hồi");
        }
        if (invitation.getStatus() == InvitationStatus.EXPIRED) {
            throw new BadRequestException("Mã mời đã hết hạn");
        }

        // Kiểm tra thời gian hết hạn
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã mời đã hết hạn");
        }

        Student student = invitation.getStudent();

        // Kiểm tra đã kết nối chưa
        if (parentStudentRepository.existsByParentAndStudent(parent, student)) {
            throw new ConflictException("Bạn đã kết nối với học sinh này rồi");
        }

        // Tạo liên kết parent-student
        ParentStudent parentStudent = ParentStudent.builder()
                .parent(parent)
                .student(student)
                .relationship(request.getRelationship())
                .build();
        ParentStudent savedLink = parentStudentRepository.save(parentStudent);

        // Cập nhật invitation
        invitation.setStatus(InvitationStatus.USED);
        invitation.setUsedAt(LocalDateTime.now());
        invitation.setUsedBy(parent);
        studentInvitationRepository.save(invitation);

        log.info("Successfully linked parent {} with student {}", 
                parent.getParentId(), student.getStudentId());

        // Build response
        LinkStudentResponse.StudentLinkDTO studentDTO = LinkStudentResponse.StudentLinkDTO.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(student.getUser().getFullName() != null ? 
                        student.getUser().getFullName() : student.getUser().getUsername())
                .className(student.getSchoolClass() != null ? 
                        student.getSchoolClass().getClassName() : "N/A")
                .avatar(student.getUser().getAvatarUrl())
                .build();

        return LinkStudentResponse.builder()
                .linkId(savedLink.getId())
                .student(studentDTO)
                .relationship(savedLink.getRelationship())
                .linkedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParentStudentDetailResponse> getMyStudents() {
        Parent parent = getCurrentParent();
        log.info("Fetching students for parent: {}", parent.getParentId());

        List<ParentStudent> parentStudents = parentStudentRepository.findByParent(parent);

        return parentStudents.stream()
                .map(this::convertToParentStudentDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ParentStudentDetailResponse getStudentDetail(String studentId) {
        Parent parent = getCurrentParent();
        log.info("Fetching student detail: {} for parent: {}", studentId, parent.getParentId());

        List<ParentStudent> parentStudents = parentStudentRepository.findByParent(parent);
        
        ParentStudent parentStudent = parentStudents.stream()
                .filter(ps -> ps.getStudent().getStudentId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found or not linked to you"));

        return convertToParentStudentDetailResponse(parentStudent);
    }

    private ParentStudentDetailResponse convertToParentStudentDetailResponse(ParentStudent parentStudent) {
        Student student = parentStudent.getStudent();
        SchoolClass schoolClass = student.getSchoolClass();

        // Student info
        ParentStudentDetailResponse.StudentDetailDTO studentDTO = ParentStudentDetailResponse.StudentDetailDTO.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(student.getUser().getFullName() != null ? 
                        student.getUser().getFullName() : student.getUser().getUsername())
                .email(student.getUser().getEmail())
                .avatar(student.getUser().getAvatarUrl())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .build();

        // Class info
        ParentStudentDetailResponse.ClassDetailDTO classDTO = null;
        if (schoolClass != null) {
            Teacher teacher = schoolClass.getTeacher();
            ParentStudentDetailResponse.TeacherDTO teacherDTO = null;
            if (teacher != null) {
                teacherDTO = ParentStudentDetailResponse.TeacherDTO.builder()
                        .teacherId(teacher.getTeacherId())
                        .fullName(teacher.getUser().getFullName() != null ? 
                                teacher.getUser().getFullName() : teacher.getUser().getUsername())
                        .email(teacher.getUser().getEmail())
                        .build();
            }

            classDTO = ParentStudentDetailResponse.ClassDetailDTO.builder()
                    .classId(schoolClass.getClassId())
                    .className(schoolClass.getClassName())
                    .gradeLevel(extractGradeLevel(schoolClass.getClassName()))
                    .teacher(teacherDTO)
                    .build();
        }

        return ParentStudentDetailResponse.builder()
                .linkId(parentStudent.getId())
                .student(studentDTO)
                .classInfo(classDTO)
                .relationship(parentStudent.getRelationship())
                .isPrimary(false) // TODO: implement isPrimary logic if needed
                .linkedAt(LocalDateTime.now()) // TODO: add linkedAt field to ParentStudent entity
                .build();
    }

    @Override
    @Transactional
    public void unlinkStudent(String studentId) {
        Parent parent = getCurrentParent();
        log.info("Parent {} attempting to unlink student: {}", parent.getParentId(), studentId);

        List<ParentStudent> parentStudents = parentStudentRepository.findByParent(parent);
        
        ParentStudent parentStudent = parentStudents.stream()
                .filter(ps -> ps.getStudent().getStudentId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found or not linked to you"));

        parentStudentRepository.delete(parentStudent);
        log.info("Successfully unlinked parent {} from student {}", parent.getParentId(), studentId);
    }
}
