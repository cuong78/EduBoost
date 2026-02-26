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
public class ChapterResponse {
    private Long id;
    private Long subjectId;
    private String subjectCode;
    private String subjectDescription;
    private Integer gradeLevel;
    private Integer chapterNumber;
    private String chapterName;
    private String description;
    private Integer lessonCount;
    private LocalDateTime createdAt;
}
