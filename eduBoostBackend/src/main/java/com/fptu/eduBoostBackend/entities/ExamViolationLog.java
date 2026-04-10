package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_violation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamViolationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    private String studentId;
    private String studentName;

    @Column(nullable = false)
    private String violationType; // TAB_SWITCH, FULLSCREEN_EXIT, WINDOW_BLUR, COPY_PASTE, LONG_IDLE

    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
