package com.fptu.eduBoostBackend.dto.response;

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
public class StudentExamResultSummaryResponse {
    private Long resultId;
    private Long examId;
    private String examTitle;
    private String subjectName;
    private String subjectCode;
    private String chapterName;
    private Integer semester;
    private String schoolYear;
    private LocalDateTime takenAt;
    private BigDecimal score;
    private BigDecimal maxScore;
    private BigDecimal percentage;
    private String status;
    private String sourceType;
}

