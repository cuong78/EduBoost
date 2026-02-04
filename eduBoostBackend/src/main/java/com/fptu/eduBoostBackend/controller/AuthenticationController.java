package com.fptu.eduBoostBackend.controller;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fptu.eduBoostBackend.constant.ResponseObject;
import com.fptu.eduBoostBackend.dto.request.ChangePasswordRequest;
import com.fptu.eduBoostBackend.dto.request.ForgotPasswordRequest;
import com.fptu.eduBoostBackend.dto.request.GoogleLoginRequest;
import com.fptu.eduBoostBackend.dto.request.LoginRequest;
import com.fptu.eduBoostBackend.dto.request.ResetPasswordWithTokenRequest;
import com.fptu.eduBoostBackend.dto.request.TokenRefreshRequest;
import com.fptu.eduBoostBackend.dto.request.UserRegistrationRequest;
import com.fptu.eduBoostBackend.dto.response.TokenRefreshResponse;
import com.fptu.eduBoostBackend.dto.response.UserResponse;
import com.fptu.eduBoostBackend.entities.RefreshToken;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.InternalServerErrorException;
import com.fptu.eduBoostBackend.exception.exceptions.NotFoundException;
import com.fptu.eduBoostBackend.exception.exceptions.TokenRefreshException;
import com.fptu.eduBoostBackend.mapper.UserMapper;
import com.fptu.eduBoostBackend.service.AuthenticationService;
import com.fptu.eduBoostBackend.service.EmailService;
import com.fptu.eduBoostBackend.service.OneTimeLoginTokenService;
import com.fptu.eduBoostBackend.service.RefreshTokenService;
import com.fptu.eduBoostBackend.service.TokenService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    // Constants to avoid duplicate literals
    private static final String ACCOUNT_LOCKED_MESSAGE = "Account has been locked!";
    private static final String LOGIN_SUCCESSFUL = "Login successful";

    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final OneTimeLoginTokenService oneTimeLoginTokenService;
    private final TokenService tokenService;

    @Value("${frontend.url.base}")
    private String frontendUrl;
    
    @Value("${frontend.url.auto.login.callback}")
    private String autoLoginCallbackUrl;

    @PostMapping("/register")
    public ResponseEntity<ResponseObject> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            User user = authenticationService.register(request);
            return ResponseEntity.ok()
                    .body(new ResponseObject(
                            HttpStatus.OK.value(),
                            "Registration successful, please check email for authentication",
                            authenticationService.mapUserToCustomerResponse(user)));
        } catch (ConflictException e) {
            throw e;
        } catch (RuntimeException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException(e.getMessage(), e);
        }
    }


    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(@RequestBody LoginRequest loginRequest) {
        try {
            UserResponse userResponse = authenticationService.login(loginRequest);
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), LOGIN_SUCCESSFUL, userResponse));
        } catch (RuntimeException e) {
            // Fixed: Position literals first in String comparisons
            if (ACCOUNT_LOCKED_MESSAGE.equals(e.getMessage())) {
                // Fixed: Preserve stack trace
                throw new ForbiddenException(e.getMessage(), e);
            }
            // Fixed: Preserve stack trace
            throw new BadRequestException(e.getMessage(), e);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ResponseObject> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        try {
            TokenRefreshResponse response = refreshTokenService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok()
                    .body(new ResponseObject(
                            HttpStatus.OK.value(),
                            "Token refreshed successfully",
                            response));
        } catch (TokenRefreshException e) {
            // Fixed: Preserve stack trace
            throw new ForbiddenException(e.getMessage(), e);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseObject> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            User user = authenticationService.findUserByEmail(request.getEmail());

            // Tạo token reset password
            String token = UUID.randomUUID().toString();

            // Xóa tất cả token cũ của user
            authenticationService.deleteAllResetTokensByUser(user);

            // Tạo token mới
            authenticationService.createPasswordResetTokenForAccount(user, token);

            // Tạo link reset password
            String resetPasswordLink = frontendUrl + "/reset-password?token=" + token;

            String emailSubject = "Yêu cầu đặt lại mật khẩu";
            String emailText = "Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu của bạn:\n\n"
                    + resetPasswordLink + "\n\n"
                    + "Liên kết này sẽ hết hạn sau 1 giờ.\n"
                    + "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.";

            emailService.sendEmail(request.getEmail(), emailSubject, emailText);

            return ResponseEntity.ok()
                    .body(new ResponseObject(
                            HttpStatus.OK.value(), "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.", null));
        } catch (UsernameNotFoundException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException(e.getMessage(), e);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseObject> resetPasswordWithToken(@RequestBody ResetPasswordWithTokenRequest request) {
        try {
            authenticationService.resetPasswordWithToken(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), "Đặt lại mật khẩu thành công", null));
        } catch (Exception e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException(e.getMessage(), e);
        }
    }

    @PostMapping("/logout")
    @SecurityRequirement(name = "api")
    @Transactional
    public ResponseEntity<ResponseObject> logout() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) authentication.getPrincipal();

            authenticationService.logout(user);

            return ResponseEntity.ok().body(new ResponseObject(HttpStatus.OK.value(), "Logout successful", null));
        } catch (Exception e) {
            // Fixed: Preserve stack trace
            throw new InternalServerErrorException("Logout failed: " + e.getMessage(), e);
        }
    }



    @PostMapping("/verify")
    public ResponseEntity<ResponseObject> verifyAccount(@RequestParam String token) {
        try {
            authenticationService.verifyAccount(token);
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), "Xác thực tài khoản thành công", null));
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null));
        }
    }


    @PostMapping("/change-password")
    @SecurityRequirement(name = "api")
    public ResponseEntity<ResponseObject> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            authenticationService.changeUserPassword(request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), "Password changed successfully", null));
        } catch (UsernameNotFoundException e) {
            // Fixed: Preserve stack trace
            throw new NotFoundException("User not found", e);
        } catch (BadRequestException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException(e.getMessage(), e);
        } catch (Exception e) {
            // Fixed: Preserve stack trace
            throw new InternalServerErrorException("Failed to change password: " + e.getMessage(), e);
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<ResponseObject> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            UserResponse userResponse = authenticationService.loginWithGoogle(request.getIdToken());
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), "Google login successful", userResponse));
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Google login failed: " + e.getMessage(), e);
        }
    }

    /**
     * Auto-login endpoint using one-time token.
     *
     * Lưu ý:
     * - Email hiện tại đang gửi link dạng: GET https://.../api/auth/auto-login?token=xxx
     * - Frontend cũng có thể gọi POST cùng endpoint này.
     *
     * Vì vậy endpoint này chấp nhận cả GET và POST để tránh lỗi 403/405 khi user click link trong email.
     */
    @org.springframework.web.bind.annotation.RequestMapping(
            value = "/auto-login",
            method = {org.springframework.web.bind.annotation.RequestMethod.GET,
                    org.springframework.web.bind.annotation.RequestMethod.POST}
    )
    public ResponseEntity<?> autoLogin(@RequestParam String token) {
        try {
            // Validate token và lấy username
            String username = oneTimeLoginTokenService.validateTokenAndGetUsername(token);
            
            // Login thông thường với username
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(null); // Không cần password cho auto-login
            
            // Gọi service để tạo JWT và refresh token
            UserResponse userResponse = authenticationService.autoLogin(username);
            
            // Redirect to frontend với tokens
            String redirectUrl = String.format("%s?token=%s&refreshToken=%s",
                    autoLoginCallbackUrl,
                    userResponse.getToken(),
                    userResponse.getRefreshToken()
            );
            
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
        } catch (RuntimeException e) {
            // Nếu lỗi, redirect về login page với error
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl + "/login?error=" + e.getMessage())
                    .build();
        }
    }
}
