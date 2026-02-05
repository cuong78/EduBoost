package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamRequest {
    
    @NotBlank(message = "Exam title is required")
    @Size(max = 200, message = "Exam title must not exceed 200 characters")
    private String examTitle;
    
    @NotNull(message = "Exam type ID is required")
    private Long examTypeId;
    
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    
    @NotNull(message = "Grade level is required")
    @Min(value = 1, message = "Grade level must be at least 1")
    @Max(value = 12, message = "Grade level must be at most 12")
    private Integer gradeLevel;
    
    private Long chapterId;
    
    private Integer semester;
    
    @Size(max = 20, message = "School year must not exceed 20 characters")
    private String schoolYear;
    
    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Duration must be at least 5 minutes")
    private Integer durationMinutes;
    
    private List<Long> lessonIds;
    
    // For matrix-based exams (1 tiết, học kỳ)
    private Long matrixTemplateId;
    
    // For 15-minute exams (simple config)
    @Valid
    private ExamConfigRequest config;
    
    // For matrix-based exams (detailed requirements)
    @Valid
    private List<ExamRequirementRequest> requirements;
}
