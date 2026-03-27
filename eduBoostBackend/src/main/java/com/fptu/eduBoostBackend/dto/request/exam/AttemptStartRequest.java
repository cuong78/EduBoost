package com.fptu.eduBoostBackend.dto.request.exam;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttemptStartRequest {

    @NotNull
    private Long examId;

    // Optional: exam schedule to enforce start window (startTime + allowLateMinutes)
    private Long scheduleId;

    // Optional: password required by exam schedule.
    private String schedulePassword;
}

