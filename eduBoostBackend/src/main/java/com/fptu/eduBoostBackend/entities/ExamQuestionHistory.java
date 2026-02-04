package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_question_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_question_id", nullable = false)
    private ExamQuestion examQuestion;

    @Column(name = "old_question_text", columnDefinition = "TEXT")
    private String oldQuestionText;

    @Column(name = "old_correct_answer", columnDefinition = "TEXT")
    private String oldCorrectAnswer;

    @Column(name = "old_explanation", columnDefinition = "TEXT")
    private String oldExplanation;

    @Column(name = "new_question_text", columnDefinition = "TEXT")
    private String newQuestionText;

    @Column(name = "new_correct_answer", columnDefinition = "TEXT")
    private String newCorrectAnswer;

    @Column(name = "new_explanation", columnDefinition = "TEXT")
    private String newExplanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by", nullable = false)
    private User modifiedBy;

    @Column(name = "modified_at", nullable = false)
    private LocalDateTime modifiedAt;

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;
}

