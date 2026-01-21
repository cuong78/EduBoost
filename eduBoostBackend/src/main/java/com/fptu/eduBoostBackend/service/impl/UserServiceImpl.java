package com.fptu.eduBoostBackend.service.impl;


import com.fptu.eduBoostBackend.dto.response.UserProfileResponse;
import com.fptu.eduBoostBackend.entities.Role;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile() {
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Fetch fresh user data from database
        User user = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Get wallet balance

        // Get roles
        var roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        
        // Get permissions
        var permissions = user.getAllPermissions();
        

        
        log.info("User profile retrieved for userId: {}", user.getUserId());
        
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isVerify(user.isVerify())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserByPhone(String phone) {
        log.info("Fetching user profile by phone: {}", phone);
        
        // Find user by phone number
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with phone: " + phone));
        

        
        // Get roles
        var roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        
        // Get permissions
        var permissions = user.getAllPermissions();
        

        
        log.info("User profile retrieved by phone for userId: {}", user.getUserId());
        
        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isVerify(user.isVerify())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roles)
                .permissions(permissions)
                .build();
    }
}
