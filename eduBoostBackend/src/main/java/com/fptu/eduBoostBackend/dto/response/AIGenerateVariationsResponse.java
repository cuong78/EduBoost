package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateVariationsResponse {
    private List<VariationGroup> variationGroups;
    private int totalVariationsGenerated;
    private int tokensUsed;
    private long generationTimeMs;
    private String aiProvider;
    private List<String> warnings;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariationGroup {
        private Long baseQuestionId;
        private String baseQuestionText;
        private List<AIGeneratedQuestionResponse> variations;
    }
}
