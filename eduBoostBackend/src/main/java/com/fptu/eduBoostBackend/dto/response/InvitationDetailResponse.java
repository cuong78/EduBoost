package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import com.fptu.eduBoostBackend.entities.enums.InvitationType;
import com.fptu.eduBoostBackend.entities.enums.Relationship;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationDetailResponse {
    private String invitationId;
    private String invitationCode;
    private InvitationType invitationType;
    private InvitationStatus status;
    private String recipientEmail;
    private String recipientPhone;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    private StudentInfoDTO student;
    private CreatedByDTO createdBy;
    private UsedByDTO usedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfoDTO {
        private String studentId;
        private String studentCode;
        private String fullName;
        private String email;
        private String className;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedByDTO {
        private String userId;
        private String username;
        private String email;
        private String fullName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsedByDTO {
        private String parentId;
        private String username;
        private String email;
        private String fullName;
        private Relationship relationship;
    }
}
