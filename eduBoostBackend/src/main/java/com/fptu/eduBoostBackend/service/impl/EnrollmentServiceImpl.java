package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.constant.PredefinedRole;
import com.fptu.eduBoostBackend.dto.request.EnrollmentRequest;
import com.fptu.eduBoostBackend.dto.response.EnrollmentResponse;
import com.fptu.eduBoostBackend.entities.Role;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.StudentStatus;
import com.fptu.eduBoostBackend.entities.enums.UserStatus;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.RoleRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.EmailService;
import com.fptu.eduBoostBackend.service.EnrollmentService;
import com.fptu.eduBoostBackend.service.OneTimeLoginTokenService;
import com.fptu.eduBoostBackend.dto.request.GoogleEnrollmentRequest;
import com.fptu.eduBoostBackend.entities.RefreshToken;
import com.fptu.eduBoostBackend.service.TokenService;
import com.fptu.eduBoostBackend.service.RefreshTokenService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentServiceImpl implements EnrollmentService {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OneTimeLoginTokenService oneTimeLoginTokenService;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    @Value("${spring.security.oauth2.client.registration.google.client-id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    @Value("${backend.url.base}")
    private String backendBaseUrl;

    @Value("${frontend.url.student.login}")
    private String studentLoginUrl;

    private final Random random = new Random();

    @Override
    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {
        // 1. Validate class
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "classId", request.getClassId()));
        if (schoolClass.getStatus() != null && "INACTIVE".equalsIgnoreCase(schoolClass.getStatus())) {
            throw new BadRequestException("Lớp học này hiện đã tạm ngưng nhận học sinh");
        }

        // 2. Normalize email
        String email = request.getEmail().trim().toLowerCase();

        // 3. Find user by email
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // 4a. Create new user + student
            User newUser = createNewUser(email, request.getFullName(), request.getPhone());
            Student student = createStudentRecord(newUser, schoolClass);
            // Generate temporary password and token for email
            String temporaryPassword = generatePassword();
            String plainPassword = temporaryPassword; // Save plain for email
            String encodedPassword = passwordEncoder.encode(temporaryPassword);
            newUser.setPassword(encodedPassword);
            userRepository.save(newUser);

            // Generate auto-login token
            String autoLoginToken = generateAutoLoginToken();
            Long userId = newUser.getUserId();

            // Save student
            Student savedStudent = studentRepository.save(student);

            // Async email after commit
            Long finalUserId = userId;
            String finalAutoLoginToken = autoLoginToken;
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        CompletableFuture.runAsync(() -> {
                            try {
                                oneTimeLoginTokenService.saveTokenByUserId(finalAutoLoginToken, finalUserId);
                                sendNewStudentCredentialsEmail(newUser, savedStudent, schoolClass, plainPassword, finalAutoLoginToken);
                                log.info("Sent credentials email to new student: {}", email);
                            } catch (Exception e) {
                                log.error("Failed to send credentials email to {}: {}", email, e.getMessage());
                            }
                        });
                    }
                }
            );

            return EnrollmentResponse.builder()
                    .success(true)
                    .message("Enrollment successful. Credentials sent to email.")
                    .studentId(savedStudent.getStudentId())
                    .studentCode(savedStudent.getStudentCode())
                    .className(schoolClass.getClassName())
                    .teacherName(schoolClass.getTeacher().getUser().getFullName())
                    .newUser(true)
                    .temporaryPassword(plainPassword)
                    .build();
        } else {
            // 4b. Existing user
            // Check if user is teacher of this class
            if (schoolClass.getTeacher() != null && schoolClass.getTeacher().getUser() != null &&
                    schoolClass.getTeacher().getUser().getUserId().equals(user.getUserId())) {
                throw new BadRequestException("Bạn là giáo viên của lớp học này, không thể tự đăng ký làm học sinh.");
            }

            // Check if user is Teacher or Admin
            boolean isTeacherOrAdmin = user.getRoles().stream()
                    .anyMatch(r -> PredefinedRole.TEACH_ROLE.equals(r.getName()) || PredefinedRole.ADMIN_ROLE.equals(r.getName()));
            if (isTeacherOrAdmin) {
                throw new BadRequestException("Tài khoản Giáo viên / Quản trị viên không thể đăng ký tham gia lớp học với tư cách học sinh. Vui lòng sử dụng tài khoản học sinh.");
            }

            // Check if already enrolled in this class
            studentRepository.findFirstByUserAndSchoolClass_ClassId(user, request.getClassId())
                    .ifPresent(existing -> {
                        throw new ConflictException("Học sinh đã có trong lớp này rồi");
                    });

            // Ensure user has STUDENT role
            boolean hasStudentRole = user.getRoles().stream()
                    .anyMatch(r -> r.getName().equals(PredefinedRole.STUDENT_ROLE));
            if (!hasStudentRole) {
                Role studentRole = roleRepository.findByName(PredefinedRole.STUDENT_ROLE)
                        .orElseThrow(() -> new ResourceNotFoundException("STUDENT role not found"));
                user.getRoles().add(studentRole);
                userRepository.save(user);
                log.info("Added STUDENT role to user: {}", user.getUserId());
            }

            // Create new student record for this class
            Student student = createStudentRecord(user, schoolClass);
            Student savedStudent = studentRepository.save(student);

            // Async notification email
            String studentEmail = user.getEmail();
            String studentName = user.getFullName() != null ? user.getFullName() : user.getUsername();
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        CompletableFuture.runAsync(() -> {
                            try {
                                sendEnrollmentNotificationEmail(user, savedStudent, schoolClass);
                                log.info("Sent enrollment notification to: {}", studentEmail);
                            } catch (Exception e) {
                                log.error("Failed to send enrollment notification to {}: {}", studentEmail, e.getMessage());
                            }
                        });
                    }
                }
            );

            return EnrollmentResponse.builder()
                    .success(true)
                    .message("Enrollment successful. You have been added to the class.")
                    .studentId(savedStudent.getStudentId())
                    .studentCode(savedStudent.getStudentCode())
                    .className(schoolClass.getClassName())
                    .teacherName(schoolClass.getTeacher().getUser().getFullName())
                    .newUser(false)
                    .build();
        }
    }

    @Override
    @Transactional
    public EnrollmentResponse enrollWithGoogle(GoogleEnrollmentRequest request) {
        // 1. Validate class
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", "classId", request.getClassId()));
        if (schoolClass.getStatus() != null && "INACTIVE".equalsIgnoreCase(schoolClass.getStatus())) {
            throw new BadRequestException("Lớp học này hiện đã tạm ngưng nhận học sinh");
        }

        // 2. Verify Google Token
        if (request.getIdToken() == null || request.getIdToken().isEmpty()) {
            throw new BadRequestException("ID token is required");
        }
        if (googleClientId == null || googleClientId.isEmpty()) {
            log.error("Google Client ID is not configured");
            throw new BadRequestException("Google OAuth is not configured");
        }

        GoogleIdToken googleIdToken;
        try {
            googleIdToken = googleIdTokenVerifier.verify(request.getIdToken());
        } catch (Exception e) {
            log.error("Google Token verification error: {}", e.getMessage());
            throw new BadRequestException("Failed to verify Google Token: " + e.getMessage());
        }

        if (googleIdToken == null) {
            throw new BadRequestException("Invalid Google token: Verification failed");
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        String email = payload.getEmail().trim().toLowerCase();
        String fullName = (String) payload.get("name");

        Role studentRole = roleRepository.findByName(PredefinedRole.STUDENT_ROLE)
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT role not found"));

        User user = userRepository.findByEmail(email).orElse(null);
        boolean newUser = false;

        if (user == null) {
            newUser = true;
            String baseUsername = email.split("@")[0];
            String username = baseUsername + "_" + (System.currentTimeMillis() % 100000);

            user = User.builder()
                    .username(username)
                    .email(email)
                    .fullName(fullName != null ? fullName : baseUsername)
                    .phone("GOOGLE_" + UUID.randomUUID().toString().substring(0, 8))
                    .password("GOOGLE_OAUTH_" + UUID.randomUUID().toString())
                    .status(UserStatus.ACTIVE)
                    .isVerify(true)
                    .build();
            user.getRoles().add(studentRole);
            user = userRepository.save(user);
            log.info("Created new Google user with STUDENT role: {}", email);
        } else {
            // Check if user is teacher of this class
            if (schoolClass.getTeacher() != null && schoolClass.getTeacher().getUser() != null &&
                    schoolClass.getTeacher().getUser().getUserId().equals(user.getUserId())) {
                throw new BadRequestException("Bạn là giáo viên của lớp học này, không thể tự đăng ký làm học sinh.");
            }

            // Check if user is Teacher or Admin
            boolean isTeacherOrAdmin = user.getRoles().stream()
                    .anyMatch(r -> PredefinedRole.TEACH_ROLE.equals(r.getName()) || PredefinedRole.ADMIN_ROLE.equals(r.getName()));
            if (isTeacherOrAdmin) {
                throw new BadRequestException("Tài khoản Google này thuộc về Giáo viên / Admin. Vui lòng sử dụng tài khoản Google của học sinh.");
            }

            // Ensure user has STUDENT role
            boolean hasStudentRole = user.getRoles().stream()
                    .anyMatch(r -> r.getName().equals(PredefinedRole.STUDENT_ROLE));
            if (!hasStudentRole) {
                user.getRoles().add(studentRole);
                user = userRepository.save(user);
                log.info("Added STUDENT role to existing Google user: {}", email);
            }
        }

        final User targetUser = user;
        Student student = studentRepository.findFirstByUserAndSchoolClass_ClassId(targetUser, request.getClassId())
                .orElse(null);

        if (student == null) {
            student = createStudentRecord(targetUser, schoolClass);
            student = studentRepository.save(student);
            log.info("Enrolled student {} into class {}", email, schoolClass.getClassName());
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String jwtToken = tokenService.generateToken(user);

        return EnrollmentResponse.builder()
                .success(true)
                .message("Đăng ký lớp học thành công qua Google.")
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .className(schoolClass.getClassName())
                .teacherName(schoolClass.getTeacher() != null && schoolClass.getTeacher().getUser() != null ? schoolClass.getTeacher().getUser().getFullName() : null)
                .newUser(newUser)
                .token(jwtToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    private User createNewUser(String email, String fullName, String phone) {
        Role studentRole = roleRepository.findByName(PredefinedRole.STUDENT_ROLE)
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT role not found"));

        User user = User.builder()
                .username(email)
                .email(email)
                .fullName(fullName)
                .phone(phone)
                .password("") // will be set in caller
                .status(UserStatus.ACTIVE)
                .isVerify(true)
                .build();
        user.getRoles().add(studentRole);
        return user;
    }

    private Student createStudentRecord(User user, SchoolClass schoolClass) {
        String studentCode = generateStudentCode();
        return Student.builder()
                .user(user)
                .studentCode(studentCode)
                .schoolClass(schoolClass)
                .enrollmentDate(LocalDate.now())
                .status(StudentStatus.ACTIVE)
                .build();
    }

    private String generateStudentCode() {
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yy"));
        long timePart = System.nanoTime() % 1_000_000;
        int randPart = 100 + random.nextInt(900);
        return "ST" + year + String.format("%06d", timePart) + randPart;
    }

    private String generatePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        password.setCharAt(0, chars.charAt(random.nextInt(26))); // Uppercase
        password.setCharAt(1, chars.charAt(26 + random.nextInt(26))); // Lowercase
        password.setCharAt(2, chars.charAt(52 + random.nextInt(10))); // Digit
        return password.toString();
    }

    private String generateAutoLoginToken() {
        java.security.SecureRandom secureRandom = new java.security.SecureRandom();
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private void sendNewStudentCredentialsEmail(User user, Student student, SchoolClass schoolClass, String password, String autoLoginToken) {
        String subject = "Thông tin đăng nhập tài khoản học sinh - Hệ thống EduBoost";
        String studentName = user.getFullName() != null ? user.getFullName() : "Học sinh";
        String username = user.getEmail();
        String loginLink = studentLoginUrl;
        String autoLoginLink = autoLoginToken != null
                ? backendBaseUrl + "/api/auth/auto-login?token=" + autoLoginToken
                : loginLink;
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        String htmlContent = "<!DOCTYPE html>\n" +
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
                "        <a href=\"" + autoLoginLink + "\" \n" +
                "           style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); \n" +
                "                  color: white; padding: 16px 40px; text-decoration: none; \n" +
                "                  border-radius: 50px; font-weight: bold; font-size: 18px;\n" +
                "                  display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);\">\n" +
                "          🚀 Đăng nhập ngay\n" +
                "        </a>\n" +
                "        <p style=\"margin-top: 15px; color: #999; font-size: 13px;\">\n" +
                "          Nhấn vào nút trên để tự động đăng nhập, không cần nhập mật khẩu!<br>\n" +
                "          <span style=\"color: #e74c3c;\">⚠️ Link chỉ có hiệu lực trong 24 giờ</span>\n" +
                "        </p>\n" +
                "      </div>\n" +
                "      \n" +
                "      <!-- Instructions -->\n" +
                "      <div style=\"background: #f9f9f9; padding: 25px; border-radius: 8px; margin-top: 30px;\">\n" +
                "        <h4 style=\"color: #333333; margin-top: 0;\">📝 Hướng dẫn đăng nhập lần đầu:</h4>\n" +
                "        <ol style=\"color: #555555; line-height: 1.8; padding-left: 20px; margin-bottom: 0;\">\n" +
                "          <li>Nhấn nút <strong>\"Đăng nhập ngay\"</strong> phía trên để tự động đăng nhập</li>\n" +
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

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    private void sendEnrollmentNotificationEmail(User user, Student student, SchoolClass schoolClass) {
        String studentName = user.getFullName() != null ? user.getFullName() : user.getUsername();
        String teacherName = schoolClass.getTeacher().getUser().getFullName() != null ?
                schoolClass.getTeacher().getUser().getFullName() : schoolClass.getTeacher().getUser().getUsername();
        String className = schoolClass.getClassName();
        String subject = "Thông báo đăng ký lớp học - EduBoost";
        String loginLink = studentLoginUrl;
        String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        String htmlContent = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Thông báo đăng ký lớp học</title>\n" +
                "</head>\n" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n" +
                "  <div style=\"background: #f8f9fa; padding: 20px;\">\n" +
                "    <h2 style=\"color: #2c3e50;\">🎓 Hệ thống EduBoost</h2>\n" +
                "    \n" +
                "    <div style=\"background: white; padding: 30px; border-radius: 8px; margin-top: 20px;\">\n" +
                "      <h3>Kính gửi " + escapeHtml(studentName) + ",</h3>\n" +
                "      \n" +
                "      <p>Bạn đã được giáo viên <strong>" + escapeHtml(teacherName) + "</strong> thêm vào lớp học <strong>" + escapeHtml(className) + "</strong>.</p>\n" +
                "      \n" +
                "      <div style=\"background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;\">\n" +
                "        <p><strong>Thông tin lớp học:</strong></p>\n" +
                "        <ul style=\"list-style: none; padding: 0;\">\n" +
                "          <li>🏫 Lớp: <strong>" + escapeHtml(className) + "</strong></li>\n" +
                "          <li>👨‍🏫 Giáo viên: <strong>" + escapeHtml(teacherName) + "</strong></li>\n" +
                "        </ul>\n" +
                "      </div>\n" +
                "      \n" +
                "      <div style=\"text-align: center; margin: 30px 0;\">\n" +
                "        <a href=\"" + loginLink + "\" \n" +
                "           style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); \n" +
                "                  color: white; padding: 16px 40px; text-decoration: none; \n" +
                "                  border-radius: 50px; font-weight: bold; font-size: 18px;\n" +
                "                  display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);\">\n" +
                "          🚀 Đăng nhập ngay\n" +
                "        </a>\n" +
                "      </div>\n" +
                "      \n" +
                "      <div style=\"border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 20px;\">\n" +
                "        <p style=\"font-size: 14px; color: #6c757d;\">\n" +
                "          <strong>Lưu ý:</strong> Nếu bạn chưa có tài khoản, vui lòng liên hệ giáo viên để được hỗ trợ tạo tài khoản.\n" +
                "        </p>\n" +
                "      </div>\n" +
                "      \n" +
                "      <div style=\"text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;\">\n" +
                "        <p>Hệ thống EduBoost - Email: support@eduboost.edu.vn</p>\n" +
                "        <p>Email được gửi vào: " + currentTime + "</p>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
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
