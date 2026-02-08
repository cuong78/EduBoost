package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClassResponse {
    private String classId;
    private String className;
    private String classCode;
    private String gradeLevelName;
    private Long gradeLevelId;
    private String teacherId;
    private String teacherName;
    private String schoolYear;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer studentCount;
}
