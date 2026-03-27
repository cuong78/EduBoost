package com.fptu.eduBoostBackend.dto.response.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentExamAttemptHistoryResponse {
    private String attemptCode;
    private Integer attemptNumber;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer violationCount;
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal percentage;
    private Boolean scoresHidden;
}
