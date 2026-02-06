package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateFromResourceResponse {
    
    private Long resourceId;
    private Long lessonId;
    private String resourceName;
    private String lessonName;
    
    private List<AIGeneratedQuestionResponse> generatedQuestions;
    
    private int totalQuestionsGenerated;
    private int tokensUsed;
    private long generationTimeMs;
    private String aiProvider;
    
    private List<String> warnings;
}
