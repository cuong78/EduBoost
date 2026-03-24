package com.fptu.eduBoostBackend.dto.request.exam;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class TeacherAttemptGradeRequest {

    @NotNull
    private List<QuestionGrade> questionGrades;

    @Getter
    @Setter
    public static class QuestionGrade {
        @NotNull
        private Long examQuestionId;

        /**
         * Manual override points for the question.
         * For non-FILL_BLANK questions, the backend will ignore this.
         */
        private BigDecimal teacherPointsOverride;

        /** Optional teacher comment for this question. */
        private String teacherComment;
    }
}

