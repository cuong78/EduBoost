package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.ChapterRequest;
import com.fptu.eduBoostBackend.dto.response.ChapterResponse;
import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Subject;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ConflictException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ChapterRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
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
    private final LessonRepository lessonRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersBySubject(Long subjectId, Integer gradeLevel) {
        log.info("Fetching chapters for subject: {}, gradeLevel: {}", subjectId, gradeLevel);
        
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        List<Chapter> chapters;
        if (gradeLevel != null && (gradeLevel < 1 || gradeLevel > 12)) {
            throw new BadRequestException("Grade level must be between 1 and 12");
        }
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
                .orElseThrow(() ->
                        new ResourceNotFoundException("Subject not found with id: " + subjectId)
                );

        if (request.getGradeLevel() == null ||
                request.getGradeLevel() < 1 ||
                request.getGradeLevel() > 12) {
            throw new BadRequestException("Grade level must be between 1 and 12");
        }

        if (request.getChapterNumber() == null ||
                request.getChapterNumber() <= 0) {
            throw new BadRequestException("Chapter number must be greater than 0");
        }

        if (request.getChapterName() == null ||
                request.getChapterName().trim().isEmpty()) {
            throw new BadRequestException("Chapter name must not be empty");
        }
        boolean exists = chapterRepository
                .existsBySubjectAndGradeLevelAndChapterNumber(
                        subject,
                        request.getGradeLevel(),
                        request.getChapterNumber()
                );

        if (exists) {
            throw new ConflictException(
                    "Chapter number already exists for this subject and grade"
            );
        }

        // CREATE ENTITY
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
                .orElseThrow(() ->
                        new ResourceNotFoundException("Chapter not found with id: " + id)
                );

        // RULE 1: Grade level validation
        if (request.getGradeLevel() == null ||
                request.getGradeLevel() < 1 ||
                request.getGradeLevel() > 12) {
            throw new BadRequestException("Grade level must be between 1 and 12");
        }

        // RULE 2: Chapter number validation
        if (request.getChapterNumber() == null ||
                request.getChapterNumber() <= 0) {
            throw new BadRequestException("Chapter number must be greater than 0");
        }

        // RULE 3: Chapter name validation
        if (request.getChapterName() == null ||
                request.getChapterName().trim().isEmpty()) {
            throw new BadRequestException("Chapter name must not be empty");
        }

        // RULE 4: Prevent duplicate chapter number (exclude itself)
        boolean exists = chapterRepository
                .existsBySubjectAndGradeLevelAndChapterNumberAndIdNot(
                        chapter.getSubject(),
                        request.getGradeLevel(),
                        request.getChapterNumber(),
                        id
                );

        if (exists) {
            throw new ConflictException(
                    "Chapter number already exists for this subject and grade"
            );
        }

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

        long lessonCount = lessonRepository.countByChapterId(id);
        if (lessonCount > 0) {
            throw new ConflictException(
                    "Cannot delete chapter because it is used by lessons"
            );
        }

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
                .lessonCount((int) lessonRepository.countByChapterId(chapter.getId()))
                .createdAt(chapter.getCreatedAt())
                .build();
    }
}
