package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamConfigRequest {
    
    @NotNull(message = "Total questions is required")
    @Min(value = 1, message = "Total questions must be at least 1")
    private Integer totalQuestions;
    
    @NotNull(message = "Points per question is required")
    @DecimalMin(value = "0.1", message = "Points per question must be at least 0.1")
    private BigDecimal pointsPerQuestion;
    
    @Valid
    private List<LessonDistributionRequest> lessonDistribution;
}
