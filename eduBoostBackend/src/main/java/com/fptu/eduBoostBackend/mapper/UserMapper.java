package com.fptu.eduBoostBackend.mapper;


import com.fptu.eduBoostBackend.dto.response.CustomerResponse;
import com.fptu.eduBoostBackend.dto.response.UserResponse;
import com.fptu.eduBoostBackend.entities.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {
    // Convert User -> UserResponse (cho login)
    public static UserResponse toResponse(User user, String token, String refreshToken) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()))
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
    }
    public CustomerResponse toUserResponse(User user) {
        return CustomerResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()))
                .build();
    }
}
