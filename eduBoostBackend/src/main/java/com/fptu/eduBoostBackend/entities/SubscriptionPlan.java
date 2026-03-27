package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.enums.BillingCycle;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** e.g. "FREE", "PRO_MONTHLY", "PRO_YEARLY" */
    @Column(nullable = false, unique = true, length = 30)
    private String planCode;

    @Column(nullable = false, length = 100)
    private String planName;

    /** 0 for FREE */
    @Column(nullable = false, precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private BillingCycle billingCycle; // null for FREE

    /** Duration in days derived from billingCycle (30 / 365) */
    @Column
    private Integer durationDays;

    /* ─── Quota limits (null = unlimited) ─── */
    @Column
    private Integer maxClasses;

    @Column
    private Integer maxStudents;

    @Column
    private Integer maxExamsPerMonth;

    @Column
    private Integer maxAIRequestsPerMonth;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
