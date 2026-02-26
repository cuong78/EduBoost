package com.fptu.eduBoostBackend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fptu.eduBoostBackend.entities.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long userId;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String avatarUrl;
    private UserStatus status;
    
    @JsonProperty("isVerify")
    private boolean isVerify;
    
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> roles;
    
    // For teachers
    private String teachingClass;
    
    // For students
    private String studyingClass;
    
    public boolean isVerify() {
        return isVerify;
    }
    
    public void setVerify(boolean verify) {
        this.isVerify = verify;
    }
}
