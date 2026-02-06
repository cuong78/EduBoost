package com.fptu.eduBoostBackend.service.impl;


import com.fptu.eduBoostBackend.constant.PredefinedRole;
import com.fptu.eduBoostBackend.dto.request.LoginRequest;
import com.fptu.eduBoostBackend.dto.request.UserRegistrationRequest;
import com.fptu.eduBoostBackend.dto.response.CustomerResponse;
import com.fptu.eduBoostBackend.dto.response.UserResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.mapper.UserMapper;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.AuthenticationService;
import com.fptu.eduBoostBackend.service.EmailService;
import com.fptu.eduBoostBackend.service.RefreshTokenService;
import com.fptu.eduBoostBackend.service.TokenService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {



    @Value("${frontend.url.email.verification}")
    private String emailVerificationUrl;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Lazy
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    VerificationTokenRepository verificationTokenRepository;

    @Autowired
    EmailService emailService;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    @Override
    @Transactional
    public User register(UserRegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();

        // Fixed: Use interface type instead of implementation
        Set<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.TEACH_ROLE).ifPresent(roles::add);

        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Tạo bản ghi Teacher nếu user có role TEACHER
        if (roles.stream().anyMatch(role -> role.getName().equals(PredefinedRole.TEACH_ROLE))) {
            Teacher teacher = Teacher.builder()
                    .user(savedUser)
                    .build();
            teacherRepository.save(teacher);
            log.info("Teacher record created for user: {}", savedUser.getUsername());
        }

        // Tạo verification token
        String token = UUID.randomUUID().toString();
        createVerificationToken(savedUser, token);

        // Gửi email xác thực
        sendVerificationEmail(savedUser, token);

        return savedUser;
    }

    private void createVerificationToken(User user, String token) {
        VerificationToken verificationToken = new VerificationToken(token, user);
        verificationTokenRepository.save(verificationToken);
    }

    private void sendVerificationEmail(User user, String token) {
        String subject = "Xác thực tài khoản - Hệ thống EduBoost";
        String verificationUrl = emailVerificationUrl + "?token=" + token;
        String htmlContent = buildVerificationEmailHtml(user.getUsername(), verificationUrl);

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    private String buildVerificationEmailHtml(String username, String verificationUrl) {
        String currentTime = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Xác thực tài khoản</title>\n" +
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
                "      <h2 style=\"color: #333333; margin-bottom: 25px;\">Chào mừng " + escapeHtml(username) + "!</h2>\n" +
                "      \n" +
                "      <p style=\"color: #555555; line-height: 1.6; margin-bottom: 25px;\">\n" +
                "        Cảm ơn bạn đã đăng ký tài khoản tại <strong>EduBoost</strong>. \n" +
                "        Để hoàn tất quá trình đăng ký và kích hoạt tài khoản của bạn, vui lòng xác thực địa chỉ email bằng cách nhấn vào nút bên dưới:\n" +
                "      </p>\n" +
                "      \n" +
                "      <!-- Verification Box -->\n" +
                "      <div style=\"background: #f8f9ff; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0; text-align: center;\">\n" +
                "        <p style=\"color: #555555; margin-bottom: 20px; font-size: 16px;\">\n" +
                "          ✉️ Nhấn nút bên dưới để xác thực email của bạn:\n" +
                "        </p>\n" +
                "        \n" +
                "        <a href=\"" + verificationUrl + "\" \n" +
                "           style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); \n" +
                "                  color: white; padding: 16px 40px; text-decoration: none; \n" +
                "                  border-radius: 50px; font-weight: bold; font-size: 18px;\n" +
                "                  display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);\">\n" +
                "          ✓ Xác thực tài khoản\n" +
                "        </a>\n" +
                "        \n" +
                "        <div style=\"margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 6px;\">\n" +
                "          <p style=\"margin: 0; color: #856404; font-size: 14px;\">\n" +
                "            ⚠️ <strong>Lưu ý:</strong> Link xác thực có hiệu lực trong <span style=\"color: #e74c3c; font-weight: bold;\">24 giờ</span>.\n" +
                "          </p>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "      \n" +

                "      <!-- Security Notice -->\n" +
                "      <div style=\"margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;\">\n" +
                "        <p style=\"margin: 0; color: #2e7d32; font-size: 14px; line-height: 1.6;\">\n" +
                "          🔒 <strong>Bảo mật:</strong> Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này. \n" +
                "          Tài khoản của bạn sẽ không được tạo nếu không xác thực.\n" +
                "        </p>\n" +
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
                "        © " + java.time.LocalDate.now().getYear() + " Hệ thống EduBoost. Tất cả các quyền được bảo lưu.\n" +
                "      </p>\n" +
                "      <p style=\"margin: 10px 0 0 0; font-size: 12px; color: #bdc3c7;\">\n" +
                "        Đây là email tự động, vui lòng không trả lời email này.\n" +
                "      </p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    @Override
    @Transactional
    public void verifyAccount(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);
        if (verificationToken == null) {
            throw new BadRequestException("Token không hợp lệ");
        }

        if (verificationToken.isExpired()) {
            throw new BadRequestException("Token đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setVerify(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
    }

    @Override
    @Transactional
    public UserResponse login(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            User user = userRepository
                    .findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (!user.isVerify()) {
                throw new DisabledException("Account not verified. Please check your email.");
            }

        } catch (BadCredentialsException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException("Username/ password is invalid. Please try again!", e);
        } catch (LockedException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException("Account has been locked!", e);
        } catch (Exception e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException("Login failed: " + e.getMessage(), e);
        }

        User user = userRepository
                .findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found after authentication"));

        // Tạo authentication với authorities từ permissions
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(user.getUsername(), null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String token = tokenService.generateToken(user);

        return UserMapper.toResponse(user, token, refreshToken.getToken());
    }

    private Date calculateExpiryDate() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.SECOND, 3600);
        return new Date(cal.getTime().getTime());
    }

    @Override
    public User validatePasswordResetToken(String token) {
        PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token);
        if (passToken.getExpiryDate().before(new Date())) {
            throw new IllegalArgumentException("Token expired");
        }
        return passToken.getUser();
    }

    @Override
    @Transactional
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token);
        passwordResetTokenRepository.delete(resetToken);
    }




    @Override
    @Transactional
    public void createPasswordResetTokenForAccount(User user, String token) {
        // Xóa tất cả token cũ trước khi tạo mới (đảm bảo chỉ token mới nhất có hiệu lực)
        deleteAllResetTokensByUser(user);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(calculateExpiryDate());
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void deleteAllResetTokensByUser(User user) {
        passwordResetTokenRepository.deleteByUser(user);
    }

    // Thêm phương thức mới để xử lý reset password qua token
    @Override
    public void resetPasswordWithToken(String token, String newPassword) {
        User user = validatePasswordResetToken(token);
        changePassword(user, newPassword);
        deleteResetToken(token);
    }

    @Override
    public void changeUserPassword(String oldPassword, String newPassword) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Verify old password matches
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        // Fixed: Use efficient blank string check
        if (isBlankString(newPassword)) {
            throw new BadRequestException("New password cannot be empty");
        }

        if (newPassword.equals(oldPassword)) {
            throw new BadRequestException("New password must be different from old password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại"));
    }

    @Override
    @Transactional
    public void logout(User user) {
        user.incrementTokenVersion();
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public CustomerResponse mapUserToCustomerResponse(User user) {
        return userMapper.toUserResponse(user);
    }

    private boolean isBlankString(String str) {
        return str == null || str.isBlank();
    }

    @Override
    @Transactional
    public UserResponse loginWithGoogle(String idToken) {
        try {
            if (idToken == null || idToken.isEmpty()) {
                throw new BadRequestException("ID token is required");
            }

            if (googleClientId == null || googleClientId.isEmpty()) {
                log.error("Google Client ID is not configured");
                throw new BadRequestException("Google OAuth is not configured");
            }

            log.info("Verifying Google ID token for client: {}", googleClientId);

            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                log.error("Google token verification failed - token is null");
                throw new BadRequestException("Invalid Google token: Token verification failed");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            // Extract user information from token
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            log.info("Google token verified successfully. Email: {}", email);

            if (email == null || email.isEmpty()) {
                throw new BadRequestException("Email not found in Google token");
            }

            // Check if user exists by email
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            User user;

            if (existingUserOpt.isPresent()) {
                // User exists, login normally
                user = existingUserOpt.get();
                log.info("Existing user found: {}", email);

                // Check if account is locked
                if (!user.isAccountNonLocked()) {
                    throw new BadRequestException("Account has been locked!");
                }

                // Check if Teacher record exists, create if missing (for users who registered before this fix)
                boolean hasTeacherRole = user.getRoles().stream()
                        .anyMatch(role -> PredefinedRole.TEACH_ROLE.equals(role.getName()));
                if (hasTeacherRole && teacherRepository.findByUser(user).isEmpty()) {
                    Teacher teacher = Teacher.builder()
                            .user(user)
                            .build();
                    teacherRepository.save(teacher);
                    log.info("Created missing Teacher record for existing user: {}", email);
                }

                userRepository.save(user);
            } else {
                // User doesn't exist, auto-register
                log.info("User not found, creating new user: {}", email);

                // Generate username from email (take part before @)
                String username = email.split("@")[0];
                // Ensure username is unique
                String baseUsername = username;
                int counter = 1;
                while (userRepository.existsByUsername(username)) {
                    username = baseUsername + counter;
                    counter++;
                }

                // Generate a unique phone number placeholder (since phone is required and unique)
                // Use a pattern that won't conflict with real phone numbers
                String phonePlaceholder = "GOOGLE_" + UUID.randomUUID().toString().substring(0, 8);
                while (userRepository.existsByPhone(phonePlaceholder)) {
                    phonePlaceholder = "GOOGLE_" + UUID.randomUUID().toString().substring(0, 8);
                }

                // Create new user
                user = User.builder()
                        .username(username)
                        .email(email)
                        .phone(phonePlaceholder) // Placeholder phone for Google users
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password, user won't use it
                        .isVerify(true) // Google accounts are pre-verified
                        .build();

                // Assign default role (TEACH_ROLE - same as email registration)
                Set<Role> roles = new HashSet<>();
                Optional<Role> teachRole = roleRepository.findById(PredefinedRole.TEACH_ROLE);
                if (teachRole.isPresent()) {
                    roles.add(teachRole.get());
                    log.info("Assigned TEACH_ROLE to new Google user");
                } else {
                    log.warn("TEACH_ROLE not found in database, user will have no roles");
                }
                user.setRoles(roles);

                user = userRepository.save(user);
                log.info("Auto-registered new user from Google: {} with ID: {}", email, user.getUserId());

                // Create Teacher entity for Google users with TEACHER role
                if (teachRole.isPresent()) {
                    Teacher teacher = Teacher.builder()
                            .user(user)
                            .build();
                    teacherRepository.save(teacher);
                    log.info("Teacher record created for Google user: {}", email);
                }
            }

            // Generate tokens
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
            String token = tokenService.generateToken(user);

            log.info("Google login successful for user: {}", email);
            return UserMapper.toResponse(user, token, refreshToken.getToken());

        } catch (BadRequestException e) {
            // Re-throw BadRequestException as-is
            log.error("BadRequestException in Google login: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Google login failed", e);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
                log.error("Cause type: {}", e.getCause().getClass().getName());
            }
            throw new BadRequestException("Google login failed: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public UserResponse autoLogin(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Generate tokens giống như login thông thường
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String token = tokenService.generateToken(user);
        
        log.info("Auto-login successful for user: {}", username);
        return UserMapper.toResponse(user, token, refreshToken.getToken());
    }
}