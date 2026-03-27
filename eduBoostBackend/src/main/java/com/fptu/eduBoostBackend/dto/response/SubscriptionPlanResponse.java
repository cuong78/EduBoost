package com.fptu.eduBoostBackend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SubscriptionPlanResponse {
    private Long id;
    private String planCode;
    private String planName;
    private BigDecimal price;
    private String billingCycle;
    private Integer durationDays;
    private Integer maxClasses;
    private Integer maxStudents;
    private Integer maxExamsPerMonth;
    private Integer maxAIRequestsPerMonth;
    private String description;
    private boolean isActive;
}
