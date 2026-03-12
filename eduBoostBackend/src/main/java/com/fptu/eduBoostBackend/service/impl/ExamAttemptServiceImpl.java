package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.exam.AttemptAutoSaveRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptHeartbeatRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptSubmitRequest;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStartResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStateResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptSubmitResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ExamAttemptAnswerRepository;
import com.fptu.eduBoostBackend.repositories.ExamAttemptRepository;
import com.fptu.eduBoostBackend.repositories.ExamQuestionRepository;
import com.fptu.eduBoostBackend.repositories.ExamRepository;
import com.fptu.eduBoostBackend.repositories.ExamScheduleRepository;
import com.fptu.eduBoostBackend.repositories.StudentExamResultRepository;
import com.fptu.eduBoostBackend.repositories.StudentRepository;
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
    private final UserRepository userRepository;

    private static final int DEFAULT_DURATION_MINUTES = 45;
    private static final int HEARTBEAT_IDLE_TIMEOUT_MINUTES = 10;

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

        if (scheduleId != null) {
            ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found with id: " + scheduleId));

            if (!schedule.getExam().getId().equals(examId)) {
                throw new ForbiddenException("Schedule does not belong to this exam");
            }

            // Only allow late start within [startTime, startTime + allowLateMinutes]
            if (now.isBefore(schedule.getStartTime())) {
                throw new ForbiddenException("Exam has not started yet");
            }
            Integer lateMinutes = schedule.getAllowLateMinutes();
            if (lateMinutes != null && lateMinutes > 0) {
                LocalDateTime latestStart = schedule.getStartTime().plusMinutes(lateMinutes);
                if (now.isAfter(latestStart)) {
                    throw new ForbiddenException("You are late beyond the allowed start window");
                }
            }

            if (schedule.getDurationMinutes() != null && schedule.getDurationMinutes() > 0) {
                durationMinutes = schedule.getDurationMinutes();
            }
        }

        LocalDateTime expiresAt = now.plusMinutes(durationMinutes);

        // Find existing in-progress attempt
        List<ExamAttempt> inProgressAttempts =
                examAttemptRepository.findByStudent_StudentIdAndExam_IdAndStatus(student.getStudentId(), examId, ExamAttemptStatus.IN_PROGRESS);

        ExamAttempt attempt;
        if (!inProgressAttempts.isEmpty()) {
            attempt = inProgressAttempts.get(0);
            // Rotate active tab token for force-takeover behavior
            attempt.setActiveTabToken(UUID.randomUUID().toString());
            attempt.setLastActivityAt(now);
        } else {
            attempt = ExamAttempt.createNew(student, exam, now, expiresAt);
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

        int correctCount = 0;
        BigDecimal totalPoints = BigDecimal.ZERO;
        BigDecimal earnedPoints = BigDecimal.ZERO;

        for (ExamQuestion question : questions) {
            totalPoints = totalPoints.add(question.getPoints());
            ExamAttemptAnswer answer = answers.get(question.getId());
            if (answer != null && answer.getSelectedOption() != null) {
                if (Objects.equals(answer.getSelectedOption(), question.getCorrectAnswer())) {
                    correctCount++;
                    earnedPoints = earnedPoints.add(question.getPoints());
                }
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
                .attemptNumber(1)
                .takenAt(now)
                .build();
        studentExamResultRepository.save(result);

        return AttemptSubmitResponse.builder()
                .attemptCode(attempt.getAttemptCode())
                .examId(attempt.getExam().getId())
                .score(earnedPoints)
                .maxScore(totalPoints)
                .percentage(percentage)
                .correctCount(correctCount)
                .totalQuestions(questions.size())
                .build();
    }

    @Override
    public void heartbeat(String attemptCode, AttemptHeartbeatRequest request) {
        ExamAttempt attempt = getAttemptForCurrentStudent(attemptCode);
        validateActiveTabToken(attempt, request.getActiveTabToken());
        validateAttemptIsActive(attempt);

        LocalDateTime now = LocalDateTime.now();
        attempt.setLastActivityAt(now);

        // expire attempt if idle too long
        if (attempt.getExpiresAt() != null && now.isAfter(attempt.getExpiresAt())) {
            attempt.setStatus(ExamAttemptStatus.EXPIRED);
        } else if (attempt.getLastActivityAt() != null &&
                attempt.getLastActivityAt().isBefore(now.minusMinutes(HEARTBEAT_IDLE_TIMEOUT_MINUTES))) {
            attempt.setStatus(ExamAttemptStatus.EXPIRED);
        }

        examAttemptRepository.save(attempt);
    }

    private List<String> extractOptions(ExamQuestion question) {
        List<String> options = new ArrayList<>();
        if (question.getWrongAnswer1() != null) options.add(question.getWrongAnswer1());
        if (question.getWrongAnswer2() != null) options.add(question.getWrongAnswer2());
        if (question.getWrongAnswer3() != null) options.add(question.getWrongAnswer3());
        if (question.getCorrectAnswer() != null) options.add(question.getCorrectAnswer());
        return options;
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

