package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGeneratedQuestionResponse {
    
    private String questionText;
    private String correctAnswer;
    private List<String> wrongAnswers;
    private String explanation;
    private String cognitiveLevel;
    private QuestionType questionType;
}
