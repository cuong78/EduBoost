package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankRequest {
    
    @NotNull(message = "Lesson ID cannot be null")
    private Long lessonId;
    
    @NotBlank(message = "Question text cannot be blank")
    private String questionText;
    
    @NotBlank(message = "Correct answer cannot be blank")
    private String correctAnswer;
    
    private String explanation;
    
    @NotNull(message = "Question type cannot be null")
    private QuestionType questionType;
    
    @NotNull(message = "Cognitive level ID cannot be null")
    private Long cognitiveLevelId;
    
    private DifficultyLevel difficultyLevel;
    
    private QuestionSourceType sourceType;
}
