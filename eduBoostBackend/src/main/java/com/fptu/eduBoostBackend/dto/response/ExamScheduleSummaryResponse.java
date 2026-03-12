package com.fptu.eduBoostBackend.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ExamScheduleSummaryResponse {

    private Long id;
    private Long examId;
    private String examTitle;
    private String classId;
    private String className;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String status;
}

