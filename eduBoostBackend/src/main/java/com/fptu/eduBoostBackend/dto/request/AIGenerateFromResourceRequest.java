package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIGenerateFromResourceRequest {
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    @NotNull(message = "Lesson ID is required")
    private Long lessonId;
    
    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "Minimum 1 question")
    @Max(value = 50, message = "Maximum 50 questions")
    private Integer numberOfQuestions;
    
  
    private Map<String, Integer> cognitiveLevelDistribution;
    
    @Builder.Default
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;
    
    /**
     * AI Provider: CLAUDE, OPENAI, DEEPSEEK (default: CLAUDE)
     */
    @Builder.Default
    private String aiProvider = "DEEPSEEK";
}
