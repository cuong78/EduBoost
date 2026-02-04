package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.ChapterRequest;
import com.fptu.eduBoostBackend.dto.response.ChapterResponse;
import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Subject;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ChapterRepository;
import com.fptu.eduBoostBackend.repositories.SubjectRepository;
import com.fptu.eduBoostBackend.service.ChapterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersBySubject(Long subjectId, Integer gradeLevel) {
        log.info("Fetching chapters for subject: {}, gradeLevel: {}", subjectId, gradeLevel);
        
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        List<Chapter> chapters;
        if (gradeLevel != null) {
            chapters = chapterRepository.findBySubjectAndGradeLevel(subject, gradeLevel);
        } else {
            chapters = chapterRepository.findBySubject(subject);
        }

        return chapters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getChapterById(Long id) {
        log.info("Fetching chapter with id: {}", id);
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));
        return mapToResponse(chapter);
    }

    @Override
    @Transactional
    public ChapterResponse createChapter(Long subjectId, ChapterRequest request) {
        log.info("Creating new chapter for subject: {}", subjectId);

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        Chapter chapter = Chapter.builder()
                .subject(subject)
                .gradeLevel(request.getGradeLevel())
                .chapterNumber(request.getChapterNumber())
                .chapterName(request.getChapterName())
                .description(request.getDescription())
                .build();

        Chapter savedChapter = chapterRepository.save(chapter);
        log.info("Chapter created successfully with id: {}", savedChapter.getId());
        return mapToResponse(savedChapter);
    }

    @Override
    @Transactional
    public ChapterResponse updateChapter(Long id, ChapterRequest request) {
        log.info("Updating chapter with id: {}", id);

        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));

        chapter.setGradeLevel(request.getGradeLevel());
        chapter.setChapterNumber(request.getChapterNumber());
        chapter.setChapterName(request.getChapterName());
        chapter.setDescription(request.getDescription());

        Chapter updatedChapter = chapterRepository.save(chapter);
        log.info("Chapter updated successfully with id: {}", updatedChapter.getId());
        return mapToResponse(updatedChapter);
    }

    @Override
    @Transactional
    public void deleteChapter(Long id) {
        log.info("Deleting chapter with id: {}", id);

        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + id));

        // TODO: Add validation if chapter is used by lessons/exams
        // For now, we'll allow deletion

        chapterRepository.delete(chapter);
        log.info("Chapter deleted successfully with id: {}", id);
    }

    private ChapterResponse mapToResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .subjectId(chapter.getSubject().getId())
                .subjectCode(chapter.getSubject().getSubjectCode())
                .subjectDescription(chapter.getSubject().getDescription())
                .gradeLevel(chapter.getGradeLevel())
                .chapterNumber(chapter.getChapterNumber())
                .chapterName(chapter.getChapterName())
                .description(chapter.getDescription())
                .createdAt(chapter.getCreatedAt())
                .build();
    }
}
