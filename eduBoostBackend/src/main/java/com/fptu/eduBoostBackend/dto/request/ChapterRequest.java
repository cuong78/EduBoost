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
public class ChapterRequest {
    
    @NotNull(message = "Grade level cannot be null")
    @Min(value = 1, message = "Grade level must be at least 1")
    private Integer gradeLevel;

    @NotNull(message = "Chapter number cannot be null")
    @Min(value = 1, message = "Chapter number must be at least 1")
    private Integer chapterNumber;

    @NotBlank(message = "Chapter name cannot be blank")
    @Size(max = 200, message = "Chapter name must not exceed 200 characters")
    private String chapterName;

    private String description;
}
