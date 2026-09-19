package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleEnrollmentRequest {
    @NotBlank(message = "ID token is required")
    private String idToken;

    @NotBlank(message = "Class ID is required")
    private String classId;
}
