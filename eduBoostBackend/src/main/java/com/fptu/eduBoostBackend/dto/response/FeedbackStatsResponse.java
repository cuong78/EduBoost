package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackStatsResponse {
    private long totalFeedback;
    private long submittedCount;
    private long inProgressCount;
    private long respondedCount;
    private long closedCount;
    private Double averageRating;
}
