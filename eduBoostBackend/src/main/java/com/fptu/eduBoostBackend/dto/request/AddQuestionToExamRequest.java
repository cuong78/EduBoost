package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddQuestionToExamRequest {
    
    @NotNull(message = "Question ID is required")
    private Long questionId;
    
    private Integer orderNumber;
    
    @NotNull(message = "Points is required")
    @DecimalMin(value = "0.1", message = "Points must be at least 0.1")
    private BigDecimal points;
}
