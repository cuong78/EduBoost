package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateFromUrlRequest {
    
    @NotBlank(message = "URL is required")
    @URL(message = "Invalid URL format")
    private String url;
    
    @NotNull(message = "Lesson ID is required")
    private Long lessonId;
    
    @NotNull(message = "Number of questions is required")
    @Min(value = 1, message = "Minimum 1 question")
    @Max(value = 30, message = "Maximum 30 questions")
    private Integer numberOfQuestions;
    
    private Long cognitiveLevelId;
    
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;
    
    /**
     * AI Provider: DEEPSEEK (default)
     */
    private String aiProvider = "DEEPSEEK";
}
