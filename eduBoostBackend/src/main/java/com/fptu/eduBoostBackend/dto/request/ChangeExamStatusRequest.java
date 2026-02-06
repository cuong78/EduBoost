package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeExamStatusRequest {
    
    @NotNull(message = "New status is required")
    private ExamStatus newStatus;
    
    private String note;
}
