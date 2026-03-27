package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempt_violation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttemptViolation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @Column(name = "violation_type", nullable = false, length = 50)
    private String violationType;

    @CreationTimestamp
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt;
}

