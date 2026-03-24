package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_attempt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Stable identifier used by frontend when resuming an attempt.
     */
    @Column(name = "attempt_code", nullable = false, unique = true, length = 100)
    private String attemptCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    /**
     * Optional schedule that this attempt belongs to (online scheduled exam).
     * Nullable for legacy / non-scheduled exam taking.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private ExamSchedule schedule;

    /**
     * Attempt number within a schedule (or within an exam if schedule is null).
     */
    @Column(name = "attempt_number")
    private Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private ExamAttemptStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "current_question_index")
    private Integer currentQuestionIndex;

    /**
     * Version field used for tracking client/server state drift during auto-save.
     */
    @Column(name = "lock_version")
    private Long lockVersion;

    /**
     * Token representing the active browser tab for this attempt.
     * When a new tab takes over, this value is rotated and older tokens become invalid.
     */
    @Column(name = "active_tab_token", length = 100)
    private String activeTabToken;

    /** Number of violations (tab switches, fullscreen exits) recorded for this attempt. */
    @Column(name = "violation_count")
    @Builder.Default
    private Integer violationCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public static ExamAttempt createNew(Student student, Exam exam, ExamSchedule schedule, Integer attemptNumber,
                                        LocalDateTime startedAt, LocalDateTime expiresAt) {
        return ExamAttempt.builder()
                .attemptCode(UUID.randomUUID().toString())
                .student(student)
                .exam(exam)
                .schedule(schedule)
                .attemptNumber(attemptNumber)
                .status(ExamAttemptStatus.IN_PROGRESS)
                .startedAt(startedAt)
                .expiresAt(expiresAt)
                .lastActivityAt(startedAt)
                .activeTabToken(UUID.randomUUID().toString())
                .build();
    }
}

