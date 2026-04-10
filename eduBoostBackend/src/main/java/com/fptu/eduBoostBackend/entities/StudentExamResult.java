package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_exam_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    /** Link to the assignment session that produced this result */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private ExamAssignment assignment;

    @Column(name = "score", precision = 5, scale = 2, nullable = false)
    private BigDecimal score;

    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "source_type", length = 30)
    private String sourceType;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /** JSON: [{questionId, selectedAnswer, correctAnswer, isCorrect, points}] */
    @Column(name = "answers", columnDefinition = "TEXT")
    private String answers;

    /** Total time student spent in seconds */
    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    /** Number of times student switched tab / lost focus */
    @Column(name = "tab_switch_count")
    @Builder.Default
    private Integer tabSwitchCount = 0;

    /** MANUAL | AUTO_TIMER | AUTO_FOCUS_LOST */
    @Column(name = "submission_source", length = 30)
    private String submissionSource;

    /** AI analysis text for this student's result */
    @Column(name = "ai_analysis_student", columnDefinition = "TEXT")
    private String aiAnalysisStudent;

    /** AI analysis text for teacher */
    @Column(name = "ai_analysis_teacher", columnDefinition = "TEXT")
    private String aiAnalysisTeacher;

    /** AI analysis text for parent */
    @Column(name = "ai_analysis_parent", columnDefinition = "TEXT")
    private String aiAnalysisParent;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
