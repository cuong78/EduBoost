package com.fptu.eduBoostBackend.dto.response.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptReviewResponse {

    private String attemptCode;
    private Long examId;
    private String examTitle;
    /** True when correct answers / per-question scoring may be shown. */
    private boolean answerKeyRevealed;
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal percentage;
    private Integer correctCount;
    private Integer totalQuestions;

    private List<ReviewQuestionDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewQuestionDto {
        private Long examQuestionId;
        private Integer orderNumber;
        private String questionText;
        private List<String> options;
        private String questionType;
        private String selectedOption;
        /** For open-ended / FILL_BLANK questions where student input is free text. */
        private String textAnswer;
        private String correctAnswer;
        private Boolean correct;
        private BigDecimal points;
        private BigDecimal pointsEarned;

        // Teacher manual grading overrides (optional; only returned by teacher endpoints)
        private BigDecimal teacherPointsOverride;
        private String teacherComment;
    }
}
