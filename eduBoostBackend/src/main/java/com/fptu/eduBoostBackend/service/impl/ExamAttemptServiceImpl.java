package com.fptu.eduBoostBackend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptAutoSaveRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptHeartbeatRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptSubmitRequest;
import com.fptu.eduBoostBackend.dto.request.exam.TeacherAttemptGradeRequest;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStartResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStateResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptReviewResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptSubmitResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import com.fptu.eduBoostBackend.entities.enums.QuestionType;
import com.fptu.eduBoostBackend.entities.enums.ScoreRevealMode;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ExamAttemptAnswerRepository;
import com.fptu.eduBoostBackend.repositories.ExamAttemptRepository;
import com.fptu.eduBoostBackend.repositories.ExamQuestionRepository;
import com.fptu.eduBoostBackend.repositories.ExamRepository;
import com.fptu.eduBoostBackend.repositories.ExamScheduleRepository;
import com.fptu.eduBoostBackend.repositories.StudentExamResultRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.ExamAttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExamAttemptServiceImpl implements ExamAttemptService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ExamAttemptAnswerRepository examAttemptAnswerRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final StudentRepository studentRepository;
    private final StudentExamResultRepository studentExamResultRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    private static final int DEFAULT_DURATION_MINUTES = 45;
    private static final int HEARTBEAT_IDLE_TIMEOUT_MINUTES = 10;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AttemptStartResponse startAttempt(Long examId, Long scheduleId) {
        Student student = getCurrentStudent();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new ForbiddenException("Exam is not available for taking");
        }

        LocalDateTime now = LocalDateTime.now();
        int durationMinutes = DEFAULT_DURATION_MINUTES;
        ExamSchedule schedule = null;

        // Find existing in-progress attempt to verify if the student is resuming
        List<ExamAttempt> inProgressAttempts;
        if (scheduleId != null) {
            schedule = examScheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found with id: " + scheduleId));
            inProgressAttempts =
                    examAttemptRepository.findByStudent_StudentIdAndSchedule_IdAndStatus(
                            student.getStudentId(), scheduleId, ExamAttemptStatus.IN_PROGRESS);
        } else {
            inProgressAttempts =
                    examAttemptRepository.findByStudent_StudentIdAndExam_IdAndStatus(
                            student.getStudentId(), examId, ExamAttemptStatus.IN_PROGRESS);
        }
        boolean hasInProgress = !inProgressAttempts.isEmpty();

        if (scheduleId != null) {
            if (!schedule.getExam().getId().equals(examId)) {
                throw new ForbiddenException("Schedule does not belong to this exam");
            }

            // Only allow late start within [startTime, startTime + allowLateMinutes]
            if (!hasInProgress) {
                if (now.isBefore(schedule.getStartTime())) {
                    throw new ForbiddenException("Exam has not started yet");
                }
                Integer lateMinutes = schedule.getAllowLateMinutes();
                if (lateMinutes != null && lateMinutes > 0) {
                    LocalDateTime latestStart = schedule.getStartTime().plusMinutes(lateMinutes);
                    
                    // Allow the demo schedule to be taken at any time before its end time
                    if (schedule.getTitle() != null && schedule.getTitle().contains("Demo")) {
                        latestStart = schedule.getEndTime();
                    }
                    
                    if (now.isAfter(latestStart)) {
                        throw new ForbiddenException("You are late beyond the allowed start window");
                    }
                }
            }

            if (schedule.getDurationMinutes() != null && schedule.getDurationMinutes() > 0) {
                durationMinutes = schedule.getDurationMinutes();
            }

            // Enforce maxAttempts (only when starting a new attempt)
            if (!hasInProgress && schedule.getMaxAttempts() != null && schedule.getMaxAttempts() > 0) {
                long existing = examAttemptRepository.countByStudent_StudentIdAndSchedule_Id(student.getStudentId(), scheduleId);
                if (existing >= schedule.getMaxAttempts()) {
                    throw new ForbiddenException("You have reached the maximum number of attempts for this schedule");
                }
            }
        }

        LocalDateTime expiresAt = now.plusMinutes(durationMinutes);

        ExamAttempt attempt;
        if (!inProgressAttempts.isEmpty()) {
            attempt = inProgressAttempts.get(0);
            // Rotate active tab token for force-takeover behavior
            attempt.setActiveTabToken(UUID.randomUUID().toString());
            attempt.setLastActivityAt(now);
        } else {
            Integer attemptNumber;
            if (scheduleId != null) {
                attemptNumber = (int) examAttemptRepository.countByStudent_StudentIdAndSchedule_Id(student.getStudentId(), scheduleId) + 1;
            } else {
                attemptNumber = (int) examAttemptRepository.countByStudent_StudentIdAndExam_Id(student.getStudentId(), examId) + 1;
            }
            attempt = ExamAttempt.createNew(student, exam, schedule, attemptNumber, now, expiresAt);
        }

        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);

        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(examId);

        Map<Long, ExamAttemptAnswer> existingAnswers = examAttemptAnswerRepository.findByAttempt(savedAttempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        List<AttemptStartResponse.AttemptQuestionDto> questionDtos = questions.stream()
                .map(q -> {
                    ExamAttemptAnswer answer = existingAnswers.get(q.getId());
                    return AttemptStartResponse.AttemptQuestionDto.builder()
                            .examQuestionId(q.getId())
                            .orderNumber(q.getOrderNumber())
                            .questionText(q.getQuestionText())
                            .options(extractOptions(q))
                            .questionType(q.getQuestion() != null && q.getQuestion().getQuestionType() != null
                                    ? q.getQuestion().getQuestionType().name()
                                    : null)
                            .selectedOption(answer != null ? answer.getSelectedOption() : null)
                            .textAnswer(answer != null ? answer.getTextAnswer() : null)
                            .flagged(answer != null ? Boolean.TRUE.equals(answer.getFlagged()) : Boolean.FALSE)
                            .build();
                })
                .collect(Collectors.toList());

        int remainingSeconds = computeRemainingSeconds(savedAttempt, durationMinutes);

        return AttemptStartResponse.builder()
                .attemptCode(savedAttempt.getAttemptCode())
                .activeTabToken(savedAttempt.getActiveTabToken())
                .examId(exam.getId())
                .examTitle(exam.getExamTitle())
                .durationMinutes(durationMinutes)
                .remainingSeconds(remainingSeconds)
                .startedAt(savedAttempt.getStartedAt())
                .expiresAt(savedAttempt.getExpiresAt())
                .questions(questionDtos)
                .currentQuestionIndex(
                        savedAttempt.getCurrentQuestionIndex() != null ? savedAttempt.getCurrentQuestionIndex() : 0)
                .serverVersion(savedAttempt.getLockVersion())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptStateResponse getAttemptState(String attemptCode) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        Exam exam = attempt.getExam();

        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(exam.getId());
        Map<Long, ExamAttemptAnswer> existingAnswers = examAttemptAnswerRepository.findByAttempt(attempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        List<AttemptStartResponse.AttemptQuestionDto> questionDtos = questions.stream()
                .map(q -> {
                    ExamAttemptAnswer answer = existingAnswers.get(q.getId());
                    return AttemptStartResponse.AttemptQuestionDto.builder()
                            .examQuestionId(q.getId())
                            .orderNumber(q.getOrderNumber())
                            .questionText(q.getQuestionText())
                            .options(extractOptions(q))
                            .questionType(q.getQuestion() != null && q.getQuestion().getQuestionType() != null
                                    ? q.getQuestion().getQuestionType().name()
                                    : null)
                            .selectedOption(answer != null ? answer.getSelectedOption() : null)
                            .textAnswer(answer != null ? answer.getTextAnswer() : null)
                            .flagged(answer != null ? Boolean.TRUE.equals(answer.getFlagged()) : Boolean.FALSE)
                            .build();
                })
                .collect(Collectors.toList());

        int durationMinutes = DEFAULT_DURATION_MINUTES;
        int remainingSeconds = computeRemainingSeconds(attempt, durationMinutes);

        return AttemptStateResponse.builder()
                .attemptCode(attempt.getAttemptCode())
                .examId(exam.getId())
                .examTitle(exam.getExamTitle())
                .durationMinutes(durationMinutes)
                .remainingSeconds(remainingSeconds)
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .questions(questionDtos)
                .currentQuestionIndex(
                        attempt.getCurrentQuestionIndex() != null ? attempt.getCurrentQuestionIndex() : 0)
                .serverVersion(attempt.getLockVersion())
                .build();
    }

    @Override
    public AttemptStateResponse autoSave(String attemptCode, AttemptAutoSaveRequest request) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        validateActiveTabToken(attempt, request.getActiveTabToken());
        validateAttemptIsActive(attempt);

        // Optional optimistic concurrency check
        if (request.getClientVersion() != null && attempt.getLockVersion() != null
                && !Objects.equals(request.getClientVersion(), attempt.getLockVersion())) {
            log.warn("Client version {} does not match server version {} for attempt {}",
                    request.getClientVersion(), attempt.getLockVersion(), attemptCode);
        }

        Map<Long, ExamAttemptAnswer> existingAnswers = examAttemptAnswerRepository.findByAttempt(attempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        LocalDateTime now = LocalDateTime.now();
        for (AttemptAutoSaveRequest.AttemptAnswerPayload payload : request.getAnswers()) {
            ExamAttemptAnswer answer = existingAnswers.get(payload.getExamQuestionId());
            if (answer == null) {
                ExamQuestion question = examQuestionRepository.findById(payload.getExamQuestionId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Question not found: " + payload.getExamQuestionId()));
                answer = ExamAttemptAnswer.builder()
                        .attempt(attempt)
                        .examQuestion(question)
                        .build();
            }
            answer.setSelectedOption(payload.getSelectedOption());
            answer.setTextAnswer(payload.getTextAnswer());
            answer.setFlagged(payload.getFlagged());
            answer.setAutoSaved(Boolean.TRUE);
            answer.setAnsweredAt(now);
            examAttemptAnswerRepository.save(answer);
        }

        attempt.setCurrentQuestionIndex(request.getCurrentQuestionIndex());
        attempt.setLastActivityAt(now);
        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);

        int durationMinutes = DEFAULT_DURATION_MINUTES;
        int remainingSeconds = computeRemainingSeconds(savedAttempt, durationMinutes);

        return AttemptStateResponse.builder()
                .attemptCode(savedAttempt.getAttemptCode())
                .examId(savedAttempt.getExam().getId())
                .examTitle(savedAttempt.getExam().getExamTitle())
                .durationMinutes(durationMinutes)
                .remainingSeconds(remainingSeconds)
                .startedAt(savedAttempt.getStartedAt())
                .expiresAt(savedAttempt.getExpiresAt())
                .questions(null) // not needed for auto-save response
                .currentQuestionIndex(savedAttempt.getCurrentQuestionIndex())
                .serverVersion(savedAttempt.getLockVersion())
                .build();
    }

    @Override
    public AttemptSubmitResponse submit(String attemptCode, AttemptSubmitRequest request) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        validateActiveTabToken(attempt, request.getActiveTabToken());
        validateAttemptIsActive(attempt);

        LocalDateTime now = LocalDateTime.now();
        int durationMinutes = DEFAULT_DURATION_MINUTES;
        int remainingSeconds = computeRemainingSeconds(attempt, durationMinutes);
        if (remainingSeconds <= 0) {
            attempt.setStatus(ExamAttemptStatus.EXPIRED);
            examAttemptRepository.save(attempt);
            throw new ForbiddenException("Exam attempt has expired");
        }

        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(attempt.getExam().getId());
        Map<Long, ExamAttemptAnswer> answers = examAttemptAnswerRepository.findByAttempt(attempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        // Persist final answers snapshot before grading/review.
        // This prevents the server from grading stale/empty exam_attempt_answer rows.
        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            Map<Long, ExamQuestion> questionsById = questions.stream()
                    .collect(Collectors.toMap(ExamQuestion::getId, q -> q));

            for (AttemptSubmitRequest.AttemptAnswerPayload payload : request.getAnswers()) {
                if (payload == null || payload.getExamQuestionId() == null) continue;
                ExamQuestion q = questionsById.get(payload.getExamQuestionId());
                if (q == null) continue;

                ExamAttemptAnswer answer = answers.get(payload.getExamQuestionId());
                if (answer == null) {
                    answer = ExamAttemptAnswer.builder()
                            .attempt(attempt)
                            .examQuestion(q)
                            .build();
                    answer.setAutoSaved(Boolean.FALSE);
                    answers.put(payload.getExamQuestionId(), answer);
                }

                answer.setSelectedOption(payload.getSelectedOption());
                answer.setTextAnswer(payload.getTextAnswer());
                answer.setFlagged(payload.getFlagged());
                answer.setAnsweredAt(now);
                examAttemptAnswerRepository.save(answer);
            }
        }

        int correctCount = 0;
        BigDecimal totalPoints = BigDecimal.ZERO;
        BigDecimal earnedPoints = BigDecimal.ZERO;

        for (ExamQuestion question : questions) {
            totalPoints = totalPoints.add(question.getPoints());
            ExamAttemptAnswer answer = answers.get(question.getId());
            boolean ok = isCorrectAnswer(question, answer);
            if (ok) {
                correctCount++;
                earnedPoints = earnedPoints.add(question.getPoints());
            }
        }

        BigDecimal percentage = totalPoints.compareTo(BigDecimal.ZERO) > 0
                ? earnedPoints.multiply(BigDecimal.valueOf(100))
                .divide(totalPoints, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        attempt.setStatus(ExamAttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(now);
        attempt.setLastActivityAt(now);
        examAttemptRepository.save(attempt);

        // Persist to StudentExamResult so that parent flows can reuse
        StudentExamResult result = StudentExamResult.builder()
                .student(attempt.getStudent())
                .exam(attempt.getExam())
                .score(earnedPoints)
                .maxScore(totalPoints)
                .percentage(percentage)
                .status("COMPLETED")
                .sourceType("ONLINE_EXAM")
                .attemptNumber(attempt.getAttemptNumber() != null ? attempt.getAttemptNumber() : 1)
                .takenAt(now)
                .build();
        studentExamResultRepository.save(result);

        ExamSchedule sched = attempt.getSchedule();
        boolean scoresHidden = sched != null
                && sched.getScoreRevealMode() == ScoreRevealMode.AFTER_ANNOUNCE
                && sched.getResultsAnnouncedAt() == null;

        AttemptSubmitResponse.AttemptSubmitResponseBuilder b = AttemptSubmitResponse.builder()
                .attemptCode(attempt.getAttemptCode())
                .examId(attempt.getExam().getId())
                .totalQuestions(questions.size())
                .scoresHidden(scoresHidden);
        if (scoresHidden) {
            return b.score(null).maxScore(null).percentage(null).correctCount(null).build();
        }
        return b.score(earnedPoints)
                .maxScore(totalPoints)
                .percentage(percentage)
                .correctCount(correctCount)
                .build();
    }

    @Override
    public void heartbeat(String attemptCode, AttemptHeartbeatRequest request) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        validateActiveTabToken(attempt, request.getActiveTabToken());
        validateAttemptIsActive(attempt);

        LocalDateTime now = LocalDateTime.now();
        attempt.setLastActivityAt(now);

        // Expire only by real exam time limit.
        // Browsers throttle timers/requests in background tabs; expiring on "idle heartbeat" would create duplicate attempts.
        if (attempt.getExpiresAt() != null && now.isAfter(attempt.getExpiresAt())) {
            attempt.setStatus(ExamAttemptStatus.EXPIRED);
        }

        examAttemptRepository.save(attempt);
    }

    @Override
    public void reportViolation(String attemptCode, String violationType) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        if (attempt.getStatus() != ExamAttemptStatus.IN_PROGRESS) {
            return; // silently ignore violations on finished attempts
        }

        int newCount = (attempt.getViolationCount() == null ? 0 : attempt.getViolationCount()) + 1;
        attempt.setViolationCount(newCount);
        log.info("Violation '{}' recorded for attempt {} (count={})", violationType, attemptCode, newCount);

        // Auto-submit after 5 violations as conservative default
        if (newCount >= 5) {
            log.warn("Auto-submitting attempt {} due to {} violations", attemptCode, newCount);
            attempt.setStatus(ExamAttemptStatus.SUBMITTED);
            attempt.setSubmittedAt(LocalDateTime.now());

            // Grade inline
            List<ExamQuestion> questions = examQuestionRepository
                    .findByExamIdWithDetailsOrdered(attempt.getExam().getId());
            Map<Long, ExamAttemptAnswer> answers = examAttemptAnswerRepository
                    .findByAttempt(attempt).stream()
                    .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));
            BigDecimal totalPoints = BigDecimal.ZERO;
            BigDecimal earnedPoints = BigDecimal.ZERO;
            for (ExamQuestion q : questions) {
                totalPoints = totalPoints.add(q.getPoints());
                ExamAttemptAnswer ans = answers.get(q.getId());
                boolean ok = isCorrectAnswer(q, ans);
                if (ok) earnedPoints = earnedPoints.add(q.getPoints());
            }
            BigDecimal percentage = totalPoints.compareTo(BigDecimal.ZERO) > 0
                    ? earnedPoints.multiply(BigDecimal.valueOf(100))
                            .divide(totalPoints, 2, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            studentExamResultRepository.save(StudentExamResult.builder()
                    .student(attempt.getStudent())
                    .exam(attempt.getExam())
                    .score(earnedPoints)
                    .maxScore(totalPoints)
                    .percentage(percentage)
                    .status("COMPLETED")
                    .sourceType("ONLINE_EXAM")
                    .attemptNumber(attempt.getAttemptNumber() != null ? attempt.getAttemptNumber() : 1)
                    .takenAt(LocalDateTime.now())
                    .build());
        }

        examAttemptRepository.save(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptReviewResponse getAttemptReview(String attemptCode) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        if (attempt.getStatus() != ExamAttemptStatus.SUBMITTED) {
            throw new ForbiddenException("Chỉ xem lại được sau khi đã nộp bài");
        }

        ExamSchedule sched = attempt.getSchedule();
        boolean answerKeyRevealed = sched == null
                || sched.getScoreRevealMode() == ScoreRevealMode.IMMEDIATE
                || sched.getResultsAnnouncedAt() != null;

        Exam exam = attempt.getExam();
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(exam.getId());
        Map<Long, ExamAttemptAnswer> answerMap = examAttemptAnswerRepository.findByAttempt(attempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        int correctCount = 0;
        BigDecimal totalPoints = BigDecimal.ZERO;
        BigDecimal earnedPoints = BigDecimal.ZERO;
        List<AttemptReviewResponse.ReviewQuestionDto> dtos = new ArrayList<>();

        for (ExamQuestion q : questions) {
            totalPoints = totalPoints.add(q.getPoints());
            ExamAttemptAnswer ans = answerMap.get(q.getId());
            String selected = ans != null ? ans.getSelectedOption() : null;
            String text = ans != null ? ans.getTextAnswer() : null;
            boolean ok = isCorrectAnswer(q, ans);
            if (ok) {
                correctCount++;
                earnedPoints = earnedPoints.add(q.getPoints());
            }

            AttemptReviewResponse.ReviewQuestionDto.ReviewQuestionDtoBuilder qb =
                    AttemptReviewResponse.ReviewQuestionDto.builder()
                            .examQuestionId(q.getId())
                            .orderNumber(q.getOrderNumber())
                            .questionText(q.getQuestionText())
                            .options(extractOptions(q))
                            .selectedOption(selected);
            qb.textAnswer(text);
            qb.questionType(q.getQuestion() != null && q.getQuestion().getQuestionType() != null
                    ? q.getQuestion().getQuestionType().name()
                    : null);
            if (answerKeyRevealed) {
                qb.correctAnswer(q.getCorrectAnswer())
                        .correct(ok)
                        .points(q.getPoints())
                        .pointsEarned(ok ? q.getPoints() : BigDecimal.ZERO);
            } else {
                qb.correctAnswer(null).correct(null).points(null).pointsEarned(null);
            }
            dtos.add(qb.build());
        }

        BigDecimal percentage = totalPoints.compareTo(BigDecimal.ZERO) > 0
                ? earnedPoints.multiply(BigDecimal.valueOf(100))
                .divide(totalPoints, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        AttemptReviewResponse.AttemptReviewResponseBuilder rb = AttemptReviewResponse.builder()
                .attemptCode(attempt.getAttemptCode())
                .examId(exam.getId())
                .examTitle(exam.getExamTitle())
                .answerKeyRevealed(answerKeyRevealed)
                .totalQuestions(questions.size())
                .correctCount(answerKeyRevealed ? correctCount : null)
                .questions(dtos);
        if (answerKeyRevealed) {
            rb.score(earnedPoints).maxScore(totalPoints).percentage(percentage);
        } else {
            rb.score(null).maxScore(null).percentage(null);
        }
        return rb.build();
    }

    // ─── Teacher operations ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AttemptReviewResponse getTeacherAttemptReview(Long scheduleId, String attemptCode) {
        ExamAttempt attempt = getAttemptForTeacher(scheduleId, attemptCode);

        Exam exam = attempt.getExam();
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(exam.getId());
        Map<Long, ExamAttemptAnswer> answerMap = examAttemptAnswerRepository.findByAttempt(attempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        int correctCount = 0;
        BigDecimal totalPoints = BigDecimal.ZERO;
        BigDecimal earnedPoints = BigDecimal.ZERO;
        List<AttemptReviewResponse.ReviewQuestionDto> dtos = new ArrayList<>();

        for (ExamQuestion q : questions) {
            totalPoints = totalPoints.add(q.getPoints());
            ExamAttemptAnswer ans = answerMap.get(q.getId());

            QuestionType qType = q.getQuestion() != null ? q.getQuestion().getQuestionType() : null;
            String selected = ans != null ? ans.getSelectedOption() : null;
            String text = ans != null ? ans.getTextAnswer() : null;

            boolean autoOk = isCorrectAnswer(q, ans);
            if (autoOk) {
                correctCount++;
            }

            BigDecimal teacherOverride =
                    (qType == QuestionType.FILL_BLANK && ans != null) ? ans.getTeacherPointsOverride() : null;

            BigDecimal pointsEarnedEffective =
                    (teacherOverride != null) ? teacherOverride : (autoOk ? q.getPoints() : BigDecimal.ZERO);

            earnedPoints = earnedPoints.add(pointsEarnedEffective);

            AttemptReviewResponse.ReviewQuestionDto.ReviewQuestionDtoBuilder qb =
                    AttemptReviewResponse.ReviewQuestionDto.builder()
                            .examQuestionId(q.getId())
                            .orderNumber(q.getOrderNumber())
                            .questionText(q.getQuestionText())
                            .options(extractOptions(q))
                            .questionType(qType != null ? qType.name() : null)
                            .selectedOption(selected)
                            .textAnswer(text)
                            .correctAnswer(q.getCorrectAnswer())
                            .correct(autoOk)
                            .points(q.getPoints())
                            .pointsEarned(pointsEarnedEffective)
                            .teacherPointsOverride(teacherOverride)
                            .teacherComment(ans != null ? ans.getTeacherComment() : null);

            dtos.add(qb.build());
        }

        BigDecimal percentage = totalPoints.compareTo(BigDecimal.ZERO) > 0
                ? earnedPoints.multiply(BigDecimal.valueOf(100))
                .divide(totalPoints, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return AttemptReviewResponse.builder()
                .attemptCode(attempt.getAttemptCode())
                .examId(exam.getId())
                .examTitle(exam.getExamTitle())
                .answerKeyRevealed(true)
                .totalQuestions(questions.size())
                .correctCount(correctCount)
                .score(earnedPoints)
                .maxScore(totalPoints)
                .percentage(percentage)
                .questions(dtos)
                .build();
    }

    @Override
    public void gradeTeacherAttempt(Long scheduleId, String attemptCode, TeacherAttemptGradeRequest request) {
        ExamAttempt attempt = getAttemptForTeacher(scheduleId, attemptCode);
        if (request == null || request.getQuestionGrades() == null) {
            throw new IllegalArgumentException("Question grades payload is required");
        }

        LocalDateTime now = LocalDateTime.now();
        Exam exam = attempt.getExam();
        List<ExamQuestion> questions = examQuestionRepository.findByExamIdWithDetailsOrdered(exam.getId());
        Map<Long, ExamQuestion> questionsById = questions.stream()
                .collect(Collectors.toMap(ExamQuestion::getId, q -> q));

        Map<Long, ExamAttemptAnswer> answersByQuestionId = examAttemptAnswerRepository.findByAttempt(attempt).stream()
                .collect(Collectors.toMap(a -> a.getExamQuestion().getId(), a -> a));

        for (TeacherAttemptGradeRequest.QuestionGrade grade : request.getQuestionGrades()) {
            if (grade == null || grade.getExamQuestionId() == null) continue;

            ExamQuestion q = questionsById.get(grade.getExamQuestionId());
            if (q == null) continue;

            QuestionType qType = q.getQuestion() != null ? q.getQuestion().getQuestionType() : null;
            if (qType != QuestionType.FILL_BLANK) {
                // Ignore teacher overrides for non-FILL_BLANK questions.
                continue;
            }

            ExamAttemptAnswer ans = answersByQuestionId.get(q.getId());
            if (ans == null) {
                ans = ExamAttemptAnswer.builder()
                        .attempt(attempt)
                        .examQuestion(q)
                        .build();
                answersByQuestionId.put(q.getId(), ans);
            }

            BigDecimal override = grade.getTeacherPointsOverride();
            if (override != null) {
                if (override.compareTo(BigDecimal.ZERO) < 0 || override.compareTo(q.getPoints()) > 0) {
                    throw new IllegalArgumentException("teacherPointsOverride out of range for questionId=" + q.getId());
                }
                ans.setTeacherPointsOverride(override);
            } else {
                ans.setTeacherPointsOverride(null);
            }
            ans.setTeacherComment(grade.getTeacherComment());
            ans.setTeacherGradedAt(now);
            examAttemptAnswerRepository.save(ans);
        }

        // Recompute total score using effective points (teacher override for FILL_BLANK).
        BigDecimal totalPoints = BigDecimal.ZERO;
        BigDecimal earnedPoints = BigDecimal.ZERO;
        for (ExamQuestion q : questions) {
            totalPoints = totalPoints.add(q.getPoints());
            ExamAttemptAnswer ans = answersByQuestionId.get(q.getId());
            QuestionType qType = q.getQuestion() != null ? q.getQuestion().getQuestionType() : null;

            boolean autoOk = isCorrectAnswer(q, ans);
            BigDecimal teacherOverride =
                    (qType == QuestionType.FILL_BLANK && ans != null) ? ans.getTeacherPointsOverride() : null;

            BigDecimal effectiveEarned = (teacherOverride != null)
                    ? teacherOverride
                    : (autoOk ? q.getPoints() : BigDecimal.ZERO);

            earnedPoints = earnedPoints.add(effectiveEarned);
        }

        BigDecimal percentage = totalPoints.compareTo(BigDecimal.ZERO) > 0
                ? earnedPoints.multiply(BigDecimal.valueOf(100))
                .divide(totalPoints, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Integer attemptNumber = attempt.getAttemptNumber() != null ? attempt.getAttemptNumber() : 1;
        StudentExamResult result = studentExamResultRepository
                .findFirstByStudentAndExamAndAttemptNumberOrderByResultIdDesc(
                        attempt.getStudent(), attempt.getExam(), attemptNumber)
                .orElseGet(() -> StudentExamResult.builder()
                        .student(attempt.getStudent())
                        .exam(attempt.getExam())
                        .attemptNumber(attemptNumber)
                        .status("COMPLETED")
                        .sourceType("ONLINE_EXAM")
                        .takenAt(now)
                        .score(BigDecimal.ZERO)
                        .maxScore(BigDecimal.ZERO)
                        .percentage(BigDecimal.ZERO)
                        .build());

        result.setScore(earnedPoints);
        result.setMaxScore(totalPoints);
        result.setPercentage(percentage);
        result.setStatus("COMPLETED");
        result.setTakenAt(now);
        studentExamResultRepository.save(result);
    }

    private ExamAttempt getAttemptForTeacher(Long scheduleId, String attemptCode) {
        Teacher teacher = getCurrentTeacher();
        ExamAttempt attempt = examAttemptRepository.findByAttemptCode(attemptCode)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (attempt.getSchedule() == null || attempt.getSchedule().getId() == null
                || !attempt.getSchedule().getId().equals(scheduleId)) {
            throw new ResourceNotFoundException("Exam schedule not found for this attempt");
        }

        if (!attempt.getSchedule().getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to access this student's attempt");
        }

        if (attempt.getStatus() != ExamAttemptStatus.SUBMITTED) {
            throw new ForbiddenException("Chỉ xem / chấm được sau khi đã nộp bài");
        }

        return attempt;
    }

    private Teacher getCurrentTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User principal = (User) auth.getPrincipal();
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return teacherRepository.findByUser(user)
                .orElseThrow(() -> new ForbiddenException("User is not a teacher"));
    }

    private List<String> extractOptions(ExamQuestion question) {
        List<String> options = new ArrayList<>();
        if (question.getWrongAnswer1() != null) options.add(question.getWrongAnswer1());
        if (question.getWrongAnswer2() != null) options.add(question.getWrongAnswer2());
        if (question.getWrongAnswer3() != null) options.add(question.getWrongAnswer3());
        if (question.getCorrectAnswer() != null) options.add(question.getCorrectAnswer());
        return options;
    }

    private boolean isCorrectAnswer(ExamQuestion question, ExamAttemptAnswer answer) {
        if (question == null || answer == null) return false;

        QuestionType qType = question.getQuestion() != null ? question.getQuestion().getQuestionType() : null;
        if (qType == QuestionType.FILL_BLANK) {
            String studentNorm = normalizeFreeText(answer.getTextAnswer());
            String correctNorm = normalizeFreeText(question.getCorrectAnswer());
            return studentNorm != null && correctNorm != null && studentNorm.equals(correctNorm);
        }

        String selected = answer.getSelectedOption();
        return selected != null && Objects.equals(selected, question.getCorrectAnswer());
    }

    private String normalizeFreeText(String value) {
        if (value == null) return null;
        // Normalize for loose matching:
        // - trim + lowercase
        // - collapse whitespace
        // - remove degree symbol (e.g. 180° vs 180)
        String t = value.trim().toLowerCase();
        t = t.replace("°", "");
        t = t.replaceAll("\\s+", " ");
        return t;
    }

    private int computeRemainingSeconds(ExamAttempt attempt, int durationMinutes) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = attempt.getExpiresAt() != null
                ? attempt.getExpiresAt()
                : attempt.getStartedAt().plusMinutes(durationMinutes);
        if (now.isAfter(endTime)) {
            return 0;
        }
        return (int) java.time.Duration.between(now, endTime).getSeconds();
    }

    private ExamAttempt getAttemptForCurrentStudent(String attemptCode) {
        Student student = getCurrentStudent();
        ExamAttempt attempt = examAttemptRepository.findByAttemptCode(attemptCode)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        if (!attempt.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new ForbiddenException("You are not allowed to access this attempt");
        }
        return attempt;
    }

    private void validateActiveTabToken(ExamAttempt attempt, String activeTabToken) {
        if (attempt.getActiveTabToken() == null || !attempt.getActiveTabToken().equals(activeTabToken)) {
            throw new ForbiddenException("Attempt has been taken over by another tab");
        }
    }

    private void validateAttemptIsActive(ExamAttempt attempt) {
        if (attempt.getStatus() != ExamAttemptStatus.IN_PROGRESS) {
            throw new ForbiddenException("Attempt is not active");
        }
    }

    private Student getCurrentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        User user = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ForbiddenException("User is not a student"));
    }
}

