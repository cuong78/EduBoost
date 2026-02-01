package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_invitations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentInvitation {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "invitation_id", length = 36)
    private String invitationId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "invitation_code", nullable = false, unique = true, length = 10)
    private String invitationCode;

    @Column(name = "recipient_email", length = 255)
    private String recipientEmail;


    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "max_uses")
    private Integer maxUses = 1;

    @Column(name = "current_uses")
    private Integer currentUses = 0;

    @ManyToOne
    @JoinColumn(name = "used_by")
    private Parent usedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private InvitationStatus status = InvitationStatus.ACTIVE;
}
