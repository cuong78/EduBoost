package com.fptu.eduBoostBackend.service.impl;

import java.util.*;
import java.util.stream.Collectors;

import com.fptu.eduBoostBackend.service.ActivityLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.QuestionBank;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.DifficultyLevel;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.CognitiveLevelRepository;
import com.fptu.eduBoostBackend.repositories.LessonRepository;
import com.fptu.eduBoostBackend.repositories.QuestionBankRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.QuestionBankService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionBankServiceImpl implements QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final LessonRepository lessonRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional(readOnly = true)
    public List<QuestionBankResponse> getQuestions(Long lessonId, Long cognitiveLevelId, QuestionSourceType sourceType) {
        log.info("Fetching questions with filters - lessonId: {}, cognitiveLevelId: {}, sourceType: {}",
                lessonId, cognitiveLevelId, sourceType);

        List<QuestionBank> questions = questionBankRepository.findWithFilters(lessonId, cognitiveLevelId, sourceType);
        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuestionBankResponse> getQuestionsPaged(Long lessonId, Long cognitiveLevelId, 
            QuestionSourceType sourceType, Long chapterId, Long createdById, Pageable pageable) {
        log.info("Fetching questions paged - lessonId: {}, cognitiveLevelId: {}, sourceType: {}, chapterId: {}, createdById: {}, page: {}, size: {}",
                lessonId, cognitiveLevelId, sourceType, chapterId, createdById, pageable.getPageNumber(), pageable.getPageSize());

        Page<QuestionBank> questions = questionBankRepository.findWithFiltersPaged(
                lessonId, cognitiveLevelId, sourceType, chapterId, createdById, pageable);
        return questions.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankResponse getQuestionById(Long id) {
        log.info("Fetching question with id: {}", id);
        QuestionBank question = questionBankRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return mapToResponse(question);
    }

    @Override
    @Transactional
    public QuestionBankResponse createQuestion(QuestionBankRequest request) {
        log.info("Creating question for lesson: {}", request.getLessonId());

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Validate lesson
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

        // Validate cognitive level
        CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId()));

        // Create question
        QuestionBank question = QuestionBank.builder()
                .lesson(lesson)
                .questionText(request.getQuestionText())
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .questionType(request.getQuestionType())
                .cognitiveLevel(cognitiveLevel)
                .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : DifficultyLevel.MEDIUM)
                .sourceType(request.getSourceType() != null ? request.getSourceType() : QuestionSourceType.MANUAL)
                .createdBy(currentUser)
                .imageUrl(request.getImageUrl())
                .answerImageUrl(request.getAnswerImageUrl())
                .usageCount(0)
                .build();

        question = questionBankRepository.save(question);
        activityLogService.log("Đã tạo câu hỏi thủ công");
        return mapToResponse(question);
    }

    @Override
    @Transactional
    public QuestionBankResponse updateQuestion(Long id, QuestionBankRequest request) {
        log.info("Updating question with id: {}", id);

        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Check if user can edit (created by user or admin)
        if (!question.getCreatedBy().getUserId().equals(currentUser.getUserId()) && 
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only edit questions you created");
        }

        // Update fields
        if (request.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));
            question.setLesson(lesson);
        }

        if (request.getQuestionText() != null) {
            question.setQuestionText(request.getQuestionText());
        }
        if (request.getCorrectAnswer() != null) {
            question.setCorrectAnswer(request.getCorrectAnswer());
        }
        if (request.getExplanation() != null) {
            question.setExplanation(request.getExplanation());
        }
        if (request.getQuestionType() != null) {
            question.setQuestionType(request.getQuestionType());
        }
        if (request.getCognitiveLevelId() != null) {
            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId()));
            question.setCognitiveLevel(cognitiveLevel);
        }
        if (request.getDifficultyLevel() != null) {
            question.setDifficultyLevel(request.getDifficultyLevel());
        }
        if (request.getSourceType() != null) {
            question.setSourceType(request.getSourceType());
        }
        if (request.getImageUrl() != null) {
            question.setImageUrl(request.getImageUrl());
        }
        if (request.getAnswerImageUrl() != null) {
            question.setAnswerImageUrl(request.getAnswerImageUrl());
        }

        question = questionBankRepository.save(question);
        activityLogService.log("Đã chỉnh sửa câu hỏi");
        return mapToResponse(question);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        log.info("Deleting question with id: {}", id);

        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        // Check if user can delete (created by user or admin)
        if (!question.getCreatedBy().getUserId().equals(currentUser.getUserId()) && 
            !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new BadRequestException("You can only delete questions you created");
        }
        activityLogService.log("Đã xoá câu hỏi");
        questionBankRepository.delete(question);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankStatsResponse getStats(Long subjectId, Integer gradeLevel) {
        log.info("Getting question bank statistics - subjectId: {}, gradeLevel: {}", subjectId, gradeLevel);

        // This is a simplified version - can be enhanced with more detailed queries
        long totalQuestions = subjectId != null 
                ? questionBankRepository.countBySubjectId(subjectId)
                : questionBankRepository.count();
        
        long aiGeneratedCount = questionBankRepository.countAiGenerated();
        long manualCount = questionBankRepository.countManual();
        long importedCount = questionBankRepository.countImported();

        // Simplified stats - can be enhanced
        Map<String, Long> byLesson = new HashMap<>();
        Map<String, Long> byCognitiveLevel = new HashMap<>();
        Map<String, Long> byDifficultyLevel = new HashMap<>();

        return QuestionBankStatsResponse.builder()
                .totalQuestions(totalQuestions)
                .byLesson(byLesson)
                .byCognitiveLevel(byCognitiveLevel)
                .byDifficultyLevel(byDifficultyLevel)
                .aiGeneratedCount(aiGeneratedCount)
                .manualCount(manualCount)
                .importedCount(importedCount)
                .build();
    }

    @Override
    @Transactional
    public List<QuestionBankResponse> createQuestionsBatch(List<QuestionBankRequest> requests) {
        log.info("Creating {} questions in batch", requests.size());
        Set<Long> lessonIds = requests.stream()
                .map(QuestionBankRequest::getLessonId)
                .collect(Collectors.toSet());

        Set<Long> cognitiveIds = requests.stream()
                .map(QuestionBankRequest::getCognitiveLevelId)
                .collect(Collectors.toSet());

        Map<Long, Lesson> lessonMap = lessonRepository.findAllById(lessonIds)
                .stream()
                .collect(Collectors.toMap(Lesson::getId, l -> l));

        Map<Long, CognitiveLevel> cognitiveMap = cognitiveLevelRepository.findAllById(cognitiveIds)
                .stream()
                .collect(Collectors.toMap(CognitiveLevel::getId, c -> c));
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        List<QuestionBank> questions = requests.stream().map(request -> {
            Lesson lesson = lessonMap.get(request.getLessonId());
            if (lesson == null) {
                throw new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId());
            }

            CognitiveLevel cognitiveLevel = cognitiveMap.get(request.getCognitiveLevelId());
            if (cognitiveLevel == null) {
                throw new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId());
            }
            return QuestionBank.builder()
                    .lesson(lesson)
                    .questionText(request.getQuestionText())
                    .correctAnswer(request.getCorrectAnswer())
                    .explanation(request.getExplanation())
                    .questionType(request.getQuestionType())
                    .cognitiveLevel(cognitiveLevel)
                    .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : DifficultyLevel.MEDIUM)
                    .sourceType(request.getSourceType() != null ? request.getSourceType() : QuestionSourceType.IMPORTED)
                    .createdBy(currentUser)
                    .imageUrl(request.getImageUrl())
                    .answerImageUrl(request.getAnswerImageUrl())
                    .usageCount(0)
                    .build();
        }).collect(Collectors.toList());
        questions = saveQuestionsInChunks(questions);
        activityLogService.log("Đã import câu hỏi");

        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private QuestionBankResponse mapToResponse(QuestionBank question) {
        return QuestionBankResponse.builder()
                .id(question.getId())
                .lessonId(question.getLesson().getId())
                .lessonName("Bài " + question.getLesson().getLessonNumber() + ": " + question.getLesson().getLessonName())
                .questionText(question.getQuestionText())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .questionType(question.getQuestionType())
                .cognitiveLevelId(question.getCognitiveLevel().getId())
                .cognitiveLevel(question.getCognitiveLevel().getLevel())
                .difficultyLevel(question.getDifficultyLevel())
                .sourceType(question.getSourceType())
                .sourceReference(question.getSourceReference())
                .createdById(question.getCreatedBy().getUserId())
                .createdByName(question.getCreatedBy().getFullName())
                .usageCount(question.getUsageCount())
                .imageUrl(question.getImageUrl())
                .answerImageUrl(question.getAnswerImageUrl())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
    private List<QuestionBank> saveQuestionsInChunks(List<QuestionBank> questions) {
        List<QuestionBank> saved = new ArrayList<>();
        int batchSize = 100;

        for (int i = 0; i < questions.size(); i += batchSize) {
            int end = Math.min(i + batchSize, questions.size());
            List<QuestionBank> chunk = questionBankRepository.saveAll(questions.subList(i, end));
            questionBankRepository.flush();
            saved.addAll(chunk);
        }

        return saved;
    }
}
