package com.fptu.eduBoostBackend.dto.request;

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
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @NotNull
    @Min(5)
    private Integer durationMinutes;

    private Integer allowLateMinutes;

    private Integer maxAttempts;

    private String password;

    /** Optional lockdown/anti-cheat settings. Defaults will be applied if null. */
    private LockdownSettings settings;

    /**
     * IMMEDIATE = show score when student submits.
     * AFTER_ANNOUNCE = hide score until teacher announces results.
     */
    private String scoreRevealMode;

    @Getter
    @Setter
    public static class LockdownSettings {
        /** Maximum number of tab-switch violations before action is taken. Default 3. */
        private Integer maxTabSwitches = 3;
        /** Whether fullscreen is required to start the exam. */
        private Boolean requireFullscreen = false;
        /** If true, attempt is auto-submitted when violation threshold is hit. */
        private Boolean autoSubmitOnViolation = false;
    }
}

