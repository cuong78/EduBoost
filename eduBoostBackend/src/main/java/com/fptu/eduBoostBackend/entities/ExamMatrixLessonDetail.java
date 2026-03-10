package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_matrix_lesson_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMatrixLessonDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ExamMatrixTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cognitive_level_id", nullable = false)
    private CognitiveLevel cognitiveLevel;

    @Column(name = "number_of_questions", nullable = false)
    private Integer numberOfQuestions;
}
