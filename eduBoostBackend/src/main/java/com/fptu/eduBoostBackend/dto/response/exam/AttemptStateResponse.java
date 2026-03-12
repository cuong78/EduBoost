package com.fptu.eduBoostBackend.dto.response.exam;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class AttemptStateResponse {

    private String attemptCode;
    private Long examId;
    private String examTitle;
    private Integer durationMinutes;
    private Integer remainingSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    private List<AttemptStartResponse.AttemptQuestionDto> questions;

    private Integer currentQuestionIndex;
    private Long serverVersion;
}

