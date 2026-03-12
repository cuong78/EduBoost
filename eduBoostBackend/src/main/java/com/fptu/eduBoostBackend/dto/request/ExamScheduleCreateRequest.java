package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ExamScheduleCreateRequest {

    @NotNull
    private Long examId;

    @NotBlank
    private String classId;

    private String title;

    private String description;

    @NotNull
    @Future
    private LocalDateTime startTime;

    @NotNull
    @Future
    private LocalDateTime endTime;

    @NotNull
    @Min(5)
    private Integer durationMinutes;

    private Integer allowLateMinutes;

    private Integer maxAttempts;

    private String password;
}

