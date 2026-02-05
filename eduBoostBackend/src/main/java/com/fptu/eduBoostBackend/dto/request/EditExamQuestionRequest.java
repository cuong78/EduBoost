package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class EditExamQuestionRequest {
    
    @NotBlank(message = "Question text is required")
    private String modifiedQuestionText;
    
    @NotBlank(message = "Correct answer is required")
    private String modifiedCorrectAnswer;
    
    private String modifiedExplanation;
    
    private String wrongAnswer1;
    private String wrongAnswer2;
    private String wrongAnswer3;
}
