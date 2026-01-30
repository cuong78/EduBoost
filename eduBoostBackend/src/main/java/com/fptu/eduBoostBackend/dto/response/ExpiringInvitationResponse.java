package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpiringInvitationResponse {
    private String invitationId;
    private String invitationCode;
    private String studentCode;
    private String studentName;
    private String className;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private InvitationStatus status;
    private long daysUntilExpiry;
}
