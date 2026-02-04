package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.enums.ExamQuestionSourceFlag;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_question")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private QuestionBank question;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @Column(name = "points", nullable = false, precision = 3, scale = 1)
    private BigDecimal points;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_flag", length = 20)
    private ExamQuestionSourceFlag sourceFlag;

    @Column(name = "question_text", columnDefinition = "LONGTEXT", nullable = false)
    private String questionText;

    @Column(name = "correct_answer", columnDefinition = "TEXT", nullable = false)
    private String correctAnswer;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "wrong_answer_1", columnDefinition = "TEXT")
    private String wrongAnswer1;

    @Column(name = "wrong_answer_2", columnDefinition = "TEXT")
    private String wrongAnswer2;

    @Column(name = "wrong_answer_3", columnDefinition = "TEXT")
    private String wrongAnswer3;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_modified")
    private Boolean isModified = Boolean.FALSE;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by")
    private User modifiedBy;
}

