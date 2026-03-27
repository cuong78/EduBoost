package com.fptu.eduBoostBackend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private BigDecimal revenueLastMonth;
    private long totalTransactions;
    private long successCount;
    private long pendingCount;
    private long cancelledCount;
    private long failedCount;
    private long activeSubscriptions;
    private List<MonthlyRevenue> monthlyRevenue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;     // "2026-03"
        private BigDecimal amount;
        private long count;
    }
}
