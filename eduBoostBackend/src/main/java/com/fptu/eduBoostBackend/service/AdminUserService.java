package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.UpdateUserRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateUserStatusRequest;
import com.fptu.eduBoostBackend.dto.response.AdminUserResponse;

import java.util.List;

public interface AdminUserService {
    List<AdminUserResponse> getAllUsers();
    AdminUserResponse getUserById(Long userId);
    AdminUserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);
    AdminUserResponse updateUser(Long userId, UpdateUserRequest request);
}
