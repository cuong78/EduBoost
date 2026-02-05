package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.ExamQuestionSourceFlag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionResponse {
    private Long id;
    private Long examId;
    
    // Original question info (if from bank)
    private Long questionId;
    private Long lessonId;
    private String lessonName;
    private Long cognitiveLevelId;
    private String cognitiveLevelName;
    
    private Integer orderNumber;
    private BigDecimal points;
    private ExamQuestionSourceFlag sourceFlag;
    
    // Question content
    private String questionText;
    private String correctAnswer;
    private String explanation;
    private String wrongAnswer1;
    private String wrongAnswer2;
    private String wrongAnswer3;
    
    private Boolean isModified;
    private LocalDateTime modifiedAt;
    private String modifiedByName;
    
    private LocalDateTime createdAt;
}
