package com.fptu.eduBoostBackend.entities;
import com.fptu.eduBoostBackend.entities.enums.EmailStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class EmailLog {

    @Id
    @GeneratedValue
    @org.hibernate.annotations.UuidGenerator
    @Column(name = "email_log_id", updatable = false, nullable = false)
    private String emailLogId;

    private String toEmail;
    private String subject;

    @Column(nullable = false)
    private EmailStatus status;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String errorMessage;

    @CreationTimestamp
    private LocalDateTime createdAt;
    private String invitationId;
}
