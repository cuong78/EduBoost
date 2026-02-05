package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Max;
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
public class ExamAIGenerateRequest {
    
    @NotNull(message = "Lesson ID is required")
    private Long lessonId;
    
    @NotNull(message = "Cognitive level ID is required")
    private Long cognitiveLevelId;
    
    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "Number of questions must be at least 1")
    @Max(value = 20, message = "Number of questions must be at most 20")
    private Integer numberOfQuestions;
    
    private BigDecimal pointsPerQuestion;
}
