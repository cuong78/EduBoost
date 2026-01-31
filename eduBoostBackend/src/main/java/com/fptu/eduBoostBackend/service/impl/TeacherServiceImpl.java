package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.constant.PredefinedRole;
import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.CreateStudentRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateStudentRequest;
import com.fptu.eduBoostBackend.dto.response.*;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.Class;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import com.fptu.eduBoostBackend.entities.enums.InvitationType;
import com.fptu.eduBoostBackend.entities.enums.UserStatus;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.EmailService;
import com.fptu.eduBoostBackend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherServiceImpl implements TeacherService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final StudentInvitationRepository studentInvitationRepository;
    private final RoleRepository roleRepository;
    private final EmailLogRepository emailLogRepository;
    private final InvitationLogRepository invitationLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Random random = new Random();

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Teacher getCurrentTeacher() {
        User currentUser = getCurrentUser();
        return teacherRepository.findByUser(currentUser)
                .orElseThrow(() -> new ForbiddenException("User is not a teacher"));
    }

    private void validateTeacherHasClassAccess(Class classEntity) {
        Teacher currentTeacher = getCurrentTeacher();
        if (!classEntity.getTeacher().getTeacherId().equals(currentTeacher.getTeacherId())) {
            throw new ForbiddenException("You do not have access to this class");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassResponse> getMyClasses() {
        Teacher teacher = getCurrentTeacher();
        List<Class> classes = classRepository.findByTeacher(teacher);
        
        return classes.stream().map(classEntity -> {
            int studentCount = studentRepository.findByClassEntity(classEntity).size();
            return ClassResponse.builder()
                    .classId(classEntity.getClassId())
                    .className(classEntity.getClassName())
                    .classCode(classEntity.getClassCode())
                    .teacherId(teacher.getTeacherId())
                    .teacherName(teacher.getUser().getFullName() != null ? 
                            teacher.getUser().getFullName() : teacher.getUser().getUsername())
                    .schoolYear(classEntity.getSchoolYear())
                    .description(classEntity.getDescription())
                    .createdAt(classEntity.getCreatedAt())
                    .updatedAt(classEntity.getUpdatedAt())
                    .studentCount(studentCount)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClassResponse createClass(CreateClassRequest request) {
        Teacher teacher = getCurrentTeacher();
        
        if (classRepository.existsByClassCode(request.getClassCode())) {
            throw new ConflictException("Class code already exists");
        }

        Class newClass = Class.builder()
                .className(request.getClassName())
                .classCode(request.getClassCode())
                .teacher(teacher)
                .schoolYear(request.getSchoolYear())
                .description(request.getDescription())
                .build();

        Class savedClass = classRepository.save(newClass);
        
        log.info("Class created: {} by teacher: {}", savedClass.getClassId(), teacher.getTeacherId());
        
        return ClassResponse.builder()
                .classId(savedClass.getClassId())
                .className(savedClass.getClassName())
                .classCode(savedClass.getClassCode())
                .teacherId(teacher.getTeacherId())
                .teacherName(teacher.getUser().getFullName() != null ? 
                        teacher.getUser().getFullName() : teacher.getUser().getUsername())
                .schoolYear(savedClass.getSchoolYear())
                .description(savedClass.getDescription())
                .createdAt(savedClass.getCreatedAt())
                .updatedAt(savedClass.getUpdatedAt())
                .studentCount(0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByClass(String classId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "classId", classId));
        
        validateTeacherHasClassAccess(classEntity);
        
        List<Student> students = studentRepository.findByClassEntity(classEntity);
        
        return students.stream().map(this::mapToStudentResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CreateStudentResponse createStudent(CreateStudentRequest request) {
        Teacher teacher = getCurrentTeacher();
        
        // Validate class access
        Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "classId", request.getClassId()));
        validateTeacherHasClassAccess(classEntity);
        
        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        
        // Generate password if not provided
        String password = request.getPassword();
        String temporaryPassword = null;
        if (password == null || password.isBlank()) {
            temporaryPassword = generatePassword();
            password = temporaryPassword;
        }
        
        // Get STUDENT role
        Role studentRole = roleRepository.findByName(PredefinedRole.STUDENT_ROLE)
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT role not found"));
        
        // Create User
        User user = User.builder()
                .username(request.getEmail()) // Use email as username
                .email(request.getEmail())
                .password(passwordEncoder.encode(password))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .status(UserStatus.ACTIVE)
                .isVerify(true) // Auto-verify for teacher-created students
                .build();
        user.addRole(studentRole);
        User savedUser = userRepository.save(user);
        
        // Generate student code
        String studentCode = generateStudentCode();
        
        // Create Student
        Student student = Student.builder()
                .user(savedUser)
                .studentCode(studentCode)
                .classEntity(classEntity)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .enrollmentDate(request.getEnrollmentDate() != null ? 
                        request.getEnrollmentDate() : LocalDate.now())
                .build();
        Student savedStudent = studentRepository.save(student);
        
        // Create invitation if requested
        InvitationResponse invitation = null;
        if (Boolean.TRUE.equals(request.getAutoCreateInvitation())) {
            invitation = createInvitation(savedStudent, teacher.getUser(), request.getInvitationOptions());
        }
        
        // Send email with credentials
        if (temporaryPassword != null) {
            sendStudentCredentialsEmail(savedUser.getEmail(), savedUser.getFullName(), 
                    savedUser.getEmail(), temporaryPassword);
        }
        
        log.info("Student created: {} by teacher: {}", savedStudent.getStudentId(), teacher.getTeacherId());
        
        return CreateStudentResponse.builder()
                .student(mapToStudentResponse(savedStudent))
                .invitation(invitation)
                .credentials(temporaryPassword != null ? 
                        CredentialsResponse.builder()
                                .email(savedUser.getEmail())
                                .temporaryPassword(temporaryPassword)
                                .build() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudentById(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
        
        if (student.getClassEntity() != null) {
            validateTeacherHasClassAccess(student.getClassEntity());
        }
        
        return mapToStudentResponse(student);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(String studentId, UpdateStudentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
        
        if (student.getClassEntity() != null) {
            validateTeacherHasClassAccess(student.getClassEntity());
        }
        
        // Update user info
        User user = student.getUser();
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);
        
        // Update student info
        if (request.getClassId() != null) {
            Class newClass = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class", "classId", request.getClassId()));
            validateTeacherHasClassAccess(newClass);
            student.setClassEntity(newClass);
        }
        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            student.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }
        if (request.getEnrollmentDate() != null) {
            student.setEnrollmentDate(request.getEnrollmentDate());
        }
        
        Student updatedStudent = studentRepository.save(student);
        
        log.info("Student updated: {} by teacher", studentId);
        
        return mapToStudentResponse(updatedStudent);
    }

    @Override
    @Transactional
    public void deleteStudent(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
        
        if (student.getClassEntity() != null) {
            validateTeacherHasClassAccess(student.getClassEntity());
        }
        
        // Delete student will cascade to user due to ON DELETE CASCADE
        studentRepository.delete(student);
        
        log.info("Student deleted: {} by teacher", studentId);
    }

    private StudentResponse mapToStudentResponse(Student student) {
        User user = student.getUser();
        Class classEntity = student.getClassEntity();
        
        return StudentResponse.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .classId(classEntity != null ? classEntity.getClassId() : null)
                .className(classEntity != null ? classEntity.getClassName() : null)
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .address(student.getAddress())
                .enrollmentDate(student.getEnrollmentDate())
                .status(student.getStatus())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    private String generateStudentCode() {
        // Format: ST + 2 chữ số năm + 6 chữ số ngẫu nhiên = 10 ký tự
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yy")); // 26
        String prefix = "ST" + year; // ST26
        
        String studentCode;
        int attempts = 0;
        do {
            int randomNum = 100000 + random.nextInt(900000); // 6-digit number: 100000-999999
            studentCode = prefix + randomNum; // ST26123456 = 10 ký tự
            attempts++;
            if (attempts > 100) {
                throw new BadRequestException("Unable to generate unique student code");
            }
        } while (studentRepository.existsByStudentCode(studentCode));
        
        return studentCode;
    }

    private String generatePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        // Ensure at least one uppercase, one lowercase, one digit
        password.setCharAt(0, chars.charAt(random.nextInt(26))); // Uppercase
        password.setCharAt(1, chars.charAt(26 + random.nextInt(26))); // Lowercase
        password.setCharAt(2, chars.charAt(52 + random.nextInt(10))); // Digit
        return password.toString();
    }

    private String generateInvitationCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        String code;
        int attempts = 0;
        do {
            StringBuilder sb = new StringBuilder();
            int length = 6 + random.nextInt(5); // 6-10 characters
            for (int i = 0; i < length; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
            attempts++;
            if (attempts > 100) {
                throw new BadRequestException("Unable to generate unique invitation code");
            }
        } while (studentInvitationRepository.existsByInvitationCode(code));
        
        return code;
    }

    private InvitationResponse createInvitation(Student student, User createdBy, 
                                                com.fptu.eduBoostBackend.dto.request.InvitationOptions options) {
        if (options == null) {
            options = new com.fptu.eduBoostBackend.dto.request.InvitationOptions();
        }
        
        String invitationCode = generateInvitationCode();
        int expiresInDays = options.getExpiresInDays() != null ? options.getExpiresInDays() : 30;
        InvitationType type = options.getType() != null ? options.getType() : InvitationType.MANUAL;
        
        StudentInvitation invitation = StudentInvitation.builder()
                .student(student)
                .invitationCode(invitationCode)
                .invitationType(type)
                .createdBy(createdBy)
                .expiresAt(LocalDateTime.now().plusDays(expiresInDays))
                .status(InvitationStatus.ACTIVE)
                .build();
        
        StudentInvitation savedInvitation = studentInvitationRepository.save(invitation);
        
        return InvitationResponse.builder()
                .invitationId(savedInvitation.getInvitationId())
                .invitationCode(savedInvitation.getInvitationCode())
                .expiresAt(savedInvitation.getExpiresAt())
                .build();
    }

    private void sendStudentCredentialsEmail(String email, String fullName, String username, String password) {
        String subject = "Thông tin đăng nhập tài khoản học sinh";
        String text = String.format(
                "Xin chào %s,\n\n" +
                "Tài khoản học sinh của bạn đã được tạo thành công.\n\n" +
                "Thông tin đăng nhập:\n" +
                "Email/Username: %s\n" +
                "Mật khẩu tạm thời: %s\n\n" +
                "Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.\n\n" +
                "Trân trọng,\n" +
                "Hệ thống EduBoost",
                fullName != null ? fullName : "Học sinh",
                username,
                password
        );
        
        emailService.sendEmail(email, subject, text);
    }
    @Override
    @Transactional
    public void sendInvitation(String invitationId, String parentEmail) {

        StudentInvitation invitation = studentInvitationRepository.findById(invitationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Invitation", "invitationId", invitationId)
                );

        // Validate status
        if (invitation.getStatus() != InvitationStatus.ACTIVE) {
            throw new BadRequestException("Invitation is not active");
        }

        // Validate expiry
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            studentInvitationRepository.save(invitation);
            throw new BadRequestException("Invitation has expired");
        }

        // Update recipient email
        invitation.setRecipientEmail(parentEmail);
        studentInvitationRepository.save(invitation);

        // Send email
        sendInvitationEmail(parentEmail, invitation);

        log.info("Invitation {} sent to {}", invitationId, parentEmail);
    }
    private void sendInvitationEmail(String email, StudentInvitation invitation) {

        String subject = "";

        String text = String.format(
                "Bạn đã được mời gia nhập lớp học EduBoost.\n\n" +
                        "Invite Code: %s\n" +
                        "Hết hạn vào: %s\n\n" +
                        "Xin hãy dùng code này để kết nối vào hệ thống EduBoost.\n\n" +
                        "Trân trọng,\n" +
                        "Hệ thống EduBoost",

                invitation.getInvitationCode(),
                invitation.getExpiresAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        );

        emailService.sendEmail(email, subject, text);
    }

}
