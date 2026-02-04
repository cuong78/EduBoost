package com.fptu.eduBoostBackend.dto.response;

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
public class LessonResponse {
    private Long id;
    private Long chapterId;
    private String chapterName;
    private Integer lessonNumber;
    private String lessonName;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}