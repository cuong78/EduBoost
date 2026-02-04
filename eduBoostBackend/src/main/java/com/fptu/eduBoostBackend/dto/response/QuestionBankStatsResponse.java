package com.fptu.eduBoostBackend.dto.response;

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
public class QuestionBankStatsResponse {
    private Long totalQuestions;
    private Map<String, Long> byLesson;
    private Map<String, Long> byCognitiveLevel;
    private Map<String, Long> byDifficultyLevel;
    private Long aiGeneratedCount;
}
