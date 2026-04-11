package com.fptu.eduBoostBackend.dto.request;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAssignmentRequest {

    /** The exam to assign (original or variant) */
    private Long examId;

    /** List of class IDs to assign to — 1 entry = same exam to all,
     *  or use classVariantMap for 1-variant-per-class */
    private List<String> classIds;

    /** Optional: map classId → variantExamId (for multi-variant distribution) */
    private java.util.Map<String, Long> classVariantMap;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /** Duration in minutes — overrides exam's default if provided */
    private Integer durationMinutes;

    private Boolean notifyParent;
    private Integer allowedAttempts;

    /** List of exam IDs (original + variants) for random per-student distribution */
    private List<Long> selectedExamIds;
}
