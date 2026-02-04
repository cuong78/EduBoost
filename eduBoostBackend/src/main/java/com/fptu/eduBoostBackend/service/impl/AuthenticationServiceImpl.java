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
        String subject = "Xác thực tài khoản";
        String verificationUrl = emailVerificationUrl + "?token=" + token;
        String text = "Chào " + user.getUsername() + ",\n\n"
                + "Vui lòng nhấp vào liên kết sau để xác thực tài khoản của bạn:\n"
                + verificationUrl + "\n\n"
                + "Liên kết có hiệu lực trong 24 giờ.";

        emailService.sendEmail(user.getEmail(), subject, text);
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

                // User already exists, just login
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
            }

            // Create authentication
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

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