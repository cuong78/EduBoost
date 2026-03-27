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
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Integer allowLateMinutes;
    private String status;
    /** Raw JSON string of lockdown settings. */
    private String settings;

    private String scoreRevealMode;
    private LocalDateTime resultsAnnouncedAt;
    private Boolean hasPassword;

    /** Populated for student upcoming list only. */
    private Boolean studentSubmitted;
    /** True if student submitted but scores not yet announced (AFTER_ANNOUNCE). */
    private Boolean scoresPendingAnnouncement;
    /** Latest submitted attempt code for review link (student list only). */
    private String submittedAttemptCode;
}
