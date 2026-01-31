package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitation_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationLog {

    @Id
    @GeneratedValue
    @org.hibernate.annotations.UuidGenerator
    @Column(name = "invitation_log_id", updatable = false, nullable = false)
    private String invitationLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private StudentInvitation invitation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus action;
    // CREATED, SENT, USED, EXPIRED, EMAIL_FAILED

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String performedBy; // teacherId / username / SYSTEM

    @CreationTimestamp
    private LocalDateTime createdAt;
}
