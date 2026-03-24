package com.fptu.eduBoostBackend.dto.response.exam;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class AttemptStartResponse {

    private String attemptCode;
    private String activeTabToken;

    private Long examId;
    private String examTitle;
    private Integer durationMinutes;
    private Integer remainingSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    private List<AttemptQuestionDto> questions;

    private Integer currentQuestionIndex;
    private Long serverVersion;

    @Getter
    @Setter
    @Builder
    public static class AttemptQuestionDto {
        private Long examQuestionId;
        private Integer orderNumber;
        private String questionText;
        private List<String> options;
        /** Question type (e.g. MULTIPLE_CHOICE / TRUE_FALSE / FILL_BLANK) to drive FE rendering. */
        private String questionType;
        private String selectedOption;
        private String textAnswer;
        private Boolean flagged;
    }
}

