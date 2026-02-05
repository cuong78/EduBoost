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
public class MatrixTemplateDetailRequest {
    
    @NotNull(message = "Cognitive level ID is required")
    private Long cognitiveLevelId;
    
    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "Number of questions must be at least 1")
    private Integer numberOfQuestions;
    
    @NotNull(message = "Points per question is required")
    @DecimalMin(value = "0.1", message = "Points per question must be at least 0.1")
    private BigDecimal pointsPerQuestion;
}
