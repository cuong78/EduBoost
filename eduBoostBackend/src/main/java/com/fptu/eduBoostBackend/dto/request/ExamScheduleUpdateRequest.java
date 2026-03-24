package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Partial update request for teacher editing an exam schedule.
 * All fields are optional; null means "keep existing".
 */
@Getter
@Setter
public class ExamScheduleUpdateRequest {

    private String title;

    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Min(5)
    private Integer durationMinutes;

    private Integer allowLateMinutes;

    @Min(1)
    private Integer maxAttempts;

    /**
     * Optional password. If null => keep existing. Empty string is treated as "do not change"
     * (controller/FE should pass null when field is left blank).
     */
    private String password;

    /** IMMEDIATE or AFTER_ANNOUNCE. Null => keep existing. */
    private String scoreRevealMode;

    private ExamScheduleCreateRequest.LockdownSettings settings;
}

