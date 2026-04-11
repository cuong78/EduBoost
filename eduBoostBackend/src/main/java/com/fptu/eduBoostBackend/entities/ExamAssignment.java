package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    /** The exam (original or variant) assigned */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    /** The class receiving this assignment */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    /** Teacher who created this assignment */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    /** 6-character alphanumeric code students must enter to start */
    @Column(name = "access_code", nullable = false, length = 10)
    private String accessCode;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /** SCHEDULED | ACTIVE | ENDED | CANCELLED */
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "SCHEDULED";

    /** Max number of attempts per student (default 1) */
    @Column(name = "allowed_attempts")
    @Builder.Default
    private Integer allowedAttempts = 1;

    /** Notify parent after student submits */
    @Column(name = "notify_parent")
    @Builder.Default
    private Boolean notifyParent = true;

    /** Duration override in minutes (null = use exam's default) */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    /** Comma-separated list of exam IDs for random per-student distribution.
     *  When set, each student gets a random variant from this list. */
    @Column(name = "selected_exam_ids", length = 500)
    private String selectedExamIds;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
