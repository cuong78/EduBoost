package com.fptu.eduBoostBackend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptu.eduBoostBackend.dto.request.ExamScheduleCreateRequest;
import com.fptu.eduBoostBackend.dto.request.ExamScheduleUpdateRequest;
import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
import com.fptu.eduBoostBackend.dto.response.exam.ExamScheduleResultResponse;
import com.fptu.eduBoostBackend.entities.*;
import com.fptu.eduBoostBackend.entities.enums.ScoreRevealMode;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.*;
import com.fptu.eduBoostBackend.service.ExamScheduleService;
import com.fptu.eduBoostBackend.service.ScoreRevealPolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExamScheduleServiceImpl implements ExamScheduleService {

    private final ExamScheduleRepository examScheduleRepository;
    private final ExamRepository examRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final StudentExamResultRepository studentExamResultRepository;
    private final ObjectMapper objectMapper;
    private final ScoreRevealPolicyService scoreRevealPolicyService;

    private static final String DEFAULT_SETTINGS =
            "{\"maxTabSwitches\":3,\"requireFullscreen\":false,\"autoSubmitOnViolation\":false}";

    // ─── Teacher operations ──────────────────────────────────────────────────────

    @Override
    public ExamScheduleSummaryResponse createSchedule(ExamScheduleCreateRequest request) {
        Teacher teacher = getCurrentTeacher();

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + request.getExamId()));

        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.getClassId()));

        if (!schoolClass.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to schedule exams for this class");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        String settingsJson = serializeSettings(request.getSettings());
        ScoreRevealMode revealMode = ScoreRevealMode.IMMEDIATE;
        if (request.getScoreRevealMode() != null
                && "AFTER_ANNOUNCE".equalsIgnoreCase(request.getScoreRevealMode().trim())) {
            revealMode = ScoreRevealMode.AFTER_ANNOUNCE;
        }

        ExamSchedule schedule = ExamSchedule.builder()
                .exam(exam)
                .schoolClass(schoolClass)
                .teacher(teacher)
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .allowLateMinutes(request.getAllowLateMinutes())
                .maxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 1)
                .password(request.getPassword())
                .status("SCHEDULED")
                .settings(settingsJson)
                .scoreRevealMode(revealMode)
                .build();

        ExamSchedule saved = examScheduleRepository.save(schedule);
        log.info("Created exam schedule {} for class {} exam {}",
                saved.getId(), schoolClass.getClassName(), exam.getExamTitle());
        return mapToSummary(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExamScheduleSummaryResponse> getClassSchedules(String classId, Pageable pageable) {
        Teacher teacher = getCurrentTeacher();
        return examScheduleRepository
                .findByTeacherAndSchoolClass_ClassId(teacher, classId, pageable)
                .map(this::mapToSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamScheduleSummaryResponse getScheduleDetail(Long scheduleId) {
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found: " + scheduleId));
        return mapToSummary(schedule);
    }

    @Override
    public void cancelSchedule(Long scheduleId) {
        Teacher teacher = getCurrentTeacher();
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found: " + scheduleId));
        if (!schedule.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to cancel this schedule");
        }
        if ("CANCELLED".equals(schedule.getStatus())) {
            throw new IllegalStateException("Schedule is already cancelled");
        }
        schedule.setStatus("CANCELLED");
        examScheduleRepository.save(schedule);
        log.info("Teacher {} cancelled schedule {}", teacher.getTeacherId(), scheduleId);
    }

    @Override
    public void announceResults(Long scheduleId) {
        Teacher teacher = getCurrentTeacher();
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found: " + scheduleId));
        if (!schedule.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to announce results for this schedule");
        }
        if (schedule.getScoreRevealMode() != ScoreRevealMode.AFTER_ANNOUNCE) {
            throw new IllegalStateException("This schedule does not use AFTER_ANNOUNCE score mode");
        }
        if (schedule.getResultsAnnouncedAt() != null) {
            throw new IllegalStateException("Results have already been announced");
        }
        schedule.setResultsAnnouncedAt(LocalDateTime.now());
        schedule.setResultsAnnouncedBy(teacher);
        examScheduleRepository.save(schedule);
        log.info("Teacher {} announced results for schedule {}", teacher.getTeacherId(), scheduleId);
    }

    @Override
    public ExamScheduleSummaryResponse updateSchedule(Long scheduleId, ExamScheduleUpdateRequest request) {
        Teacher teacher = getCurrentTeacher();
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found: " + scheduleId));

        if (!schedule.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to edit this schedule");
        }

        if ("CANCELLED".equals(schedule.getStatus())) {
            throw new IllegalStateException("Cannot edit a cancelled schedule");
        }

        if (schedule.getResultsAnnouncedAt() != null) {
            throw new IllegalStateException("Cannot edit schedule after results announced");
        }

        // Apply partial updates (null => keep existing)
        if (request.getTitle() != null) schedule.setTitle(request.getTitle());
        if (request.getDescription() != null) schedule.setDescription(request.getDescription());
        if (request.getStartTime() != null) schedule.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) schedule.setEndTime(request.getEndTime());
        if (request.getDurationMinutes() != null) schedule.setDurationMinutes(request.getDurationMinutes());
        if (request.getAllowLateMinutes() != null) schedule.setAllowLateMinutes(request.getAllowLateMinutes());
        if (request.getMaxAttempts() != null) schedule.setMaxAttempts(request.getMaxAttempts());
        if (request.getPassword() != null) {
            String pwd = request.getPassword().trim();
            schedule.setPassword(pwd.isEmpty() ? null : pwd);
        }

        if (request.getScoreRevealMode() != null) {
            ScoreRevealMode revealMode =
                    "AFTER_ANNOUNCE".equalsIgnoreCase(request.getScoreRevealMode().trim())
                            ? ScoreRevealMode.AFTER_ANNOUNCE
                            : ScoreRevealMode.IMMEDIATE;
            schedule.setScoreRevealMode(revealMode);
        }

        if (request.getSettings() != null) {
            schedule.setSettings(serializeSettings(request.getSettings()));
        }

        // Validate time window after modifications
        if (schedule.getEndTime() != null && schedule.getStartTime() != null
                && schedule.getEndTime().isBefore(schedule.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        ExamSchedule saved = examScheduleRepository.save(schedule);
        return mapToSummary(saved);
    }

    // ─── Student operations ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ExamScheduleSummaryResponse> getStudentUpcomingExams() {
        Student student = getCurrentStudent();
        String classId = student.getSchoolClass().getClassId();
        LocalDateTime now = LocalDateTime.now();
        return examScheduleRepository
                .findBySchoolClass_ClassIdInAndEndTimeAfter(List.of(classId), now)
                .stream()
                .filter(s -> !"CANCELLED".equals(s.getStatus()))
                .map(s -> mapToSummaryForStudent(s, student))
                .collect(Collectors.toList());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private ExamScheduleSummaryResponse mapToSummary(ExamSchedule schedule) {
        return ExamScheduleSummaryResponse.builder()
                .id(schedule.getId())
                .examId(schedule.getExam().getId())
                .examTitle(schedule.getExam().getExamTitle())
                .classId(schedule.getSchoolClass().getClassId())
                .className(schedule.getSchoolClass().getClassName())
                .title(schedule.getTitle())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .durationMinutes(schedule.getDurationMinutes())
                .maxAttempts(schedule.getMaxAttempts())
                .allowLateMinutes(schedule.getAllowLateMinutes())
                .status(schedule.getStatus())
                .settings(schedule.getSettings())
                .scoreRevealMode(schedule.getScoreRevealMode() != null
                        ? schedule.getScoreRevealMode().name()
                        : ScoreRevealMode.IMMEDIATE.name())
                .resultsAnnouncedAt(schedule.getResultsAnnouncedAt())
                .hasPassword(schedule.getPassword() != null && !schedule.getPassword().isBlank())
                .build();
    }

    private ExamScheduleSummaryResponse mapToSummaryForStudent(ExamSchedule schedule, Student student) {
        ExamScheduleSummaryResponse r = mapToSummary(schedule);
        List<ExamAttempt> attempts =
                examAttemptRepository.findByStudent_StudentIdAndSchedule_Id(student.getStudentId(), schedule.getId());
        boolean submitted = attempts.stream().anyMatch(a -> a.getStatus() == ExamAttemptStatus.SUBMITTED);
        r.setStudentSubmitted(submitted);
        boolean pending = submitted
                && schedule.getScoreRevealMode() == ScoreRevealMode.AFTER_ANNOUNCE
                && schedule.getResultsAnnouncedAt() == null;
        r.setScoresPendingAnnouncement(pending);
        attempts.stream()
                .filter(a -> a.getStatus() == ExamAttemptStatus.SUBMITTED)
                .max(Comparator.comparing(a -> a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getStartedAt(),
                        Comparator.nullsFirst(Comparator.naturalOrder())))
                .ifPresent(a -> r.setSubmittedAttemptCode(a.getAttemptCode()));
        return r;
    }

    private String serializeSettings(ExamScheduleCreateRequest.LockdownSettings settings) {
        if (settings == null) return DEFAULT_SETTINGS;
        try {
            return objectMapper.writeValueAsString(settings);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize settings, using defaults", e);
            return DEFAULT_SETTINGS;
        }
    }

    private Teacher getCurrentTeacher() {
        User user = getCurrentUser();
        return teacherRepository.findByUser(user)
                .orElseThrow(() -> new ForbiddenException("User is not a teacher"));
    }

    private Student getCurrentStudent() {
        User user = getCurrentUser();
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ForbiddenException("User is not a student"));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User principal = (User) auth.getPrincipal();
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    @Override
    @Transactional(readOnly = true)
    public List<ExamScheduleResultResponse> getScheduleResults(Long scheduleId) {
        Teacher teacher = getCurrentTeacher();
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam schedule not found"));
        if (!schedule.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to view results of this schedule");
        }

        // Schedule-correct: only attempts belonging to this schedule (prevents duplicates)
        List<ExamAttempt> attempts = examAttemptRepository.findBySchedule_Id(scheduleId);
        boolean scoresVisible = scoreRevealPolicyService.areScoresVisible(schedule);

        // Deduplicate: one row per student (prefer latest SUBMITTED, else latest by startedAt)
        java.util.Map<String, ExamAttempt> bestByStudent = new java.util.HashMap<>();
        for (ExamAttempt attempt : attempts) {
            Student student = attempt.getStudent();
            if (student == null) continue;
            if (student.getSchoolClass() == null) continue;
            if (!student.getSchoolClass().getClassId().equals(schedule.getSchoolClass().getClassId())) continue;

            String sid = student.getStudentId();
            ExamAttempt current = bestByStudent.get(sid);
            if (current == null) {
                bestByStudent.put(sid, attempt);
                continue;
            }

            int attemptRank = rankAttempt(attempt);
            int currentRank = rankAttempt(current);
            if (attemptRank != currentRank) {
                if (attemptRank > currentRank) bestByStudent.put(sid, attempt);
                continue;
            }

            // Same rank: pick latest submittedAt, else latest startedAt
            java.time.LocalDateTime aTime = attempt.getSubmittedAt() != null ? attempt.getSubmittedAt() : attempt.getStartedAt();
            java.time.LocalDateTime cTime = current.getSubmittedAt() != null ? current.getSubmittedAt() : current.getStartedAt();
            if (aTime != null && (cTime == null || aTime.isAfter(cTime))) {
                bestByStudent.put(sid, attempt);
            }
        }

        List<ExamScheduleResultResponse> results = new java.util.ArrayList<>();
        for (ExamAttempt attempt : bestByStudent.values()) {
            Student student = attempt.getStudent();
            java.math.BigDecimal finalScore = null;
            java.math.BigDecimal finalPercentage = null;

            if (scoresVisible && attempt.getStatus() == ExamAttemptStatus.SUBMITTED) {
                Integer attemptNumber = attempt.getAttemptNumber() != null ? attempt.getAttemptNumber() : 1;
                java.util.Optional<StudentExamResult> resultOpt =
                        studentExamResultRepository.findFirstByStudentAndExamAndAttemptNumberOrderByResultIdDesc(
                                student, schedule.getExam(), attemptNumber);
                if (resultOpt.isPresent()) {
                    finalScore = resultOpt.get().getScore();
                    finalPercentage = resultOpt.get().getPercentage();
                }
            }

            results.add(ExamScheduleResultResponse.builder()
                    .attemptCode(attempt.getAttemptCode())
                    .studentId(student.getStudentId())
                    .studentName(student.getUser().getFullName())
                    .email(student.getUser().getEmail())
                    .status(attempt.getStatus().name())
                    .startedAt(attempt.getStartedAt())
                    .submittedAt(attempt.getSubmittedAt())
                    .violationCount(attempt.getViolationCount())
                    .score(finalScore)
                    .percentage(finalPercentage)
                    .build());
        }

        results.sort(java.util.Comparator.comparing(ExamScheduleResultResponse::getStudentName));
        return results;
    }

    private int rankAttempt(ExamAttempt attempt) {
        if (attempt == null || attempt.getStatus() == null) return 0;
        // Prefer SUBMITTED, then IN_PROGRESS, then EXPIRED, else lowest.
        if (attempt.getStatus() == ExamAttemptStatus.SUBMITTED) return 3;
        if (attempt.getStatus() == ExamAttemptStatus.IN_PROGRESS) return 2;
        if (attempt.getStatus() == ExamAttemptStatus.EXPIRED) return 1;
        return 0; // CANCELLED or any future status
    }
}
