package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.UpdateUserStatusRequest;
import com.fptu.eduBoostBackend.dto.response.AdminUserResponse;
import com.fptu.eduBoostBackend.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Admin User Management", description = "APIs for admin to manage users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Get all users", 
               description = "Returns a list of all users in the system")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID", 
               description = "Returns detailed information of a specific user")
    public ResponseEntity<AdminUserResponse> getUserById(
            @Parameter(description = "User ID", required = true)
            @PathVariable Long userId) {
        AdminUserResponse user = adminUserService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}/status")
    @Operation(summary = "Update user status", 
               description = "Updates the status of a user (ACTIVE, INACTIVE, SUSPENDED)")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @Parameter(description = "User ID", required = true)
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        AdminUserResponse updatedUser = adminUserService.updateUserStatus(userId, request);
        return ResponseEntity.ok(updatedUser);
    }
}
