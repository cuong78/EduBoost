package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoSelectQuestionsRequest {
    
    // Lesson distribution: lessonId -> numberOfQuestions
    @Valid
    private List<LessonDistributionRequest> lessonDistribution;
    
    // Cognitive level distribution by ID: cognitiveLevelId -> numberOfQuestions
    private Map<Long, Integer> cognitiveLevelDistribution;
    
    // Cognitive level distribution by code: levelCode (nb, th, vd, vdc) -> numberOfQuestions
    // Frontend uses this format: { nb: 4, th: 4, vd: 2, vdc: 0 }
    private Map<String, Integer> cognitiveLevelDistributionByCode;
    
    // If true, AI will generate questions when bank doesn't have enough
    @Builder.Default
    private Boolean useAiGeneration = true;
}
