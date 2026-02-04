package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRequest {
    
    @NotBlank(message = "Subject code cannot be blank")
    @Size(max = 20, message = "Subject code must not exceed 20 characters")
    private String subjectCode;

    private String description;
}
