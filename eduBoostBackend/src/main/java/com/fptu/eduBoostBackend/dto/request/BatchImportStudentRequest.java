package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchImportStudentRequest {
    @NotBlank(message = "Class ID cannot be blank")
    private String classId;

}