package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrixTemplateLessonDetailResponse {

    private Long id;

    private Long lessonId;
    private String lessonName;
    private String lessonContent;
    private Integer lessonOrder;

    private Long cognitiveLevelId;
    private String cognitiveLevelName;

    private Integer numberOfQuestions;
}
