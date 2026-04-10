package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDuplicateCheckRequest {

    @NotBlank(message = "Question text cannot be blank")
    private String questionText;

    @NotNull(message = "Lesson ID cannot be null")
    private Long lessonId;

    private Long chapterId; // optional — if null, checks only within lesson
}
