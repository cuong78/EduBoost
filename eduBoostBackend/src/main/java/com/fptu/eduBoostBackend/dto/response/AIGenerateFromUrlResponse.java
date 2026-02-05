package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateFromUrlResponse {
    private String sourceUrl;
    private Long lessonId;
    private String lessonName;
    private String extractedTitle;
    private int contentLength;
    private List<AIGeneratedQuestionResponse> generatedQuestions;
    private int totalQuestionsGenerated;
    private int tokensUsed;
    private long generationTimeMs;
    private String aiProvider;
    private List<String> warnings;
}
