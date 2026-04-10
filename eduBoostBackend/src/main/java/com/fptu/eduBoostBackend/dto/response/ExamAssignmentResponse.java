package com.fptu.eduBoostBackend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAssignmentResponse {
    private Long assignmentId;
    private Long examId;
    private String examTitle;
    private String examCode;
    private String classId;
    private String className;
    private String accessCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Integer allowedAttempts;
    private Integer durationMinutes;
    private Boolean notifyParent;
    private int submittedCount;
    private int totalStudents;
    private LocalDateTime createdAt;
    // Exam grade info for student dashboard
    private Integer gradeLevel;
    private String subjectName;
    private String examTypeCode;
}
