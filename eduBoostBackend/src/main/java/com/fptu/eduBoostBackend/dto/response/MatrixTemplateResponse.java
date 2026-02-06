package com.fptu.eduBoostBackend.dto.response;

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
public class MatrixTemplateResponse {
    private Long id;
    private String templateName;
    
    private Long examTypeId;
    private String examTypeName;
    
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    
    private Integer gradeLevel;
    private Integer totalQuestions;
    private BigDecimal totalPoints;
    private String description;
    private Boolean isDefault;
    
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    
    private List<MatrixTemplateDetailResponse> details;
}
