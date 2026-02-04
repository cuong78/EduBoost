package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "exam_matrix_template_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMatrixTemplateDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ExamMatrixTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cognitive_level_id", nullable = false)
    private CognitiveLevel cognitiveLevel;

    @Column(name = "number_of_questions", nullable = false)
    private Integer numberOfQuestions;

    @Column(name = "points_per_question", nullable = false, precision = 3, scale = 1)
    private BigDecimal pointsPerQuestion;

    @Column(name = "total_points", nullable = false, precision = 4, scale = 1)
    private BigDecimal totalPoints;
}

