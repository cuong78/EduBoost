package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankResponse {
    private Long id;
    private Long lessonId;
    private String lessonName;
    private String questionText;
    private String correctAnswer;
    private String explanation;
    private QuestionType questionType;
    private Long cognitiveLevelId;
    private String cognitiveLevel;
    private DifficultyLevel difficultyLevel;
    private QuestionSourceType sourceType;
    private String sourceReference;
    private Long createdById;
    private String createdByName;
    private Integer usageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
