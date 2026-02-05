package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponse {
    private Long id;
    private String examCode;
    private String examTitle;
    
    private Long examTypeId;
    private String examTypeCode;
    private String examTypeName;
    private Boolean requiresMatrix;
    
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    
    private Integer gradeLevel;
    
    private Long chapterId;
    private String chapterName;
    private Integer chapterNumber;
    
    private Integer semester;
    private String schoolYear;
    
    private Long matrixTemplateId;
    private String matrixTemplateName;
    
    private Integer totalQuestions;
    private BigDecimal totalPoints;
    private Integer durationMinutes;
    
    private ExamStatus status;
    
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    
    private LocalDateTime publishedAt;
    private LocalDateTime updatedAt;
    
    // Questions list (when fetching details)
    private List<ExamQuestionResponse> questions;
    
    // Statistics
    private Integer questionsFromBank;
    private Integer questionsAiGenerated;
    private Integer questionsEdited;
}
