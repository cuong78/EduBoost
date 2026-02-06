package com.fptu.eduBoostBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamStatisticsResponse {
    private Long examId;
    private String examTitle;
    
    private int totalQuestions;
    private BigDecimal totalPoints;
    
    // Questions by source
    private int fromBank;
    private int aiGenerated;
    private int teacherEdited;
    
    // Questions by cognitive level
    private Map<String, Integer> byCognitiveLevel;
    
    // Questions by lesson
    private Map<String, Integer> byLesson;
    
    // Points distribution
    private Map<String, BigDecimal> pointsByCognitiveLevel;
}
