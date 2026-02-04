package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.LessonRequest;
import com.fptu.eduBoostBackend.dto.response.LessonResponse;
import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ChapterRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.service.LessonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByChapter(Long chapterId) {
        log.info("Fetching lessons for chapter: {}", chapterId);

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + chapterId));

        List<Lesson> lessons = lessonRepository.findByChapterOrderByLessonNumberAsc(chapter);
        return lessons.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResponse getLessonById(Long id) {
        log.info("Fetching lesson with id: {}", id);
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));
        return mapToResponse(lesson);
    }

    @Override
    @Transactional
    public LessonResponse createLesson(LessonRequest request) {
        log.info("Creating new lesson for chapter: {}", request.getChapterId());

        Chapter chapter = chapterRepository.findById(request.getChapterId())
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + request.getChapterId()));

        // Check if lesson number already exists in this chapter
        boolean lessonNumberExists = lessonRepository.findByChapter(chapter).stream()
                .anyMatch(lesson -> lesson.getLessonNumber().equals(request.getLessonNumber()));

        if (lessonNumberExists) {
            throw new BadRequestException("Lesson number " + request.getLessonNumber() +
                    " already exists in this chapter");
        }

        Lesson lesson = Lesson.builder()
                .chapter(chapter)
                .lessonNumber(request.getLessonNumber())
                .lessonName(request.getLessonName())
                .description(request.getDescription())
                .build();

        Lesson savedLesson = lessonRepository.save(lesson);
        log.info("Lesson created successfully with id: {}", savedLesson.getId());
        return mapToResponse(savedLesson);
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long id, LessonRequest request) {
        log.info("Updating lesson with id: {}", id);

        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        // Check if chapter is being changed
        if (!lesson.getChapter().getId().equals(request.getChapterId())) {
            Chapter newChapter = chapterRepository.findById(request.getChapterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + request.getChapterId()));
            lesson.setChapter(newChapter);
        }

        // Check if lesson number is being changed and if it conflicts
        if (!lesson.getLessonNumber().equals(request.getLessonNumber())) {
            boolean lessonNumberExists = lessonRepository.findByChapter(lesson.getChapter()).stream()
                    .anyMatch(l -> l.getLessonNumber().equals(request.getLessonNumber()) && !l.getId().equals(id));

            if (lessonNumberExists) {
                throw new BadRequestException("Lesson number " + request.getLessonNumber() +
                        " already exists in this chapter");
            }
        }

        lesson.setLessonNumber(request.getLessonNumber());
        lesson.setLessonName(request.getLessonName());
        lesson.setDescription(request.getDescription());

        Lesson updatedLesson = lessonRepository.save(lesson);
        log.info("Lesson updated successfully with id: {}", updatedLesson.getId());
        return mapToResponse(updatedLesson);
    }
    @Override
    @Transactional
    public void deleteLesson(Long id) {
        log.info("Deleting lesson with id: {}", id);

        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        // TODO: Add validation if lesson has resources or questions
        // For now, we'll allow deletion

        lessonRepository.delete(lesson);
        log.info("Lesson deleted successfully with id: {}", id);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .chapterName(lesson.getChapter().getChapterName())
                .lessonNumber(lesson.getLessonNumber())
                .lessonName(lesson.getLessonName())
                .description(lesson.getDescription())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}