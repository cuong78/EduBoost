package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentResponse {
    private boolean success;
    private String message;
    private String studentId;
    private String studentCode;
    private String className;
    private String teacherName;
    private boolean newUser;
    private String temporaryPassword; // Only included if newUser = true
    private String token;
    private String refreshToken;
}
