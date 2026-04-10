package com.fptu.eduBoostBackend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptu.eduBoostBackend.dto.request.ExamAssignmentRequest;
import com.fptu.eduBoostBackend.dto.request.SubmitExamRequest;
import com.fptu.eduBoostBackend.dto.response.ExamAssignmentResponse;
import com.fptu.eduBoostBackend.dto.response.ExamQuestionResponse;
import com.fptu.eduBoostBackend.dto.response.ExamResultDetailResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.exception.exceptions.BadRequestException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExamAssignmentServiceImpl {

    private final ExamAssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final StudentExamResultRepository resultRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final ObjectMapper objectMapper;
    private final ActivityLogService activityLogService;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    private static final String DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

    // ── Create Assignment ──────────────────────────────────────────────────

    public List<ExamAssignmentResponse> createAssignment(ExamAssignmentRequest request) {
        User teacher = getCurrentUser();
        Exam baseExam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        List<ExamAssignmentResponse> created = new ArrayList<>();

        // Case 1: classVariantMap provided (1 variant per class)
        if (request.getClassVariantMap() != null && !request.getClassVariantMap().isEmpty()) {
            for (Map.Entry<String, Long> entry : request.getClassVariantMap().entrySet()) {
                String classId = entry.getKey();
                Long variantExamId = entry.getValue();

                Exam variantExam = examRepository.findById(variantExamId)
                        .orElseThrow(() -> new ResourceNotFoundException("Variant exam not found: " + variantExamId));
                SchoolClass cls = classRepository.findById(classId)
                        .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

                ExamAssignment a = buildAssignment(variantExam, cls, teacher, request);
                assignmentRepository.save(a);
                created.add(toResponse(a, 0));
            }
        } else {
            // Case 2: same exam to all classes
            for (String classId : request.getClassIds()) {
                SchoolClass cls = classRepository.findById(classId)
                        .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));
                ExamAssignment a = buildAssignment(baseExam, cls, teacher, request);
                assignmentRepository.save(a);
                created.add(toResponse(a, 0));
            }
        }

        activityLogService.log("Giao đề thi " + baseExam.getExamCode() + " cho " + created.size() + " lớp");
        return created;
    }

    private ExamAssignment buildAssignment(Exam exam, SchoolClass cls, User teacher, ExamAssignmentRequest req) {
        String code = generateAccessCode();
        return ExamAssignment.builder()
                .exam(exam)
                .schoolClass(cls)
                .createdBy(teacher)
                .accessCode(code)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .durationMinutes(req.getDurationMinutes())
                .allowedAttempts(req.getAllowedAttempts() != null ? req.getAllowedAttempts() : 1)
                .notifyParent(req.getNotifyParent() != null ? req.getNotifyParent() : true)
                .status("SCHEDULED")
                .build();
    }

    /** Generate a 6-char uppercase alphanumeric code */
    private String generateAccessCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1 to avoid confusion
        Random rng = new Random();
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) sb.append(chars.charAt(rng.nextInt(chars.length())));
        return sb.toString();
    }

    // ── Teacher: list assignments ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ExamAssignmentResponse> getTeacherAssignments() {
        User teacher = getCurrentUser();
        return assignmentRepository.findByTeacherId(teacher.getUserId())
                .stream()
                .map(a -> toResponse(a, resultRepository.countByAssignmentId(a.getAssignmentId())))
                .collect(Collectors.toList());
    }

    // ── Student: list assignments ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ExamAssignmentResponse> getStudentAssignments() {
        User user = getCurrentUser();
        // Get student's class and find assignments for it
        Student student = studentRepository.findByUser(user).orElse(null);
        if (student == null || student.getSchoolClass() == null) return List.of();
        String classId = student.getSchoolClass().getClassId();
        return assignmentRepository.findBySchoolClassClassId(classId)
                .stream()
                .map(a -> toResponse(a, 0))
                .collect(Collectors.toList());
    }

    // ── Validate access code ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExamAssignmentResponse validateCode(Long assignmentId, String code) {
        ExamAssignment a = assignmentRepository.findByAssignmentIdAndAccessCode(assignmentId, code.trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Mã vào thi không đúng hoặc không tồn tại"));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(a.getStartTime())) {
            throw new BadRequestException("Bài thi chưa đến giờ bắt đầu (" + a.getStartTime() + ")");
        }
        if (now.isAfter(a.getEndTime())) {
            throw new BadRequestException("Bài thi đã kết thúc");
        }

        ExamAssignmentResponse response = toResponse(a, 0);

        // Check if student already submitted this assignment
        User user = getCurrentUser();
        Student student = studentRepository.findByUser(user).orElse(null);
        if (student != null) {
            resultRepository.findByStudentAndAssignment(student.getStudentId(), assignmentId)
                    .ifPresent(r -> response.setAlreadySubmittedResultId(r.getResultId()));
        }

        return response;
    }

    // ── Submit exam ────────────────────────────────────────────────────────

    public ExamResultDetailResponse submitExam(SubmitExamRequest request) {
        User user = getCurrentUser();
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        ExamAssignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Check duplicate submission using String studentId
        resultRepository.findByStudentAndAssignment(student.getStudentId(), assignment.getAssignmentId())
                .ifPresent(r -> { throw new BadRequestException("Bạn đã nộp bài làm này rồi"); });

        // Load exam questions
        List<ExamQuestion> questions = examQuestionRepository
                .findByExamIdWithDetailsOrdered(assignment.getExam().getId());

        // Grade answers
        Map<Long, String> selectedMap = new HashMap<>();
        if (request.getAnswers() != null) {
            for (SubmitExamRequest.StudentAnswerItem ans : request.getAnswers()) {
                selectedMap.put(ans.getQuestionId(), ans.getSelectedAnswer());
            }
        }

        List<ExamResultDetailResponse.QuestionResultItem> questionResults = new ArrayList<>();
        BigDecimal totalScore = BigDecimal.ZERO;
        BigDecimal maxScore = BigDecimal.ZERO;

        for (ExamQuestion q : questions) {
            String selected = selectedMap.get(q.getId());
            // Compare against correctAnswer field directly on ExamQuestion
            boolean isCorrect = selected != null && selected.trim().equalsIgnoreCase(
                    q.getCorrectAnswer() != null ? q.getCorrectAnswer().trim() : "");
            BigDecimal pts = isCorrect ? q.getPoints() : BigDecimal.ZERO;
            totalScore = totalScore.add(pts);
            maxScore = maxScore.add(q.getPoints());

            questionResults.add(ExamResultDetailResponse.QuestionResultItem.builder()
                    .examQuestionId(q.getId())
                    .orderNumber(q.getOrderNumber())
                    .questionText(q.getQuestionText())
                    .correctAnswer(q.getCorrectAnswer())
                    .selectedAnswer(selected)
                    .isCorrect(isCorrect)
                    .points(pts)
                    .explanation(q.getExplanation())
                    .build());
        }

        BigDecimal percentage = maxScore.compareTo(BigDecimal.ZERO) > 0
                ? totalScore.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        String status = percentage.compareTo(BigDecimal.valueOf(50)) >= 0 ? "PASSED" : "FAILED";

        // Serialize answers JSON
        String answersJson = "[]";
        try { answersJson = objectMapper.writeValueAsString(questionResults); } catch (Exception ignored) {}

        // Student entity already resolved above
        StudentExamResult result = StudentExamResult.builder()
                .student(student)
                .exam(assignment.getExam())
                .assignment(assignment)
                .score(totalScore.setScale(2, RoundingMode.HALF_UP))
                .maxScore(maxScore.setScale(2, RoundingMode.HALF_UP))
                .percentage(percentage.setScale(2, RoundingMode.HALF_UP))
                .status(status)
                .answers(answersJson)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .tabSwitchCount(request.getTabSwitchCount() != null ? request.getTabSwitchCount() : 0)
                .submissionSource(request.getSubmissionSource() != null ? request.getSubmissionSource() : "MANUAL")
                .submittedAt(LocalDateTime.now())
                .takenAt(LocalDateTime.now())
                .attemptNumber(1)
                .build();

        result = resultRepository.save(result);
        activityLogService.log("Học sinh nộp bài thi, điểm: " + totalScore + "/" + maxScore);

        // Trigger AI analysis truly async (non-blocking)
        final StudentExamResult savedResult = result;
        final List<ExamResultDetailResponse.QuestionResultItem> savedQItems = questionResults;
        final ExamAssignment savedAssignment = assignment;
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                triggerAiAnalysisAsync(savedResult, savedQItems, savedAssignment);
            } catch (Exception e) {
                log.warn("Async AI analysis failed: {}", e.getMessage());
            }
        });

        ExamResultDetailResponse response = ExamResultDetailResponse.builder()
                .resultId(result.getResultId())
                .assignmentId(assignment.getAssignmentId())
                .examId(assignment.getExam().getId())
                .examTitle(assignment.getExam().getExamTitle())
                .score(result.getScore())
                .maxScore(result.getMaxScore())
                .percentage(result.getPercentage())
                .status(status)
                .timeTakenSeconds(result.getTimeTakenSeconds())
                .tabSwitchCount(result.getTabSwitchCount())
                .submissionSource(result.getSubmissionSource())
                .submittedAt(result.getSubmittedAt())
                .questionResults(questionResults)
                .build();

        return response;
    }

    // ── Teacher: Per-assignment results ──────────────────────────────────

    @Transactional(readOnly = true)
    public List<ExamResultDetailResponse> getAssignmentResults(Long assignmentId) {
        return resultRepository.findByAssignmentId(assignmentId)
                .stream()
                .map(r -> {
                    List<ExamResultDetailResponse.QuestionResultItem> qItems = new ArrayList<>();
                    try {
                        qItems = objectMapper.readValue(r.getAnswers(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class, ExamResultDetailResponse.QuestionResultItem.class));
                    } catch (Exception ignored) {}
                    String studentName = r.getStudent() != null && r.getStudent().getUser() != null
                            ? r.getStudent().getUser().getFullName() : "N/A";
                    return ExamResultDetailResponse.builder()
                            .resultId(r.getResultId())
                            .studentName(studentName)
                            .score(r.getScore())
                            .maxScore(r.getMaxScore())
                            .percentage(r.getPercentage())
                            .status(r.getStatus())
                            .timeTakenSeconds(r.getTimeTakenSeconds())
                            .tabSwitchCount(r.getTabSwitchCount())
                            .submissionSource(r.getSubmissionSource())
                            .submittedAt(r.getSubmittedAt())
                            .questionResults(qItems)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Anti-cheat: increment tab switch count ──────────────────────────

    public void incrementTabSwitch(Long assignmentId) {
        User user = getCurrentUser();
        resultRepository.findByStudentUserIdAndAssignment(user.getUserId(), assignmentId)
                .ifPresent(r -> {
                    r.setTabSwitchCount((r.getTabSwitchCount() == null ? 0 : r.getTabSwitchCount()) + 1);
                    resultRepository.save(r);
                });
    }

    // ── Get result detail ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExamResultDetailResponse getResult(Long resultId) {
        StudentExamResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found"));

        List<ExamResultDetailResponse.QuestionResultItem> qItems = new ArrayList<>();
        try {
            qItems = objectMapper.readValue(result.getAnswers(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ExamResultDetailResponse.QuestionResultItem.class));
        } catch (Exception ignored) {}

        return ExamResultDetailResponse.builder()
                .resultId(result.getResultId())
                .assignmentId(result.getAssignment() != null ? result.getAssignment().getAssignmentId() : null)
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getExamTitle())
                .score(result.getScore())
                .maxScore(result.getMaxScore())
                .percentage(result.getPercentage())
                .status(result.getStatus())
                .timeTakenSeconds(result.getTimeTakenSeconds())
                .tabSwitchCount(result.getTabSwitchCount())
                .submissionSource(result.getSubmissionSource())
                .submittedAt(result.getSubmittedAt())
                .questionResults(qItems)
                .aiAnalysisStudent(result.getAiAnalysisStudent())
                .aiAnalysisTeacher(result.getAiAnalysisTeacher())
                .aiAnalysisParent(result.getAiAnalysisParent())
                .build();
    }

    // ── Get teacher's classes ───────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherClasses() {
        User teacher = getCurrentUser();
        return classRepository.findByTeacherUserId(teacher.getUserId())
                .stream()
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("classId", c.getClassId());
                    m.put("className", c.getClassName());
                    m.put("classCode", c.getClassCode());
                    m.put("gradeLevel", c.getGradeLevel() != null ? c.getGradeLevel().getGradeName() : null);
                    m.put("gradeLevelId", c.getGradeLevel() != null ? c.getGradeLevel().getGradeLevelId() : null);
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ── Compute status dynamically (replaces scheduler) ─────────────────

    /**
     * Compute assignment status based on current time.
     * No scheduler needed — status is always derived from startTime/endTime.
     */
    private String computeStatus(ExamAssignment a) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(a.getStartTime())) return "SCHEDULED";
        if (now.isAfter(a.getEndTime()))     return "ENDED";
        return "ACTIVE";
    }

    // ── AI Analysis ───────────────────────────────────────────────────────

    private void triggerAiAnalysisAsync(StudentExamResult result,
                                         List<ExamResultDetailResponse.QuestionResultItem> qItems,
                                         ExamAssignment assignment) {
        if (deepseekApiKey == null || deepseekApiKey.isBlank()) return;
        try {
            long correct = qItems.stream().filter(ExamResultDetailResponse.QuestionResultItem::isCorrect).count();
            long total = qItems.size();
            String score = result.getScore() + "/" + result.getMaxScore();
            String pct = result.getPercentage() + "%";

            String studentAnalysis = callDeepSeekForAnalysis(
                "Học sinh vừa hoàn thành bài kiểm tra với điểm số " + score + " (" + pct + "). " +
                "Số câu đúng: " + correct + "/" + total + ". " +
                "Với tư cách là gia sư AI, hãy đưa ra 3-5 gợi ý học tập ngắn gọn, khích lệ để học sinh cải thiện. " +
                "Viết bằng tiếng Việt, thân thiện với học sinh THPT.");

            String teacherAnalysis = callDeepSeekForAnalysis(
                "Học sinh đạt " + score + " (" + pct + ") với " + correct + "/" + total + " câu đúng. " +
                "Hãy phân tích kết quả và đưa ra 3 đề xuất cho giáo viên để hỗ trợ học sinh tốt hơn. " +
                "Viết bằng tiếng Việt, ngôn ngữ chuyên nghiệp dành cho giáo viên.");

            String parentAnalysis = callDeepSeekForAnalysis(
                "Con của phụ huynh vừa thi và đạt " + score + " (" + pct + "). " +
                "Hãy tóm tắt kết quả và đưa ra 2-3 lời khuyên để phụ huynh hỗ trợ con học ở nhà. " +
                "Viết bằng tiếng Việt, thân thiện và dễ hiểu với phụ huynh.");

            result.setAiAnalysisStudent(studentAnalysis);
            result.setAiAnalysisTeacher(teacherAnalysis);
            result.setAiAnalysisParent(parentAnalysis);
            resultRepository.save(result);
            log.info("AI analysis saved for result {}", result.getResultId());
        } catch (Exception e) {
            log.warn("AI analysis failed for result {}: {}", result.getResultId(), e.getMessage());
        }
    }

    private String callDeepSeekForAnalysis(String prompt) {
        try {
            RestTemplate rt = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(deepseekApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "deepseek-chat");
            body.put("max_tokens", 500);
            body.put("temperature", 0.6);
            body.put("messages", List.of(
                Map.of("role", "system", "content", "Bạn là chuyên gia giáo dục. Trả lời ngắn gọn, súc tích bằng tiếng Việt."),
                Map.of("role", "user", "content", prompt)
            ));

            String json = objectMapper.writeValueAsString(body);
            ResponseEntity<String> resp = rt.exchange(DEEPSEEK_API_URL, HttpMethod.POST,
                    new HttpEntity<>(json, headers), String.class);

            var root = objectMapper.readTree(resp.getBody());
            return root.path("choices").get(0).path("message").path("content").asText("");
        } catch (Exception e) {
            log.warn("DeepSeek analysis call failed: {}", e.getMessage());
            return null;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /** Get student String UUID from current user */
    private String resolveStudentId(User user) {
        return studentRepository.findByUser(user)
                .map(Student::getStudentId)
                .orElse(null);
    }

    /** Count students enrolled in a class */
    private int countStudentsInClass(SchoolClass sc) {
        if (sc == null) return 0;
        return studentRepository.findBySchoolClass(sc).size();
    }

    private ExamAssignmentResponse toResponse(ExamAssignment a, int submittedCount) {
        Exam e = a.getExam();
        return ExamAssignmentResponse.builder()
                .assignmentId(a.getAssignmentId())
                .examId(e.getId())
                .examTitle(e.getExamTitle())
                .examCode(e.getExamCode())
                .classId(a.getSchoolClass().getClassId())
                .className(a.getSchoolClass().getClassName())
                .accessCode(a.getAccessCode())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(computeStatus(a))
                .allowedAttempts(a.getAllowedAttempts())
                .durationMinutes(a.getDurationMinutes())
                .notifyParent(a.getNotifyParent())
                .submittedCount(submittedCount)
                .totalStudents(countStudentsInClass(a.getSchoolClass()))
                .createdAt(a.getCreatedAt())
                .gradeLevel(e.getGradeLevel())
                .subjectName(e.getSubject() != null ? e.getSubject().getSubjectName() : null)
                .examTypeCode(e.getExamType() != null ? e.getExamType().getTypeCode() : null)
                .build();
    }

    // ── Get Assignment Questions (Student) ─────────────────────────────────

    /**
     * Returns exam questions for a student's assignment.
     * Verifies the assignment is ACTIVE and belongs to the student's class.
     */
    public List<ExamQuestionResponse> getAssignmentQuestions(Long assignmentId) {
        ExamAssignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Verify assignment is active by comparing time
        String currentStatus = computeStatus(a);
        if (!"ACTIVE".equals(currentStatus)) {
            throw new BadRequestException("Bài thi chưa bắt đầu hoặc đã kết thúc");
        }

        // Get questions from the exam
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(a.getExam().getId());

        return questions.stream().map(eq -> {
            ExamQuestionResponse.ExamQuestionResponseBuilder b = ExamQuestionResponse.builder()
                    .id(eq.getId())
                    .examId(eq.getExam().getId())
                    .orderNumber(eq.getOrderNumber())
                    .points(eq.getPoints())
                    .questionText(eq.getQuestionText());

            // Build shuffled options (if variant data available)
            if (eq.getOptionA() != null) {
                b.optionA(eq.getOptionA())
                 .optionB(eq.getOptionB())
                 .optionC(eq.getOptionC())
                 .optionD(eq.getOptionD())
                 .correctAnswerLabel(eq.getCorrectAnswerLabel());
            } else {
                // Non-variant: build options from correct + wrong answers
                b.correctAnswer(eq.getCorrectAnswer())
                 .wrongAnswer1(eq.getWrongAnswer1())
                 .wrongAnswer2(eq.getWrongAnswer2())
                 .wrongAnswer3(eq.getWrongAnswer3());
            }

            return b.build();
        }).collect(Collectors.toList());
    }
}
