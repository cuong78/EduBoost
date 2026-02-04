package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LessonRequest {

    @NotNull(message = "Chapter ID cannot be null")
    private Long chapterId;

    @NotNull(message = "Lesson number cannot be null")
    @Min(value = 1, message = "Lesson number must be at least 1")
    private Integer lessonNumber;

    @NotBlank(message = "Lesson name cannot be blank")
    @Size(max = 200, message = "Lesson name must not exceed 200 characters")
    private String lessonName;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
}