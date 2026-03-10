package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrixTemplateLessonDetailRequest {

    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    @NotNull(message = "Cognitive level ID is required")
    private Long cognitiveLevelId;

    @NotNull(message = "Number of questions is required")
    @Min(value = 0, message = "Number of questions must be non-negative")
    private Integer numberOfQuestions;
}
