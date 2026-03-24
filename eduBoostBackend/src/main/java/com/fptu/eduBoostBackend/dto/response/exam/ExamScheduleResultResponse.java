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
public class ExamScheduleResultResponse {
    private String attemptCode;
    private String studentId;
    private String studentName;
    private String email;
    private String status; // ExamAttemptStatus (IN_PROGRESS, SUBMITTED, EXPIRED)
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer violationCount;
    private BigDecimal score;
    private BigDecimal percentage;
}
