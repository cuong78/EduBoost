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
        User user = authenticationService.register(request);
        return ResponseEntity.ok(
                new ResponseObject(
                        HttpStatus.OK.value(),
                        "Registration successful, please check email for authentication",
                        authenticationService.mapUserToCustomerResponse(user)
                )
        );
    }


    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(@RequestBody LoginRequest loginRequest) {
        UserResponse userResponse = authenticationService.login(loginRequest);
        return ResponseEntity.ok(
                new ResponseObject(HttpStatus.OK.value(), LOGIN_SUCCESSFUL, userResponse)
        );
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<ResponseObject> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = refreshTokenService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(
                new ResponseObject(HttpStatus.OK.value(), "Token refreshed successfully", response)
        );
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
        authenticationService.resetPasswordWithToken(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(
                new ResponseObject(HttpStatus.OK.value(), "Đặt lại mật khẩu thành công", null)
        );
    }
    @PostMapping("/logout")
    @SecurityRequirement(name = "api")
    @Transactional
    public ResponseEntity<ResponseObject> logout() {
        try {

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                throw new ForbiddenException("User is not authenticated");
            }
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
        authenticationService.verifyAccount(token);
        return ResponseEntity.ok(
                new ResponseObject(HttpStatus.OK.value(), "Xác thực tài khoản thành công", null)
        );

    }


    @PostMapping("/change-password")
    @SecurityRequirement(name = "api")
    public ResponseEntity<ResponseObject> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changeUserPassword(request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(
                new ResponseObject(HttpStatus.OK.value(), "Password changed successfully", null)
        );
    }

    @PostMapping("/google-login")
    public ResponseEntity<ResponseObject> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
            UserResponse userResponse = authenticationService.loginWithGoogle(request.getIdToken());
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), "Google login successful", userResponse));

    }

   
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
