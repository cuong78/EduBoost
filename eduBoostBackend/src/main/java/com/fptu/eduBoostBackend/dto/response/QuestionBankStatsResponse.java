package com.fptu.eduBoostBackend.dto.response;

import java.util.Map;

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
public class QuestionBankStatsResponse {
    private Long totalQuestions;
    private Map<String, Long> byLesson;
    private Map<String, Long> byCognitiveLevel;
    private Map<String, Long> byDifficultyLevel;
    private Long aiGeneratedCount;
    private Long manualCount;
    private Long importedCount;
}
