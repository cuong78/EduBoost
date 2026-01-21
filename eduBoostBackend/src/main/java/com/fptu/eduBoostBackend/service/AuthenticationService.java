package com.fptu.eduBoostBackend.service;


import com.fptu.eduBoostBackend.dto.request.LoginRequest;
import com.fptu.eduBoostBackend.dto.request.UserRegistrationRequest;
import com.fptu.eduBoostBackend.dto.response.CustomerResponse;
import com.fptu.eduBoostBackend.dto.response.UserResponse;
import com.fptu.eduBoostBackend.entities.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface AuthenticationService extends UserDetailsService {
    User register(UserRegistrationRequest request);

    UserResponse login(LoginRequest loginRequest);

    void createPasswordResetTokenForAccount(User user, String token);

    User validatePasswordResetToken(String token);

    void changePassword(User user, String newPassword);

    void deleteResetToken(String token);

    void verifyAccount(String token);

    void deleteAllResetTokensByUser(User user);

    void resetPasswordWithToken(String token, String newPassword);

    void changeUserPassword(String oldPassword, String newPassword);
    
    // New methods for controller
    User findUserByEmail(String email);
    
    void logout(User user);
    
    CustomerResponse mapUserToCustomerResponse(User user);
}
