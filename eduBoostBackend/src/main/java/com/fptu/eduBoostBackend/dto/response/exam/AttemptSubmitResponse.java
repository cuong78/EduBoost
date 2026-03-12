package com.fptu.eduBoostBackend.dto.response.exam;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class AttemptSubmitResponse {

    private String attemptCode;
    private Long examId;
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal percentage;
    private Integer correctCount;
    private Integer totalQuestions;
}

