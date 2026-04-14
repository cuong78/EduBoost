package com.fptu.eduBoostBackend.service.impl;

import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptu.eduBoostBackend.dto.request.QuestionDuplicateCheckRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionDuplicateCheckResponse;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
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
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    private static final String DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
    private static final int DUPLICATE_CHECK_MAX_QUESTIONS = 50;

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
        QuestionBank question = questionBankRepository.findById(id)
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
                .wrongAnswer1(request.getWrongAnswer1())
                .wrongAnswer2(request.getWrongAnswer2())
                .wrongAnswer3(request.getWrongAnswer3())
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

        // Tính duplicate % so với các câu cùng lesson đã tồn tại
        List<QuestionBank> existing = questionBankRepository.findByLessonId(lesson.getId());
        final QuestionBank savedQ = question; // effectively final cho lambda
        existing.removeIf(q -> q.getId().equals(savedQ.getId()));
        if (!existing.isEmpty()) {
            double maxSim = existing.stream()
                    .mapToDouble(q -> jaccardSimilarity(tokenize(savedQ.getQuestionText()), tokenize(q.getQuestionText())))
                    .max().orElse(0.0);
            question.setDuplicatePercentage(Math.round(maxSim * 1000.0) / 10.0);
            question = questionBankRepository.save(question);
        }

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
        // Update wrong answers (allow explicit null to clear)
        question.setWrongAnswer1(request.getWrongAnswer1());
        question.setWrongAnswer2(request.getWrongAnswer2());
        question.setWrongAnswer3(request.getWrongAnswer3());
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
        log.info("Soft-deleting question with id: {}", id);

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

        question.setIsDeleted(true);
        question.setDeletedAt(java.time.LocalDateTime.now());
        questionBankRepository.save(question);
        activityLogService.log("Đã xóa (mềm) câu hỏi #" + id);
        log.info("Soft-deleted question {}", id);
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

        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        List<QuestionBank> questions = requests.stream().map(request -> {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + request.getLessonId()));

            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found with id: " + request.getCognitiveLevelId()));

            return QuestionBank.builder()
                    .lesson(lesson)
                    .questionText(request.getQuestionText())
                    .correctAnswer(request.getCorrectAnswer())
                    .wrongAnswer1(request.getWrongAnswer1())
                    .wrongAnswer2(request.getWrongAnswer2())
                    .wrongAnswer3(request.getWrongAnswer3())
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
        questions = questionBankRepository.saveAll(questions);

        // Tính duplicate % nội bộ batch
        if (questions.size() > 1) {
            List<Set<String>> tokenSets = questions.stream()
                    .map(q -> tokenize(q.getQuestionText()))
                    .toList();
            for (int i = 0; i < questions.size(); i++) {
                Set<String> tokI = tokenSets.get(i);
                double maxSim = 0.0;
                for (int j = 0; j < questions.size(); j++) {
                    if (i == j) continue;
                    double s = jaccardSimilarity(tokI, tokenSets.get(j));
                    if (s > maxSim) maxSim = s;
                }
                questions.get(i).setDuplicatePercentage(Math.round(maxSim * 1000.0) / 10.0);
            }
            questions = questionBankRepository.saveAll(questions);
        }

        activityLogService.log("Đã import "+questions.size()+" câu hỏi");

        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ======================== DUPLICATE HELPERS ========================

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) return Set.of();
        String clean = text
                .replaceAll("\\$[^$]*\\$", " ")
                .replaceAll("<[^>]+>", " ")
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .toLowerCase().trim();
        if (clean.isBlank()) return Set.of();
        return new HashSet<>(Arrays.asList(clean.split("\\s+")));
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / union.size();
    }

    private QuestionBankResponse mapToResponse(QuestionBank question) {
        return QuestionBankResponse.builder()
                .id(question.getId())
                .lessonId(question.getLesson().getId())
                .lessonName("Bài " + question.getLesson().getLessonNumber() + ": " + question.getLesson().getLessonName())
                .questionText(question.getQuestionText())
                .correctAnswer(question.getCorrectAnswer())
                .wrongAnswer1(question.getWrongAnswer1())
                .wrongAnswer2(question.getWrongAnswer2())
                .wrongAnswer3(question.getWrongAnswer3())
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
                .duplicatePercentage(question.getDuplicatePercentage())
                .imageUrl(question.getImageUrl())
                .answerImageUrl(question.getAnswerImageUrl())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionDuplicateCheckResponse checkDuplicate(QuestionDuplicateCheckRequest request) {
        log.info("Checking duplicate for question in lessonId={}, chapterId={}", request.getLessonId(), request.getChapterId());

        // 1. Fetch existing questions for comparison (up to 50)
        List<QuestionBank> existing = questionBankRepository.findForDuplicateCheck(
                request.getLessonId(),
                request.getChapterId(),
                PageRequest.of(0, DUPLICATE_CHECK_MAX_QUESTIONS));

        if (existing.isEmpty()) {
            return QuestionDuplicateCheckResponse.builder()
                    .duplicatePercentage(0.0)
                    .comparedCount(0)
                    .analysis("Chưa có câu hỏi nào trong phạm vi này để so sánh.")
                    .build();
        }

        if (deepseekApiKey == null || deepseekApiKey.isBlank()) {
            return QuestionDuplicateCheckResponse.builder()
                    .duplicatePercentage(0.0)
                    .comparedCount(existing.size())
                    .analysis("AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.")
                    .build();
        }

        // 2. Build numbered list of existing questions
        StringBuilder existingList = new StringBuilder();
        for (int i = 0; i < existing.size(); i++) {
            existingList.append(i).append(". [ID=").append(existing.get(i).getId()).append("] ")
                    .append(existing.get(i).getQuestionText()).append("\n");
        }

        String systemPrompt = "Bạn là chuyên gia giáo dục. Nhiệm vụ: so sánh một câu hỏi MỚI với danh sách câu hỏi ĐÃ CÓ " +
                "và xác định mức độ trùng lặp về nội dung/ý nghĩa.\n" +
                "Trả về JSON (CHỈ JSON, KHÔNG TEXT KHÁC):\n" +
                "{\"percentage\": <0-100>, \"mostSimilarIndex\": <index hoặc -1>, \"analysis\": \"<giải thích ngắn bằng tiếng Việt>\"}";

        String userPrompt = "CÂU HỎI MỚI:\n" + request.getQuestionText() +
                "\n\nDANH SÁCH CÂU HỎI ĐÃ CÓ:\n" + existingList;

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "deepseek-chat");
            requestBody.put("temperature", 0.1);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(deepseekApiKey);

            ResponseEntity<String> response = restTemplate.exchange(
                    DEEPSEEK_API_URL, HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers), String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Clean markdown fences if any
            content = content.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            int jsonStart = content.indexOf('{');
            int jsonEnd = content.lastIndexOf('}');
            if (jsonStart != -1 && jsonEnd != -1) content = content.substring(jsonStart, jsonEnd + 1);

            JsonNode result = objectMapper.readTree(content);
            double percentage = result.path("percentage").asDouble(0.0);
            int mostSimilarIndex = result.path("mostSimilarIndex").asInt(-1);
            String analysis = result.path("analysis").asText("");

            Long mostSimilarId = null;
            String mostSimilarText = null;
            if (mostSimilarIndex >= 0 && mostSimilarIndex < existing.size()) {
                QuestionBank similar = existing.get(mostSimilarIndex);
                mostSimilarId = similar.getId();
                mostSimilarText = similar.getQuestionText();
            }

            log.info("Duplicate check result: {}%, mostSimilar={}", percentage, mostSimilarId);
            return QuestionDuplicateCheckResponse.builder()
                    .duplicatePercentage(percentage)
                    .mostSimilarQuestionId(mostSimilarId)
                    .mostSimilarQuestionText(mostSimilarText)
                    .analysis(analysis)
                    .comparedCount(existing.size())
                    .build();

        } catch (Exception e) {
            log.error("Duplicate check AI call failed: {}", e.getMessage());
            return QuestionDuplicateCheckResponse.builder()
                    .duplicatePercentage(0.0)
                    .comparedCount(existing.size())
                    .analysis("Không thể kiểm tra trùng lặp: " + e.getMessage())
                    .build();
        }
    }
}
