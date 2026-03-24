package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fptu.eduBoostBackend.entities.enums.ScoreRevealMode;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "allow_late_minutes")
    private Integer allowLateMinutes;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "password", length = 100)
    private String password;

    @Column(name = "status", length = 20)
    private String status;

    /**
     * JSON blob for lockdown/anti-cheat settings.
     * Example: {"maxTabSwitches":3,"requireFullscreen":true,"autoSubmitOnViolation":false}
     */
    @Column(name = "settings", columnDefinition = "TEXT")
    private String settings;

    @Enumerated(EnumType.STRING)
    @Column(name = "score_reveal_mode", length = 30)
    @Builder.Default
    private ScoreRevealMode scoreRevealMode = ScoreRevealMode.IMMEDIATE;

    @Column(name = "results_announced_at")
    private LocalDateTime resultsAnnouncedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "results_announced_by_teacher_id")
    private Teacher resultsAnnouncedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

