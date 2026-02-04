package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.LessonResourceRequest;
import com.fptu.eduBoostBackend.dto.response.LessonResourceResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LessonResourceService {
    List<LessonResourceResponse> getResourcesByLesson(Long lessonId);
    LessonResourceResponse getResourceById(Long id);
    LessonResourceResponse uploadResource( MultipartFile file, LessonResourceRequest request);
    Resource downloadResource(Long id);
    void deleteResource(Long id);
    String extractContent(Long id);
}