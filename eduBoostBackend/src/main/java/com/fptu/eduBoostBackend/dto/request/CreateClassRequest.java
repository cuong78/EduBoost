package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClassRequest {
    @NotBlank(message = "Class name cannot be blank")
    @Size(max = 100, message = "Class name must not exceed 100 characters")
    private String className;

    @NotBlank(message = "Class code cannot be blank")
    @Size(max = 50, message = "Class code must not exceed 50 characters")
    private String classCode;

    @NotBlank(message = "Grade level cannot be blank")
    @Size(max = 50, message = "Grade level must not exceed 50 characters")
    private String gradeLevel;

    @Size(max = 20, message = "School year must not exceed 20 characters")
    private String schoolYear;

    private String description;
}
