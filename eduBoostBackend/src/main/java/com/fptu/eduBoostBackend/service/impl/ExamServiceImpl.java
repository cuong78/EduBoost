package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.*;
import com.fptu.eduBoostBackend.dto.response.*;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.ExamQuestionSourceFlag;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.AIQuestionGeneratorService;
import com.fptu.eduBoostBackend.service.ExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamTypeRepository examTypeRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final QuestionBankRepository questionBankRepository;
    private final CognitiveLevelRepository cognitiveLevelRepository;
    private final ExamMatrixTemplateRepository matrixTemplateRepository;
    private final UserRepository userRepository;
    private final LessonResourceRepository resourceRepository;
    private final AIQuestionGeneratorService aiQuestionGeneratorService;
    private final ObjectMapper objectMapper;
    
    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;
    
    private static final String DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

    @Override
    public Page<ExamResponse> getExams(Long subjectId, Integer gradeLevel, Long examTypeId,
                                        ExamStatus status, Long createdById, Pageable pageable) {
        Page<Exam> exams = examRepository.findByFilters(subjectId, gradeLevel, examTypeId, status, createdById, pageable);
        return exams.map(this::mapToExamResponse);
    }

    @Override
    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        
        ExamResponse response = mapToExamResponseWithDetails(exam);
        
        // Get questions
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(id);
        response.setQuestions(questions.stream().map(this::mapToExamQuestionResponse).collect(Collectors.toList()));
        
        // Count statistics
        response.setQuestionsFromBank(examQuestionRepository.countByExamIdAndSourceFlag(id, ExamQuestionSourceFlag.EXISTING_BANK));
        response.setQuestionsAiGenerated(examQuestionRepository.countByExamIdAndSourceFlag(id, ExamQuestionSourceFlag.AI_GENERATED));
        response.setQuestionsEdited(examQuestionRepository.countByExamIdAndSourceFlag(id, ExamQuestionSourceFlag.TEACHER_EDITED));
        
        return response;
    }

    @Override
    public ExamResponse createExam(ExamRequest request) {
        User currentUser = getCurrentUser();
        
        ExamType examType = examTypeRepository.findById(request.getExamTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam type not found"));
        
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        
        Chapter chapter = null;
        if (request.getChapterId() != null) {
            chapter = chapterRepository.findById(request.getChapterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
        }
        
        ExamMatrixTemplate matrixTemplate = null;
        if (request.getMatrixTemplateId() != null) {
            matrixTemplate = matrixTemplateRepository.findById(request.getMatrixTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matrix template not found"));
        }
        
        // Calculate total questions and points
        int totalQuestions = 0;
        BigDecimal totalPoints = BigDecimal.ZERO;
        
        if (request.getConfig() != null) {
            // 15-minute exam
            totalQuestions = request.getConfig().getTotalQuestions();
            totalPoints = request.getConfig().getPointsPerQuestion()
                    .multiply(BigDecimal.valueOf(totalQuestions));
        } else if (request.getRequirements() != null && !request.getRequirements().isEmpty()) {
            // Matrix-based exam
            for (ExamRequirementRequest req : request.getRequirements()) {
                totalQuestions += req.getNumberOfQuestions();
                totalPoints = totalPoints.add(req.getPointsPerQuestion()
                        .multiply(BigDecimal.valueOf(req.getNumberOfQuestions())));
            }
        }
        
        Exam exam = Exam.builder()
                .examCode(generateExamCode(subject.getSubjectCode(), request.getGradeLevel()))
                .examTitle(request.getExamTitle())
                .examType(examType)
                .subject(subject)
                .gradeLevel(request.getGradeLevel())
                .chapter(chapter)
                .semester(request.getSemester())
                .schoolYear(request.getSchoolYear())
                .matrixTemplate(matrixTemplate)
                .totalQuestions(totalQuestions)
                .totalPoints(totalPoints)
                .createdBy(currentUser)
                .status(ExamStatus.DRAFT)
                .build();
        
        exam = examRepository.save(exam);
        
        log.info("Created exam: {} by user: {}", exam.getExamCode(), currentUser.getUsername());
        
        return mapToExamResponse(exam);
    }

    @Override
    public ExamResponse updateExam(Long id, ExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only update exams in DRAFT status");
        }
        
        exam.setExamTitle(request.getExamTitle());
        exam.setSemester(request.getSemester());
        exam.setSchoolYear(request.getSchoolYear());
        
        if (request.getChapterId() != null) {
            Chapter chapter = chapterRepository.findById(request.getChapterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
            exam.setChapter(chapter);
        }
        
        exam = examRepository.save(exam);
        
        return mapToExamResponse(exam);
    }

    @Override
    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only delete exams in DRAFT status");
        }
        
        examQuestionRepository.deleteByExamId(id);
        examRepository.delete(exam);
        
        log.info("Deleted exam: {}", exam.getExamCode());
    }

    @Override
    public AutoSelectQuestionsResponse autoSelectQuestions(Long examId) {
        Exam exam = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only auto-select questions for exams in DRAFT status");
        }
        
        int fromBank = 0;
        int aiGenerated = 0;
        List<ExamQuestion> addedQuestions = new ArrayList<>();
        int orderNumber = Optional.ofNullable(examQuestionRepository.findMaxOrderNumber(examId)).orElse(0);
        
        // Get questions from bank based on exam type
        // For simplicity, get questions from related lessons
        List<QuestionBank> availableQuestions = questionBankRepository.findByLessonChapterIdOrdered(
                exam.getChapter() != null ? exam.getChapter().getId() : null);
        
        int needed = exam.getTotalQuestions() - examQuestionRepository.countByExamId(examId);
        BigDecimal pointsPerQuestion = exam.getTotalPoints().divide(BigDecimal.valueOf(exam.getTotalQuestions()), 1, RoundingMode.HALF_UP);
        
        for (QuestionBank q : availableQuestions) {
            if (needed <= 0) break;
            
            // Check if already added
            if (examQuestionRepository.existsByExamIdAndQuestionId(examId, q.getId())) {
                continue;
            }
            
            orderNumber++;
            ExamQuestion eq = createExamQuestionFromBank(exam, q, orderNumber, pointsPerQuestion);
            addedQuestions.add(examQuestionRepository.save(eq));
            fromBank++;
            needed--;
        }
        
        // If still need more questions, AI generate them
        if (needed > 0 && exam.getChapter() != null) {
            List<Lesson> lessons = lessonRepository.findByChapterId(exam.getChapter().getId());
            if (!lessons.isEmpty()) {
                for (Lesson lesson : lessons) {
                    if (needed <= 0) break;
                    
                    List<LessonResource> resources = resourceRepository.findByLessonId(lesson.getId());
                    if (!resources.isEmpty()) {
                        try {
                            // Generate questions using AI
                            int toGenerate = Math.min(needed, 5);
                            // This would call AI service - simplified for now
                            log.info("Would generate {} AI questions for lesson {}", toGenerate, lesson.getLessonName());
                            // aiGenerated += toGenerate;
                            // needed -= toGenerate;
                        } catch (Exception e) {
                            log.error("Failed to generate AI questions: {}", e.getMessage());
                        }
                    }
                }
            }
        }
        
        // Update exam question count
        exam.setTotalQuestions(examQuestionRepository.countByExamId(examId));
        examRepository.save(exam);
        
        List<ExamQuestion> allQuestions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);
        
        return AutoSelectQuestionsResponse.builder()
                .totalQuestionsAdded(fromBank + aiGenerated)
                .fromExistingBank(fromBank)
                .aiGenerated(aiGenerated)
                .questions(allQuestions.stream().map(this::mapToExamQuestionResponse).collect(Collectors.toList()))
                .build();
    }

    @Override
    public AutoSelectQuestionsResponse autoSelectQuestionsWithConfig(Long examId, AutoSelectQuestionsRequest request) {
        Exam exam = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only auto-select questions for exams in DRAFT status");
        }
        
        int fromBank = 0;
        int aiGenerated = 0;
        List<ExamQuestion> addedQuestions = new ArrayList<>();
        int orderNumber = Optional.ofNullable(examQuestionRepository.findMaxOrderNumber(examId)).orElse(0);
        BigDecimal pointsPerQuestion = exam.getTotalPoints().divide(BigDecimal.valueOf(exam.getTotalQuestions()), 1, RoundingMode.HALF_UP);
        
        // Resolve cognitive level distribution by code to ID
        Map<Long, Integer> cognitiveLevelDist = resolveCognitiveLevelDistribution(request);
        
        // Process by lesson distribution if provided
        if (request.getLessonDistribution() != null && !request.getLessonDistribution().isEmpty()) {
            for (LessonDistributionRequest lessonDist : request.getLessonDistribution()) {
                Long lessonId = lessonDist.getLessonId();
                int needed = lessonDist.getNumberOfQuestions();
                
                // If cognitive level distribution is provided, use it
                if (cognitiveLevelDist != null && !cognitiveLevelDist.isEmpty()) {
                    for (Map.Entry<Long, Integer> levelEntry : cognitiveLevelDist.entrySet()) {
                        Long cognitiveLevelId = levelEntry.getKey();
                        int neededForLevel = levelEntry.getValue();
                        
                        // Get questions from bank for this lesson and cognitive level
                        List<QuestionBank> questions = questionBankRepository.findByLessonIdAndCognitiveLevelId(lessonId, cognitiveLevelId);
                        
                        int addedForLevel = 0;
                        for (QuestionBank q : questions) {
                            if (addedForLevel >= neededForLevel) break;
                            if (examQuestionRepository.existsByExamIdAndQuestionId(examId, q.getId())) continue;
                            
                            orderNumber++;
                            ExamQuestion eq = createExamQuestionFromBank(exam, q, orderNumber, pointsPerQuestion);
                            addedQuestions.add(examQuestionRepository.save(eq));
                            fromBank++;
                            addedForLevel++;
                        }
                        
                        // If still need more and AI generation is enabled
                        int stillNeeded = neededForLevel - addedForLevel;
                        if (stillNeeded > 0 && Boolean.TRUE.equals(request.getUseAiGeneration())) {
                            List<ExamQuestion> aiQuestions = generateAIQuestionsForExam(exam, lessonId, cognitiveLevelId, stillNeeded, orderNumber, pointsPerQuestion);
                            orderNumber += aiQuestions.size();
                            addedQuestions.addAll(aiQuestions);
                            aiGenerated += aiQuestions.size();
                        }
                    }
                } else {
                    // No cognitive level distribution - just get questions for the lesson
                    List<QuestionBank> questions = questionBankRepository.findByLessonId(lessonId);
                    
                    int addedForLesson = 0;
                    for (QuestionBank q : questions) {
                        if (addedForLesson >= needed) break;
                        if (examQuestionRepository.existsByExamIdAndQuestionId(examId, q.getId())) continue;
                        
                        orderNumber++;
                        ExamQuestion eq = createExamQuestionFromBank(exam, q, orderNumber, pointsPerQuestion);
                        addedQuestions.add(examQuestionRepository.save(eq));
                        fromBank++;
                        addedForLesson++;
                    }
                    
                    // If still need more and AI generation is enabled
                    int stillNeeded = needed - addedForLesson;
                    if (stillNeeded > 0 && Boolean.TRUE.equals(request.getUseAiGeneration())) {
                        // Use default cognitive level (first one)
                        CognitiveLevel defaultLevel = cognitiveLevelRepository.findAll().stream().findFirst().orElse(null);
                        if (defaultLevel != null) {
                            List<ExamQuestion> aiQuestions = generateAIQuestionsForExam(exam, lessonId, defaultLevel.getId(), stillNeeded, orderNumber, pointsPerQuestion);
                            orderNumber += aiQuestions.size();
                            addedQuestions.addAll(aiQuestions);
                            aiGenerated += aiQuestions.size();
                        }
                    }
                }
            }
        }
        
        // Update exam question count
        exam.setTotalQuestions(examQuestionRepository.countByExamId(examId));
        examRepository.save(exam);
        
        List<ExamQuestion> allQuestions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);
        
        return AutoSelectQuestionsResponse.builder()
                .totalQuestionsAdded(fromBank + aiGenerated)
                .fromExistingBank(fromBank)
                .aiGenerated(aiGenerated)
                .questions(allQuestions.stream().map(this::mapToExamQuestionResponse).collect(Collectors.toList()))
                .build();
    }
    
    /**
     * Resolve cognitive level distribution - handles both ID-based and code-based distributions
     * Code mapping: nb -> Nhận biết, th -> Thông hiểu, vd -> Vận dụng, vdc -> Vận dụng cao
     */
    private Map<Long, Integer> resolveCognitiveLevelDistribution(AutoSelectQuestionsRequest request) {
        Map<Long, Integer> result = new HashMap<>();
        
        // If ID-based distribution is provided, use it directly
        if (request.getCognitiveLevelDistribution() != null && !request.getCognitiveLevelDistribution().isEmpty()) {
            return request.getCognitiveLevelDistribution();
        }
        
        // If code-based distribution is provided, resolve codes to IDs
        if (request.getCognitiveLevelDistributionByCode() != null && !request.getCognitiveLevelDistributionByCode().isEmpty()) {
            List<CognitiveLevel> allLevels = cognitiveLevelRepository.findAll();
            
            // Map codes to cognitive levels
            // nb -> Nhận biết, th -> Thông hiểu, vd -> Vận dụng, vdc -> Vận dụng cao
            Map<String, String> codeToNamePrefix = Map.of(
                "nb", "Nhận biết",
                "th", "Thông hiểu", 
                "vd", "Vận dụng",
                "vdc", "Vận dụng cao"
            );
            
            for (Map.Entry<String, Integer> entry : request.getCognitiveLevelDistributionByCode().entrySet()) {
                String code = entry.getKey().toLowerCase();
                Integer count = entry.getValue();
                
                if (count == null || count <= 0) continue;
                
                String namePrefix = codeToNamePrefix.get(code);
                if (namePrefix == null) continue;
                
                // Find matching cognitive level
                for (CognitiveLevel level : allLevels) {
                    if (level.getLevel().toLowerCase().contains(namePrefix.toLowerCase())) {
                        result.put(level.getId(), count);
                        break;
                    }
                }
            }
        }
        
        return result;
    }
    
    private List<ExamQuestion> generateAIQuestionsForExam(Exam exam, Long lessonId, Long cognitiveLevelId, int count, int startOrder, BigDecimal points) {
        List<ExamQuestion> generated = new ArrayList<>();
        
        try {
            Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
            CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(cognitiveLevelId).orElse(null);
            if (lesson == null || cognitiveLevel == null) return generated;
            
            // Get resources for the lesson
            List<LessonResource> resources = resourceRepository.findByLessonId(lessonId);
            if (resources.isEmpty()) {
                log.warn("No resources available for lesson {} to generate AI questions", lessonId);
                return generated;
            }
            
            // Use first resource with content
            LessonResource resource = resources.stream()
                    .filter(r -> r.getExtractedContent() != null && !r.getExtractedContent().isEmpty())
                    .findFirst()
                    .orElse(null);
            
            if (resource == null) {
                log.warn("No resource with extracted content for lesson {}", lessonId);
                return generated;
            }
            
            // Call AI service to generate questions
            AIGenerateFromResourceRequest aiRequest = new AIGenerateFromResourceRequest();
            aiRequest.setResourceId(resource.getId());
            aiRequest.setLessonId(lessonId);
            aiRequest.setNumberOfQuestions(count);
            aiRequest.setAiProvider("DEEPSEEK");
            
            AIGenerateFromResourceResponse aiResponse = aiQuestionGeneratorService.generateFromResource(aiRequest);
            
            int orderNumber = startOrder;
            
            for (AIGeneratedQuestionResponse q : aiResponse.getGeneratedQuestions()) {
                orderNumber++;
                
                ExamQuestion eq = ExamQuestion.builder()
                        .exam(exam)
                        .questionText(q.getQuestionText())
                        .correctAnswer(q.getCorrectAnswer())
                        .wrongAnswer1(q.getWrongAnswers() != null && q.getWrongAnswers().size() > 0 ? q.getWrongAnswers().get(0) : null)
                        .wrongAnswer2(q.getWrongAnswers() != null && q.getWrongAnswers().size() > 1 ? q.getWrongAnswers().get(1) : null)
                        .wrongAnswer3(q.getWrongAnswers() != null && q.getWrongAnswers().size() > 2 ? q.getWrongAnswers().get(2) : null)
                        .explanation(q.getExplanation())
                        .orderNumber(orderNumber)
                        .points(points)
                        .sourceFlag(ExamQuestionSourceFlag.AI_GENERATED)
                        .build();
                
                generated.add(examQuestionRepository.save(eq));
            }
            
            log.info("Generated {} AI questions for exam {} lesson {} cognitive level {}", 
                    generated.size(), exam.getId(), lesson.getLessonName(), cognitiveLevel.getLevel());
            
        } catch (Exception e) {
            log.error("Failed to generate AI questions: {}", e.getMessage(), e);
        }
        
        return generated;
    }

    @Override
    public ExamQuestionResponse addQuestionToExam(Long examId, AddQuestionToExamRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only add questions to exams in DRAFT status");
        }
        
        QuestionBank question = questionBankRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        if (examQuestionRepository.existsByExamIdAndQuestionId(examId, request.getQuestionId())) {
            throw new IllegalStateException("Question already exists in this exam");
        }
        
        int orderNumber = request.getOrderNumber() != null ? request.getOrderNumber() :
                Optional.ofNullable(examQuestionRepository.findMaxOrderNumber(examId)).orElse(0) + 1;
        
        ExamQuestion eq = createExamQuestionFromBank(exam, question, orderNumber, request.getPoints());
        eq = examQuestionRepository.save(eq);
        
        // Update total questions count
        exam.setTotalQuestions(examQuestionRepository.countByExamId(examId));
        examRepository.save(exam);
        
        return mapToExamQuestionResponse(eq);
    }

    @Override
    public List<ExamQuestionResponse> aiGenerateQuestionsForExam(Long examId, ExamAIGenerateRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only generate questions for exams in DRAFT status");
        }
        
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        
        CognitiveLevel cognitiveLevel = cognitiveLevelRepository.findById(request.getCognitiveLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Cognitive level not found"));
        
        // Get resources for the lesson
        List<LessonResource> resources = resourceRepository.findByLessonId(lesson.getId());
        if (resources.isEmpty()) {
            throw new IllegalStateException("No resources available for this lesson to generate questions");
        }
        
        List<ExamQuestion> generatedQuestions = new ArrayList<>();
        int orderNumber = Optional.ofNullable(examQuestionRepository.findMaxOrderNumber(examId)).orElse(0);
        BigDecimal points = request.getPointsPerQuestion() != null ? request.getPointsPerQuestion() : BigDecimal.ONE;
        
        // For each resource, try to generate questions
        // This is a simplified implementation - real implementation would use AI service
        log.info("Generating {} AI questions for exam {} from lesson {}", 
                request.getNumberOfQuestions(), examId, lesson.getLessonName());
        
        // Update question count
        exam.setTotalQuestions(examQuestionRepository.countByExamId(examId));
        examRepository.save(exam);
        
        return generatedQuestions.stream()
                .map(this::mapToExamQuestionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExamQuestionResponse editExamQuestion(Long examId, Long examQuestionId, EditExamQuestionRequest request) {
        ExamQuestion eq = examQuestionRepository.findById(examQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam question not found"));
        
        if (!eq.getExam().getId().equals(examId)) {
            throw new IllegalArgumentException("Question does not belong to this exam");
        }
        
        if (eq.getExam().getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only edit questions in DRAFT exams");
        }
        
        User currentUser = getCurrentUser();
        
        eq.setQuestionText(request.getModifiedQuestionText());
        eq.setCorrectAnswer(request.getModifiedCorrectAnswer());
        eq.setExplanation(request.getModifiedExplanation());
        
        if (request.getWrongAnswer1() != null) eq.setWrongAnswer1(request.getWrongAnswer1());
        if (request.getWrongAnswer2() != null) eq.setWrongAnswer2(request.getWrongAnswer2());
        if (request.getWrongAnswer3() != null) eq.setWrongAnswer3(request.getWrongAnswer3());
        
        eq.setIsModified(true);
        eq.setModifiedAt(LocalDateTime.now());
        eq.setModifiedBy(currentUser);
        eq.setSourceFlag(ExamQuestionSourceFlag.TEACHER_EDITED);
        
        eq = examQuestionRepository.save(eq);
        
        return mapToExamQuestionResponse(eq);
    }

    @Override
    public ExamQuestionResponse regenerateWrongAnswers(Long examId, Long examQuestionId) {
        ExamQuestion eq = examQuestionRepository.findById(examQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam question not found"));
        
        if (!eq.getExam().getId().equals(examId)) {
            throw new IllegalArgumentException("Question does not belong to this exam");
        }
        
        // This would call AI service to regenerate wrong answers
        // For now, just return the current question
        log.info("Would regenerate wrong answers for question: {}", examQuestionId);
        
        return mapToExamQuestionResponse(eq);
    }

    @Override
    public void deleteExamQuestion(Long examId, Long examQuestionId) {
        ExamQuestion eq = examQuestionRepository.findById(examQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam question not found"));
        
        if (!eq.getExam().getId().equals(examId)) {
            throw new IllegalArgumentException("Question does not belong to this exam");
        }
        
        Exam exam = eq.getExam();
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only delete questions from DRAFT exams");
        }
        
        examQuestionRepository.delete(eq);
        
        // Update total questions count
        exam.setTotalQuestions(examQuestionRepository.countByExamId(examId));
        examRepository.save(exam);
        
        // Reorder remaining questions
        List<ExamQuestion> remaining = examQuestionRepository.findByExamIdOrdered(examId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setOrderNumber(i + 1);
        }
        examQuestionRepository.saveAll(remaining);
    }

    @Override
    public void reorderQuestions(Long examId, ReorderQuestionsRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        if (exam.getStatus() != ExamStatus.DRAFT) {
            throw new IllegalStateException("Can only reorder questions in DRAFT exams");
        }
        
        for (QuestionOrderRequest order : request.getQuestionOrders()) {
            examQuestionRepository.updateOrderNumber(order.getExamQuestionId(), order.getNewOrderNumber());
        }
    }

    @Override
    public ApproveExamResponse approveExam(Long examId) {
        Exam exam = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        if (exam.getStatus() != ExamStatus.DRAFT && exam.getStatus() != ExamStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Can only approve exams in DRAFT or PENDING_REVIEW status");
        }
        
        User currentUser = getCurrentUser();
        
        // Get all questions
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);
        
        int aiGenerated = 0;
        int teacherEdited = 0;
        int newQuestionsSaved = 0;
        
        // Save new/edited questions to question bank
        for (ExamQuestion eq : questions) {
            if (eq.getSourceFlag() == ExamQuestionSourceFlag.AI_GENERATED) {
                // Save to question bank if not already there
                if (eq.getQuestion() == null) {
                    // Get lesson from exam's chapter (use first lesson as fallback)
                    Lesson lesson = null;
                    if (exam.getChapter() != null) {
                        List<Lesson> chapterLessons = lessonRepository.findByChapterId(exam.getChapter().getId());
                        if (!chapterLessons.isEmpty()) {
                            lesson = chapterLessons.get(0);
                        }
                    }
                    
                    // Get default cognitive level (first one available)
                    CognitiveLevel defaultCognitiveLevel = cognitiveLevelRepository.findAll().stream()
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("No cognitive levels found in system"));
                    
                    if (lesson == null) {
                        throw new IllegalStateException("Cannot save AI-generated question: exam has no chapter or lessons");
                    }
                    
                    QuestionBank newQuestion = QuestionBank.builder()
                            .lesson(lesson)
                            .questionText(eq.getQuestionText())
                            .correctAnswer(eq.getCorrectAnswer())
                            .explanation(eq.getExplanation())
                            .cognitiveLevel(defaultCognitiveLevel)
                            .sourceType(QuestionSourceType.AI_GENERATED)
                            .createdBy(currentUser)
                            .build();
                    questionBankRepository.save(newQuestion);
                    newQuestionsSaved++;
                }
                aiGenerated++;
            } else if (eq.getSourceFlag() == ExamQuestionSourceFlag.TEACHER_EDITED) {
                // Create new version in question bank
                teacherEdited++;
                newQuestionsSaved++;
            } else if (eq.getQuestion() != null) {
                // Increment usage count
                QuestionBank q = eq.getQuestion();
                q.setUsageCount(q.getUsageCount() + 1);
                questionBankRepository.save(q);
            }
        }
        
        // Update exam status
        exam.setStatus(ExamStatus.APPROVED);
        exam.setApprovedBy(currentUser);
        exam.setApprovedAt(LocalDateTime.now());
        examRepository.save(exam);
        
        log.info("Approved exam: {} by user: {}", exam.getExamCode(), currentUser.getUsername());
        
        return ApproveExamResponse.builder()
                .examId(examId)
                .status(ExamStatus.APPROVED)
                .newQuestionsSaved(newQuestionsSaved)
                .breakdown(ApproveExamResponse.ApproveBreakdown.builder()
                        .aiGenerated(aiGenerated)
                        .teacherEdited(teacherEdited)
                        .build())
                .build();
    }

    @Override
    public ExamResponse changeExamStatus(Long examId, ChangeExamStatusRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        User currentUser = getCurrentUser();
        
        // Validate status transition
        validateStatusTransition(exam.getStatus(), request.getNewStatus());
        
        exam.setStatus(request.getNewStatus());
        
        if (request.getNewStatus() == ExamStatus.PUBLISHED) {
            exam.setPublishedAt(LocalDateTime.now());
        }
        
        exam = examRepository.save(exam);
        
        log.info("Changed exam {} status from {} to {} by user: {}", 
                exam.getExamCode(), exam.getStatus(), request.getNewStatus(), currentUser.getUsername());
        
        return mapToExamResponse(exam);
    }

    @Override
    public byte[] exportExam(Long examId, String format) {
        Exam exam = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);
        
        // Generate exam document
        // This would use a library like Apache POI or iText
        log.info("Exporting exam {} in format: {}", exam.getExamCode(), format);
        
        // Placeholder - return empty byte array
        return new byte[0];
    }

    @Override
    public byte[] exportAnswerKey(Long examId, String format) {
        Exam exam = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);
        
        // Generate answer key document
        log.info("Exporting answer key for exam {} in format: {}", exam.getExamCode(), format);
        
        // Placeholder - return empty byte array
        return new byte[0];
    }

    @Override
    public ExamResponse cloneExam(Long examId) {
        Exam original = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        User currentUser = getCurrentUser();
        
        // Create new exam
        Exam clone = Exam.builder()
                .examCode(generateExamCode(original.getSubject().getSubjectCode(), original.getGradeLevel()))
                .examTitle(original.getExamTitle() + " (Copy)")
                .examType(original.getExamType())
                .subject(original.getSubject())
                .gradeLevel(original.getGradeLevel())
                .chapter(original.getChapter())
                .semester(original.getSemester())
                .schoolYear(original.getSchoolYear())
                .matrixTemplate(original.getMatrixTemplate())
                .totalQuestions(original.getTotalQuestions())
                .totalPoints(original.getTotalPoints())
                .createdBy(currentUser)
                .status(ExamStatus.DRAFT)
                .build();
        
        clone = examRepository.save(clone);
        
        // Clone questions
        List<ExamQuestion> originalQuestions = examQuestionRepository.findByExamIdOrdered(examId);
        for (ExamQuestion oq : originalQuestions) {
            ExamQuestion clonedQ = ExamQuestion.builder()
                    .exam(clone)
                    .question(oq.getQuestion())
                    .orderNumber(oq.getOrderNumber())
                    .points(oq.getPoints())
                    .sourceFlag(oq.getSourceFlag())
                    .questionText(oq.getQuestionText())
                    .correctAnswer(oq.getCorrectAnswer())
                    .explanation(oq.getExplanation())
                    .wrongAnswer1(oq.getWrongAnswer1())
                    .wrongAnswer2(oq.getWrongAnswer2())
                    .wrongAnswer3(oq.getWrongAnswer3())
                    .isModified(false)
                    .build();
            examQuestionRepository.save(clonedQ);
        }
        
        log.info("Cloned exam {} to {} by user: {}", original.getExamCode(), clone.getExamCode(), currentUser.getUsername());
        
        return mapToExamResponse(clone);
    }

    @Override
    public ExamStatisticsResponse getExamStatistics(Long examId) {
        Exam exam = examRepository.findByIdWithDetails(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);
        
        Map<String, Integer> byCognitiveLevel = new HashMap<>();
        Map<String, Integer> byLesson = new HashMap<>();
        Map<String, BigDecimal> pointsByCognitiveLevel = new HashMap<>();
        
        int fromBank = 0;
        int aiGenerated = 0;
        int teacherEdited = 0;
        
        for (ExamQuestion eq : questions) {
            // Count by source
            if (eq.getSourceFlag() == ExamQuestionSourceFlag.EXISTING_BANK) fromBank++;
            else if (eq.getSourceFlag() == ExamQuestionSourceFlag.AI_GENERATED) aiGenerated++;
            else if (eq.getSourceFlag() == ExamQuestionSourceFlag.TEACHER_EDITED) teacherEdited++;
            
            // Count by cognitive level
            if (eq.getQuestion() != null && eq.getQuestion().getCognitiveLevel() != null) {
                String level = eq.getQuestion().getCognitiveLevel().getLevel();
                byCognitiveLevel.merge(level, 1, Integer::sum);
                pointsByCognitiveLevel.merge(level, eq.getPoints(), BigDecimal::add);
            }
            
            // Count by lesson
            if (eq.getQuestion() != null && eq.getQuestion().getLesson() != null) {
                String lessonName = eq.getQuestion().getLesson().getLessonName();
                byLesson.merge(lessonName, 1, Integer::sum);
            }
        }
        
        return ExamStatisticsResponse.builder()
                .examId(examId)
                .examTitle(exam.getExamTitle())
                .totalQuestions(questions.size())
                .totalPoints(exam.getTotalPoints())
                .fromBank(fromBank)
                .aiGenerated(aiGenerated)
                .teacherEdited(teacherEdited)
                .byCognitiveLevel(byCognitiveLevel)
                .byLesson(byLesson)
                .pointsByCognitiveLevel(pointsByCognitiveLevel)
                .build();
    }

    @Override
    public List<ExamResponse> getMyExams() {
        User currentUser = getCurrentUser();
        List<Exam> exams = examRepository.findByCreatedById(currentUser.getUserId());
        return exams.stream().map(this::mapToExamResponse).collect(Collectors.toList());
    }

    // Helper methods
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
    
    private String generateExamCode(String subjectCode, Integer gradeLevel) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return String.format("%s%d-%s", subjectCode, gradeLevel, timestamp);
    }
    
    private ExamQuestion createExamQuestionFromBank(Exam exam, QuestionBank question, int orderNumber, BigDecimal points) {
        ExamQuestion eq = ExamQuestion.builder()
                .exam(exam)
                .question(question)
                .orderNumber(orderNumber)
                .points(points)
                .sourceFlag(ExamQuestionSourceFlag.EXISTING_BANK)
                .questionText(question.getQuestionText())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .isModified(false)
                .build();
        
        // Generate wrong answers using AI
        generateWrongAnswersForQuestion(eq);
        
        return eq;
    }
    
    /**
     * Generate wrong answers for a question using AI
     */
    private void generateWrongAnswersForQuestion(ExamQuestion eq) {
        if (deepseekApiKey == null || deepseekApiKey.isEmpty()) {
            log.warn("DeepSeek API key not configured, skipping wrong answer generation");
            return;
        }
        
        try {
            String prompt = buildWrongAnswerPrompt(eq.getQuestionText(), eq.getCorrectAnswer());
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(deepseekApiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "deepseek-chat");
            requestBody.put("max_tokens", 1000);
            requestBody.put("temperature", 0.7);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "Bạn là giáo viên tạo đáp án sai cho câu hỏi trắc nghiệm. Luôn trả về JSON hợp lệ."));
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);
            
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(DEEPSEEK_API_URL, HttpMethod.POST, entity, String.class);
            
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                String content = choices.get(0).get("message").get("content").asText();
                List<String> wrongAnswers = parseWrongAnswers(content);
                
                if (wrongAnswers.size() >= 1) eq.setWrongAnswer1(wrongAnswers.get(0));
                if (wrongAnswers.size() >= 2) eq.setWrongAnswer2(wrongAnswers.get(1));
                if (wrongAnswers.size() >= 3) eq.setWrongAnswer3(wrongAnswers.get(2));
                
                log.info("Generated {} wrong answers for question", wrongAnswers.size());
            }
        } catch (Exception e) {
            log.error("Failed to generate wrong answers: {}", e.getMessage());
        }
    }
    
    private String buildWrongAnswerPrompt(String questionText, String correctAnswer) {
        return String.format("""
            Dựa trên câu hỏi và đáp án đúng sau, hãy tạo 3 đáp án sai hợp lý:
            
            Câu hỏi: %s
            Đáp án đúng: %s
            
            Yêu cầu:
            - Tạo 3 đáp án sai có vẻ hợp lý nhưng không đúng
            - Đáp án sai phải liên quan đến câu hỏi
            - Không được trùng với đáp án đúng
            
            Trả về JSON array (CHỈ JSON, KHÔNG TEXT KHÁC):
            ["Đáp án sai 1", "Đáp án sai 2", "Đáp án sai 3"]
            """, questionText, correctAnswer);
    }
    
    private List<String> parseWrongAnswers(String content) {
        try {
            // Extract JSON from response
            String json = content;
            int start = content.indexOf('[');
            int end = content.lastIndexOf(']');
            if (start >= 0 && end > start) {
                json = content.substring(start, end + 1);
            }
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("Failed to parse wrong answers: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private void validateStatusTransition(ExamStatus current, ExamStatus newStatus) {
        // Define valid transitions
        Map<ExamStatus, Set<ExamStatus>> validTransitions = Map.of(
                ExamStatus.DRAFT, Set.of(ExamStatus.PENDING_REVIEW, ExamStatus.APPROVED),
                ExamStatus.PENDING_REVIEW, Set.of(ExamStatus.DRAFT, ExamStatus.APPROVED),
                ExamStatus.APPROVED, Set.of(ExamStatus.PUBLISHED, ExamStatus.ARCHIVED),
                ExamStatus.PUBLISHED, Set.of(ExamStatus.ARCHIVED),
                ExamStatus.ARCHIVED, Set.of()
        );
        
        if (!validTransitions.getOrDefault(current, Set.of()).contains(newStatus)) {
            throw new IllegalStateException(
                    String.format("Invalid status transition from %s to %s", current, newStatus));
        }
    }
    
    private ExamResponse mapToExamResponse(Exam exam) {
        return ExamResponse.builder()
                .id(exam.getId())
                .examCode(exam.getExamCode())
                .examTitle(exam.getExamTitle())
                .examTypeId(exam.getExamType().getId())
                .examTypeCode(exam.getExamType().getTypeCode())
                .examTypeName(exam.getExamType().getTypeName())
                .requiresMatrix(exam.getExamType().getRequiresMatrix())
                .subjectId(exam.getSubject().getId())
                .subjectCode(exam.getSubject().getSubjectCode())
                .subjectName(exam.getSubject().getDescription())
                .gradeLevel(exam.getGradeLevel())
                .chapterId(exam.getChapter() != null ? exam.getChapter().getId() : null)
                .chapterName(exam.getChapter() != null ? exam.getChapter().getChapterName() : null)
                .chapterNumber(exam.getChapter() != null ? exam.getChapter().getChapterNumber() : null)
                .semester(exam.getSemester())
                .schoolYear(exam.getSchoolYear())
                .matrixTemplateId(exam.getMatrixTemplate() != null ? exam.getMatrixTemplate().getId() : null)
                .matrixTemplateName(exam.getMatrixTemplate() != null ? exam.getMatrixTemplate().getTemplateName() : null)
                .totalQuestions(exam.getTotalQuestions())
                .totalPoints(exam.getTotalPoints())
                .status(exam.getStatus())
                .createdById(exam.getCreatedBy().getUserId())
                .createdByName(exam.getCreatedBy().getFullName())
                .createdAt(exam.getCreatedAt())
                .approvedById(exam.getApprovedBy() != null ? exam.getApprovedBy().getUserId() : null)
                .approvedByName(exam.getApprovedBy() != null ? exam.getApprovedBy().getFullName() : null)
                .approvedAt(exam.getApprovedAt())
                .publishedAt(exam.getPublishedAt())
                .updatedAt(exam.getUpdatedAt())
                .build();
    }
    
    private ExamResponse mapToExamResponseWithDetails(Exam exam) {
        ExamResponse response = mapToExamResponse(exam);
        // Additional details can be added here
        return response;
    }
    
    private ExamQuestionResponse mapToExamQuestionResponse(ExamQuestion eq) {
        ExamQuestionResponse.ExamQuestionResponseBuilder builder = ExamQuestionResponse.builder()
                .id(eq.getId())
                .examId(eq.getExam().getId())
                .orderNumber(eq.getOrderNumber())
                .points(eq.getPoints())
                .sourceFlag(eq.getSourceFlag())
                .questionText(eq.getQuestionText())
                .correctAnswer(eq.getCorrectAnswer())
                .explanation(eq.getExplanation())
                .wrongAnswer1(eq.getWrongAnswer1())
                .wrongAnswer2(eq.getWrongAnswer2())
                .wrongAnswer3(eq.getWrongAnswer3())
                .isModified(eq.getIsModified())
                .modifiedAt(eq.getModifiedAt())
                .createdAt(eq.getCreatedAt());
        
        if (eq.getQuestion() != null) {
            builder.questionId(eq.getQuestion().getId());
            if (eq.getQuestion().getLesson() != null) {
                builder.lessonId(eq.getQuestion().getLesson().getId());
                builder.lessonName(eq.getQuestion().getLesson().getLessonName());
            }
            if (eq.getQuestion().getCognitiveLevel() != null) {
                builder.cognitiveLevelId(eq.getQuestion().getCognitiveLevel().getId());
                builder.cognitiveLevelName(eq.getQuestion().getCognitiveLevel().getLevel());
            }
        }
        
        if (eq.getModifiedBy() != null) {
            builder.modifiedByName(eq.getModifiedBy().getFullName());
        }
        
        return builder.build();
    }
}
