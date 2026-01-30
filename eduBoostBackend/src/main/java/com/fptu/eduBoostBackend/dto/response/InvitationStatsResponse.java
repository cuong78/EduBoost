package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationStatsResponse {
    private long total;
    private long active;
    private long used;
    private long expired;
    private long revoked;
    private long expiringIn7Days;
    private long expiringIn30Days;
}
