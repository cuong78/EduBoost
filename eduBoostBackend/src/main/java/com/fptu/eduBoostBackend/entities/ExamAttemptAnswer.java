package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempt_answer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_question_id", nullable = false)
    private ExamQuestion examQuestion;

    /**
     * For multiple choice questions we store the chosen option key/value.
     */
    @Column(name = "selected_option", columnDefinition = "TEXT")
    private String selectedOption;

    /**
     * For open-ended questions, store the student's text answer.
     */
    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;

    @Column(name = "is_flagged")
    private Boolean flagged;

    @Column(name = "auto_saved")
    private Boolean autoSaved;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    /**
     * Teacher manual override for grading (used for FILL_BLANK / essay-like questions).
     * If null, the system uses the auto-grading logic.
     */
    @Column(name = "teacher_points_override", precision = 5, scale = 2)
    private BigDecimal teacherPointsOverride;

    @Column(name = "teacher_comment", columnDefinition = "TEXT")
    private String teacherComment;

    @Column(name = "teacher_graded_at")
    private LocalDateTime teacherGradedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

