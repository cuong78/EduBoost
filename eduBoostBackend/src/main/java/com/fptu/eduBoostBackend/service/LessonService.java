package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.LessonRequest;
import com.fptu.eduBoostBackend.dto.response.LessonResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LessonService {
    List<LessonResponse> getLessonsByChapter(Long chapterId);
    LessonResponse getLessonById(Long id);
    LessonResponse createLesson(LessonRequest request);
    LessonResponse updateLesson(Long id, LessonRequest request);
    void deleteLesson(Long id);
}