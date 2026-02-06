package com.fptu.eduBoostBackend.dto.request;

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
public class QuestionOrderRequest {
    
    @NotNull(message = "Exam question ID is required")
    private Long examQuestionId;
    
    @NotNull(message = "New order number is required")
    private Integer newOrderNumber;
}
