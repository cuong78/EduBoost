package com.fptu.eduBoostBackend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResultDetailResponse {
    private Long resultId;
    private Long assignmentId;
    private Long examId;
    private String examTitle;
    private String studentName;
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal percentage;
    private String status;  // PASSED | FAILED
    private Integer timeTakenSeconds;
    private Integer tabSwitchCount;
    private String submissionSource;
    private LocalDateTime submittedAt;

    /** Per-question breakdown */
    private List<QuestionResultItem> questionResults;

    /** Role-based AI analysis */
    private String aiAnalysisStudent;
    private String aiAnalysisTeacher;
    private String aiAnalysisParent;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResultItem {
        private Long examQuestionId;
        private Integer orderNumber;
        private String questionText;
        private String correctAnswer;
        private String selectedAnswer;
        private boolean isCorrect;
        private BigDecimal points;
        private String explanation;
    }
}
