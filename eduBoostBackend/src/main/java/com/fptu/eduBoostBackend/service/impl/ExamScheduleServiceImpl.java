package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.ExamScheduleCreateRequest;
import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Exam;
import com.fptu.eduBoostBackend.entities.ExamSchedule;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.exception.exceptions.ForbiddenException;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ClassRepository;
import com.fptu.eduBoostBackend.repositories.ExamRepository;
import com.fptu.eduBoostBackend.repositories.ExamScheduleRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.ExamScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    public ExamScheduleSummaryResponse createSchedule(ExamScheduleCreateRequest request) {
        Teacher teacher = getCurrentTeacher();

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        // Optional: ensure teacher owns the class
        if (!schoolClass.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ForbiddenException("You are not allowed to schedule exams for this class");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
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
                .maxAttempts(request.getMaxAttempts())
                .password(request.getPassword())
                .status("SCHEDULED")
                .build();

        ExamSchedule saved = examScheduleRepository.save(schedule);
        log.info("Created exam schedule {} for class {} and exam {}", saved.getId(),
                schoolClass.getClassName(), exam.getExamTitle());

        return mapToSummary(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExamScheduleSummaryResponse> getClassSchedules(String classId, Pageable pageable) {
        Teacher teacher = getCurrentTeacher();
        Page<ExamSchedule> page = examScheduleRepository.findByTeacherAndSchoolClass_ClassId(teacher, classId, pageable);
        return page.map(this::mapToSummary);
    }

    private ExamScheduleSummaryResponse mapToSummary(ExamSchedule schedule) {
        return ExamScheduleSummaryResponse.builder()
                .id(schedule.getId())
                .examId(schedule.getExam().getId())
                .examTitle(schedule.getExam().getExamTitle())
                .classId(schedule.getSchoolClass().getClassId())
                .className(schedule.getSchoolClass().getClassName())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .durationMinutes(schedule.getDurationMinutes())
                .status(schedule.getStatus())
                .build();
    }

    private Teacher getCurrentTeacher() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        User user = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return teacherRepository.findByUser(user)
                .orElseThrow(() -> new ForbiddenException("User is not a teacher"));
    }
}

