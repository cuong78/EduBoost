package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAndSendInvitationRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Parent email is required")
    @Email(message = "Invalid email format")
    private String parentEmail;
}