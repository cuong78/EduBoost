package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentRequest {
    @NotBlank
    private String classId;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String fullName;

    private String phone;
}
