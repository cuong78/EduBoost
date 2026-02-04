package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.ChapterRequest;
import com.fptu.eduBoostBackend.dto.response.ChapterResponse;

import java.util.List;

public interface ChapterService {
    List<ChapterResponse> getChaptersBySubject(Long subjectId, Integer gradeLevel);
    ChapterResponse getChapterById(Long id);
    ChapterResponse createChapter(Long subjectId, ChapterRequest request);
    ChapterResponse updateChapter(Long id, ChapterRequest request);
    void deleteChapter(Long id);
}
