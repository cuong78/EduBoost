package com.fptu.eduBoostBackend.dto.request;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitExamRequest {

    private Long assignmentId;

    /** [{questionId: X, selectedAnswer: "A"}] */
    private List<StudentAnswerItem> answers;

    private Integer timeTakenSeconds;

    /** MANUAL | AUTO_TIMER | AUTO_FOCUS_LOST */
    private String submissionSource;

    private Integer tabSwitchCount;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAnswerItem {
        private Long questionId;     // ExamQuestion ID
        private String selectedAnswer; // student's chosen answer text
    }
}
