package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.UpdateUserRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateUserStatusRequest;
import com.fptu.eduBoostBackend.dto.response.AdminUserResponse;
import com.fptu.eduBoostBackend.entities.Role;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.repositories.RoleRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToAdminUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertToAdminUserResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setStatus(request.getStatus());
        User updatedUser = userRepository.save(user);
        
        return convertToAdminUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Update basic info if provided
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            // Check if email already exists for another user
            if (userRepository.existsByEmailAndUserIdNot(request.getEmail(), userId)) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            // Check if phone already exists for another user
            if (userRepository.existsByPhoneAndUserIdNot(request.getPhone(), userId)) {
                throw new RuntimeException("Phone number already exists");
            }
            user.setPhone(request.getPhone());
        }
        
        // Update status if provided
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        
        // Update roles if provided
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findById(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }
        
        User updatedUser = userRepository.save(user);
        return convertToAdminUserResponse(updatedUser);
    }

    private AdminUserResponse convertToAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .isVerify(user.isVerify())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }
}
