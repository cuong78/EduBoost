package com.fptu.eduBoostBackend.dto.response;

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
public class QuestionDuplicateCheckResponse {

    /** 0-100: percentage of similarity with most similar existing question */
    private double duplicatePercentage;

    /** ID of the most similar question found (null if none) */
    private Long mostSimilarQuestionId;

    /** Text of the most similar question found (null if none) */
    private String mostSimilarQuestionText;

    /** Short AI analysis explaining the similarity */
    private String analysis;

    /** Number of existing questions that were compared */
    private int comparedCount;
}
