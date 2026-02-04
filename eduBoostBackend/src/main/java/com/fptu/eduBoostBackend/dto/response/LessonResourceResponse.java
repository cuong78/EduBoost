package com.fptu.eduBoostBackend.dto.response;

import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
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
public class LessonResourceResponse {
    private Long id;
    private Long lessonId;
    private String lessonName;
    private String resourceName;
    private LessonResourceType resourceType;
    private String fileUrl;
    private String downloadUrl;
    private Long fileSize;
    private String mimeType;
    private Boolean hasExtractedContent;
    private LocalDateTime uploadedAt;
    private String uploadedByName;
}