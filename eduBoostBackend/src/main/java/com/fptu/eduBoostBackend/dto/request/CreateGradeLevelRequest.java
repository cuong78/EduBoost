package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGradeLevelRequest {
    @NotBlank(message = "Grade name cannot be blank")
    @Size(max = 50, message = "Grade name must not exceed 50 characters")
    private String gradeName;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
