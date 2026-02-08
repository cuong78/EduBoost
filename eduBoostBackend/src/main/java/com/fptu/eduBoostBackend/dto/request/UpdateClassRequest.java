package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateClassRequest {
    @Size(max = 100, message = "Class name must not exceed 100 characters")
    private String className;

    @Size(max = 20, message = "School year must not exceed 20 characters")
    private String schoolYear;

    private String description;
    
    private String teacherId;
    
    private String status;
}
