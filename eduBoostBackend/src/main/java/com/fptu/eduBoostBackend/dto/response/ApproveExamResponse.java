package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
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
public class ApproveExamResponse {
    private Long examId;
    private ExamStatus status;
    private int newQuestionsSaved;
    private ApproveBreakdown breakdown;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApproveBreakdown {
        private int aiGenerated;
        private int teacherEdited;
    }
}
