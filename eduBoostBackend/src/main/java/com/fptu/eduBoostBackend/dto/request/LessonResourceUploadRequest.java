package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LessonResourceUploadRequest {
    private Long lessonId;
    private String resourceName;
    private LessonResourceType resourceType;
    private String fileUrl;
    private String textContent;
}