package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.ExpiringInvitationResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationCleanupResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationDetailResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationStatsResponse;
import com.fptu.eduBoostBackend.service.AdminInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invitations")
@RequiredArgsConstructor
@SecurityRequirement(name = "api")
@Tag(name = "Admin Invitation Management", description = "APIs for admin to manage and monitor invitations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInvitationController {

    private final AdminInvitationService adminInvitationService;

    @GetMapping
    @Operation(
        summary = "Get all invitations",
        description = "Returns a list of all invitations with full details"
    )
    public ResponseEntity<List<InvitationDetailResponse>> getAllInvitations() {
        List<InvitationDetailResponse> invitations = adminInvitationService.getAllInvitations();
        return ResponseEntity.ok(invitations);
    }

    @GetMapping("/{invitationId}")
    @Operation(
        summary = "Get invitation detail",
        description = "Returns detailed information about a specific invitation"
    )
    public ResponseEntity<InvitationDetailResponse> getInvitationDetail(
            @Parameter(description = "Invitation ID", required = true)
            @PathVariable String invitationId) {
        InvitationDetailResponse invitation = adminInvitationService.getInvitationDetail(invitationId);
        return ResponseEntity.ok(invitation);
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Get invitation statistics",
        description = "Returns comprehensive statistics about invitations including counts by status and expiring invitations"
    )
    public ResponseEntity<InvitationStatsResponse> getInvitationStats() {
        InvitationStatsResponse stats = adminInvitationService.getInvitationStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/expiring")
    @Operation(
        summary = "Get expiring invitations",
        description = "Returns a list of active invitations that will expire within the specified number of days (default: 7 days)"
    )
    public ResponseEntity<List<ExpiringInvitationResponse>> getExpiringInvitations(
            @Parameter(description = "Number of days to look ahead (default: 7)")
            @RequestParam(required = false, defaultValue = "7") Integer days) {
        List<ExpiringInvitationResponse> expiring = adminInvitationService.getExpiringInvitations(days);
        return ResponseEntity.ok(expiring);
    }

    @PostMapping("/cleanup")
    @Operation(
        summary = "Cleanup expired invitations",
        description = "Marks all expired active invitations as EXPIRED. This can be used as a cron job or manual cleanup"
    )
    public ResponseEntity<InvitationCleanupResponse> cleanupExpiredInvitations() {
        InvitationCleanupResponse response = adminInvitationService.cleanupExpiredInvitations();
        return ResponseEntity.ok(response);
    }
}
