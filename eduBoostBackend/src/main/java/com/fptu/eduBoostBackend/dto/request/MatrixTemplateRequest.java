package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrixTemplateRequest {
    
    @NotBlank(message = "Template name is required")
    @Size(max = 200, message = "Template name must not exceed 200 characters")
    private String templateName;
    
    @NotNull(message = "Exam type ID is required")
    private Long examTypeId;
    
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    
    @NotNull(message = "Grade level is required")
    @Min(value = 1, message = "Grade level must be at least 1")
    @Max(value = 12, message = "Grade level must be at most 12")
    private Integer gradeLevel;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Boolean isDefault = false;
    
    @NotEmpty(message = "At least one detail is required")
    @Valid
    private List<MatrixTemplateDetailRequest> details;
}
