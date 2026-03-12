package com.fptu.eduBoostBackend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TeacherSubscriptionResponse {
    private Long id;
    private String teacherId;
    private String teacherName;
    private SubscriptionPlanResponse plan;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private boolean autoRenew;
    private LocalDateTime createdAt;
    /** Days remaining, null if no expiry */
    private Long daysRemaining;
}
