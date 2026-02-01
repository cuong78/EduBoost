package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.constant.PredefinedRole;
import com.fptu.eduBoostBackend.dto.request.CreateClassRequest;
import com.fptu.eduBoostBackend.dto.request.CreateStudentRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateStudentRequest;
import com.fptu.eduBoostBackend.dto.response.*;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.Class;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        if (Boolean.TRUE.equals(request.getContact() != null)) {
            invitation = createInvitation(savedStudent, teacher.getUser());
            sendInvitation(invitation.getInvitationId(), request.getEmail());
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


    @Override
    @Transactional
    public InvitationResponse createAndSendInvitation(String studentId, String parentEmail) {
        Teacher teacher = getCurrentTeacher();

        // Get student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));

        // Validate teacher has access to student's class
        if (student.getClassEntity() != null) {
            validateTeacherHasClassAccess(student.getClassEntity());
        } else {
            throw new BadRequestException("Student is not assigned to any class");
        }

        // Check if there's an active invitation for this student
        List<StudentInvitation> existingInvitations = studentInvitationRepository.findByStudentAndStatus(
                student, InvitationStatus.ACTIVE);

        StudentInvitation invitation;
        User currentUser = teacher.getUser();

        if (!existingInvitations.isEmpty()) {
            // Use existing active invitation
            invitation = existingInvitations.get(0);
        } else {
            // Create new invitation
            String invitationCode = generateInvitationCode();
            int expiresInDays = 30;

            invitation = StudentInvitation.builder()
                    .student(student)
                    .invitationCode(invitationCode)
                    .createdBy(currentUser)
                    .expiresAt(LocalDateTime.now().plusDays(expiresInDays))
                    .status(InvitationStatus.ACTIVE)
                    .build();

            invitation = studentInvitationRepository.save(invitation);

            log.info("Invitation created: {} for student: {} by teacher: {}",
                    invitation.getInvitationId(), studentId, teacher.getTeacherId());
        }

        // Update recipient email
        invitation.setRecipientEmail(parentEmail);
        studentInvitationRepository.save(invitation);

        // Send invitation email
        sendInvitationEmail(parentEmail, invitation);

        log.info("Invitation sent to {} for student: {}", parentEmail, studentId);

        return InvitationResponse.builder()
                .invitationId(invitation.getInvitationId())
                .invitationCode(invitation.getInvitationCode())
                .expiresAt(invitation.getExpiresAt())
                .status(invitation.getStatus())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public StudentInvitationsResponse getStudentInvitations(String studentId, int page, int size) {
        Teacher teacher = getCurrentTeacher();

        // Get student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));

        // Validate teacher has access to student's class
        if (student.getClassEntity() != null) {
            validateTeacherHasClassAccess(student.getClassEntity());
        } else {
            throw new BadRequestException("Student is not assigned to any class");
        }

        // Tính toán page (Spring Data JPA page bắt đầu từ 0)
        int pageNumber = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(pageNumber, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Lấy danh sách invitations với phân trang
        Page<StudentInvitation> invitationsPage = studentInvitationRepository.findByStudent(student, pageable);

        // Convert to response
        List<StudentInvitationDetailResponse> invitations = invitationsPage.getContent().stream()
                .map(this::mapToStudentInvitationDetailResponse)
                .collect(Collectors.toList());

        // Create pagination info
        PaginationResponse pagination = PaginationResponse.builder()
                .total(invitationsPage.getTotalElements())
                .page(page)
                .limit(size)
                .build();

        return StudentInvitationsResponse.builder()
                .success(true)
                .data(invitations)
                .pagination(pagination)
                .build();
    }

    private StudentInvitationDetailResponse mapToStudentInvitationDetailResponse(StudentInvitation invitation) {
        // Determine invitation type
        String invitationType = invitation.getRecipientEmail() != null ? "email" : "manual";

        // Map parent info if used
        ParentInfo usedBy = null;
        if (invitation.getUsedBy() != null) {
            User parentUser = invitation.getUsedBy().getUser();
            usedBy = ParentInfo.builder()
                    .parentId(invitation.getUsedBy().getParentId())
                    .fullName(parentUser.getFullName())
                    .email(parentUser.getEmail())
                    .build();
        }

        return StudentInvitationDetailResponse.builder()
                .invitationId(invitation.getInvitationId())
                .invitationCode(invitation.getInvitationCode())
                .invitationType(invitationType)
                .recipientEmail(invitation.getRecipientEmail())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .expiresAt(invitation.getExpiresAt())
                .usedAt(invitation.getUsedAt())
                .usedBy(usedBy)
                .maxUses(invitation.getMaxUses() != null ? invitation.getMaxUses() : 1)
                .currentUses(invitation.getCurrentUses() != null ? invitation.getCurrentUses() : 0)
                .build();
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

    private InvitationResponse createInvitation(Student student, User createdBy
                                                ) {

        
        String invitationCode = generateInvitationCode();
        int expiresInDays = 30;

        StudentInvitation invitation = StudentInvitation.builder()
                .student(student)
                .invitationCode(invitationCode)
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
        String subject = "Thông tin đăng nhập tài khoản học sinh - Hệ thống EduBoost";
        String htmlContent = buildStudentCredentialsHtml(
                fullName != null ? fullName : "Học sinh",
                username,
                password
        );

        emailService.sendHtmlEmail(email, subject, htmlContent);
    }

    private String buildStudentCredentialsHtml(String studentName, String username, String password) {
        // Tạo login link
        String loginLink = "https://eduboost.edu.vn/login"; // Thay bằng URL thực tế

        // Tạo thời gian hiện tại
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Thông tin đăng nhập tài khoản học sinh</title>\n" +
                "  <style>\n" +
                "    @media only screen and (max-width: 600px) {\n" +
                "      .container { width: 100% !important; padding: 10px !important; }\n" +
                "      .button { width: 100% !important; }\n" +
                "    }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;\">\n" +
                "  <div class=\"container\" style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff;\">\n" +
                "    <!-- Header -->\n" +
                "    <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;\">\n" +
                "      <h1 style=\"margin: 0; color: white; font-size: 28px;\">🎓 EduBoost</h1>\n" +
                "      <p style=\"margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;\">Nền tảng học tập thông minh</p>\n" +
                "    </div>\n" +
                "    \n" +
                "    <!-- Content -->\n" +
                "    <div style=\"padding: 40px 30px;\">\n" +
                "      <h2 style=\"color: #333333; margin-bottom: 25px;\">Chào mừng " + escapeHtml(studentName) + " đến với EduBoost!</h2>\n" +
                "      \n" +
                "      <p style=\"color: #555555; line-height: 1.6; margin-bottom: 25px;\">\n" +
                "        Tài khoản học sinh của bạn đã được tạo thành công. \n" +
                "        Dưới đây là thông tin đăng nhập để bạn có thể bắt đầu sử dụng hệ thống:\n" +
                "      </p>\n" +
                "      \n" +
                "      <!-- Credentials Box -->\n" +
                "      <div style=\"background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;\">\n" +
                "        <h3 style=\"color: #333333; margin-top: 0;\">📋 Thông tin đăng nhập</h3>\n" +
                "        \n" +
                "        <table style=\"width: 100%; border-collapse: collapse;\">\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666;\">\n" +
                "              <strong>👤 Họ tên:</strong>\n" +
                "            </td>\n" +
                "            <td style=\"padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #333333; font-weight: 500;\">\n" +
                "              " + escapeHtml(studentName) + "\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #666666;\">\n" +
                "              <strong>📧 Email/Tên đăng nhập:</strong>\n" +
                "            </td>\n" +
                "            <td style=\"padding: 12px 0; border-bottom: 1px solid #eaeaea; color: #333333; font-weight: 500;\">\n" +
                "              " + escapeHtml(username) + "\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style=\"padding: 12px 0; color: #666666;\">\n" +
                "              <strong>🔑 Mật khẩu tạm thời:</strong>\n" +
                "            </td>\n" +
                "            <td style=\"padding: 12px 0; color: #333333; font-weight: 500;\">\n" +
                "              <span style=\"background: #fff3cd; padding: 6px 12px; border-radius: 4px; font-family: monospace; letter-spacing: 1px;\">\n" +
                "                " + password + "\n" +
                "              </span>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "        \n" +
                "        <div style=\"margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 6px;\">\n" +
                "          <p style=\"margin: 0; color: #2e7d32; font-size: 14px;\">\n" +
                "            ⚠️ <strong>Lưu ý quan trọng:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu tiên.\n" +
                "          </p>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "      \n" +
                "      <!-- Action Button -->\n" +
                "      <div style=\"text-align: center; margin: 40px 0;\">\n" +
                "        <a href=\"" + loginLink + "\" \n" +
                "           style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); \n" +
                "                  color: white; padding: 16px 32px; text-decoration: none; \n" +
                "                  border-radius: 50px; font-weight: bold; font-size: 16px;\n" +
                "                  display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);\">\n" +
                "          🚀 Bắt đầu đăng nhập\n" +
                "        </a>\n" +
                "      </div>\n" +
                "      \n" +
                "      <!-- Instructions -->\n" +
                "      <div style=\"background: #f9f9f9; padding: 25px; border-radius: 8px; margin-top: 30px;\">\n" +
                "        <h4 style=\"color: #333333; margin-top: 0;\">📝 Hướng dẫn đăng nhập lần đầu:</h4>\n" +
                "        <ol style=\"color: #555555; line-height: 1.8; padding-left: 20px; margin-bottom: 0;\">\n" +
                "          <li>Nhấn nút <strong>\"Bắt đầu đăng nhập\"</strong> hoặc truy cập: " + loginLink + "</li>\n" +
                "          <li>Nhập email và mật khẩu tạm thời như trên</li>\n" +
                "          <li>Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới</li>\n" +
                "          <li>Chọn mật khẩu mạnh và dễ nhớ</li>\n" +
                "          <li>Hoàn tất và bắt đầu học tập!</li>\n" +
                "        </ol>\n" +
                "      </div>\n" +
                "      \n" +
                "      <!-- Support Info -->\n" +
                "      <div style=\"margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;\">\n" +
                "        <p style=\"color: #777777; font-size: 14px; margin-bottom: 5px;\">\n" +
                "          <strong>🆘 Cần hỗ trợ?</strong>\n" +
                "        </p>\n" +
                "        <p style=\"color: #777777; font-size: 14px; margin: 5px 0;\">\n" +
                "          📧 Email: support@eduboost.edu.vn\n" +
                "        </p>\n" +
                "        <p style=\"color: #777777; font-size: 14px; margin: 5px 0;\">\n" +
                "          📞 Hotline: 1900 1234\n" +
                "        </p>\n" +
                "        <p style=\"color: #777777; font-size: 12px; margin-top: 20px;\">\n" +
                "          Email được gửi vào: " + currentTime + "\n" +
                "        </p>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    \n" +
                "    <!-- Footer -->\n" +
                "    <div style=\"background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center;\">\n" +
                "      <p style=\"margin: 0; font-size: 14px;\">\n" +
                "        © " + LocalDate.now().getYear() + " Hệ thống EduBoost. Tất cả các quyền được bảo lưu.\n" +
                "      </p>\n" +
                "      <p style=\"margin: 10px 0 0 0; font-size: 12px; color: #bdc3c7;\">\n" +
                "        Đây là email tự động, vui lòng không trả lời email này.\n" +
                "      </p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
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
        Student student = invitation.getStudent();
        User studentUser = student.getUser();
        Class classEntity = student.getClassEntity();

        // Format thời gian hết hạn
        String expiresAt = formatExpiresAt(invitation.getExpiresAt());

        // Tạo register link (có thể lấy từ cấu hình hoặc frontend URL)
        String registerLink = "https://eduboost.edu.vn/parent/register"; // Thay bằng URL thực tế

        // Tạo nội dung HTML
        String subject = "Mời kết nối tài khoản phụ huynh";
        String htmlContent = buildInvitationHtml(
                studentUser.getFullName() != null ? studentUser.getFullName() : "Học sinh",
                classEntity != null ? classEntity.getClassName() : "Chưa xác định",
                invitation.getInvitationCode(),
                expiresAt,
                registerLink
        );

        emailService.sendHtmlEmail(email, subject, htmlContent);
    }

    private String formatExpiresAt(LocalDateTime expiresAt) {
        LocalDateTime now = LocalDateTime.now();
        long daysBetween = java.time.Duration.between(now, expiresAt).toDays();

        if (daysBetween > 0) {
            return daysBetween + " ngày";
        } else {
            long hoursBetween = java.time.Duration.between(now, expiresAt).toHours();
            if (hoursBetween > 0) {
                return hoursBetween + " giờ";
            } else {
                return "Ít hơn 1 giờ";
            }
        }
    }

    private String buildInvitationHtml(String studentName, String className,
                                       String invitationCode, String expiresAt,
                                       String registerLink) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Mời kết nối tài khoản phụ huynh</title>\n" +
                "</head>\n" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n" +
                "  <div style=\"background: #f8f9fa; padding: 20px;\">\n" +
                "    <h2 style=\"color: #2c3e50;\">🎓 Hệ thống EduBoost</h2>\n" +
                "    \n" +
                "    <div style=\"background: white; padding: 30px; border-radius: 8px; margin-top: 20px;\">\n" +
                "      <h3>Kính gửi Phụ huynh,</h3>\n" +
                "      \n" +
                "      <p>Chúng tôi xin gửi đến quý phụ huynh mã mời để kết nối tài khoản và theo dõi quá trình học tập của con em:</p>\n" +
                "      \n" +
                "      <div style=\"background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;\">\n" +
                "        <p><strong>Thông tin học sinh:</strong></p>\n" +
                "        <ul style=\"list-style: none; padding: 0;\">\n" +
                "          <li>📝 Họ tên: <strong>" + escapeHtml(studentName) + "</strong></li>\n" +
                "          <li>🏫 Lớp: <strong>" + escapeHtml(className) + "</strong></li>\n" +
                "        </ul>\n" +
                "      </div>\n" +
                "      \n" +
                "      <div style=\"background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;\">\n" +
                "        <p style=\"margin: 0; color: #856404;\">Mã mời của bạn:</p>\n" +
                "        <h1 style=\"margin: 10px 0; color: #856404; letter-spacing: 3px;\">" + invitationCode + "</h1>\n" +
                "        <p style=\"margin: 0; font-size: 14px; color: #856404;\">\n" +
                "          ⏰ Có hiệu lực trong " + expiresAt + "\n" +
                "        </p>\n" +
                "      </div>\n" +
                "      \n" +
                "      <div style=\"text-align: center; margin: 30px 0;\">\n" +
                "        <a href=\"" + registerLink + "\" \n" +
                "           style=\"background: #007bff; color: white; padding: 15px 40px; \n" +
                "                  text-decoration: none; border-radius: 5px; display: inline-block;\">\n" +
                "          Đăng ký ngay\n" +
                "        </a>\n" +
                "      </div>\n" +
                "      \n" +
                "      <div style=\"border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 20px;\">\n" +
                "        <p style=\"font-size: 14px; color: #6c757d;\">\n" +
                "          <strong>Hướng dẫn:</strong><br>\n" +
                "          1. Truy cập link phía trên hoặc vào trang đăng ký phụ huynh<br>\n" +
                "          2. Điền thông tin cá nhân và tạo mật khẩu<br>\n" +
                "          3. Nhập mã mời <strong>" + invitationCode + "</strong><br>\n" +
                "          4. Hoàn tất đăng ký\n" +
                "        </p>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "    \n" +
                "    <div style=\"text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;\">\n" +
                "      <p>Hệ thống EduBoost - Email: support@eduboost.edu.vn</p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }


}
