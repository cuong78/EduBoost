package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.ExpiringInvitationResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationCleanupResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationDetailResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationStatsResponse;

import java.util.List;

public interface AdminInvitationService {
    InvitationStatsResponse getInvitationStats();
    List<ExpiringInvitationResponse> getExpiringInvitations(Integer days);
    InvitationCleanupResponse cleanupExpiredInvitations();
    List<InvitationDetailResponse> getAllInvitations();
    InvitationDetailResponse getInvitationDetail(String invitationId);
}
