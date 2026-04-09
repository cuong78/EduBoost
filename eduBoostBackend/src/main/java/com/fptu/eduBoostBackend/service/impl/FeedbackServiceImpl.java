package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.request.CreateFeedbackRequest;
import com.fptu.eduBoostBackend.dto.request.RespondFeedbackRequest;
import com.fptu.eduBoostBackend.dto.response.FeedbackResponse;
import com.fptu.eduBoostBackend.dto.response.FeedbackStatsResponse;
import com.fptu.eduBoostBackend.entities.Feedback;
import com.fptu.eduBoostBackend.entities.Teacher;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.FeedbackStatus;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.FeedbackRepository;
import com.fptu.eduBoostBackend.repositories.TeacherRepository;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import com.fptu.eduBoostBackend.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TeacherRepository teacherRepository;
    private final ActivityLogService activityLogService;
    // ─── Helpers ───

    private Teacher getCurrentTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        return teacherRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
    }

    private FeedbackResponse mapToResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .category(f.getCategory())
                .title(f.getTitle())
                .content(f.getContent())
                .rating(f.getRating())
                .status(f.getStatus())
                .adminResponse(f.getAdminResponse())
                .respondedAt(f.getRespondedAt())
                .createdAt(f.getCreatedAt())
                .teacherName(f.getTeacher().getUser().getFullName())
                .teacherEmail(f.getTeacher().getUser().getEmail())
                .build();
    }

    // ─── Teacher ───

    @Override
    @Transactional
    public FeedbackResponse createFeedback(CreateFeedbackRequest request) {
        Teacher teacher = getCurrentTeacher();

        Feedback feedback = Feedback.builder()
                .teacher(teacher)
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .rating(request.getRating())
                .status(FeedbackStatus.SUBMITTED)
                .build();

        feedback = feedbackRepository.save(feedback);
        activityLogService.log("Tạo feedback");
        log.info("Teacher {} submitted feedback: {}", teacher.getTeacherId(), feedback.getTitle());
        return mapToResponse(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getMyFeedbacks() {
        Teacher teacher = getCurrentTeacher();
        return feedbackRepository.findByTeacher_TeacherIdOrderByCreatedAtDesc(teacher.getTeacherId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponse getMyFeedbackById(Long id) {
        Teacher teacher = getCurrentTeacher();
        Feedback f = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        if (!f.getTeacher().getTeacherId().equals(teacher.getTeacherId())) {
            throw new ResourceNotFoundException("Feedback not found");
        }
        return mapToResponse(f);
    }

    // ─── Admin ───

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackStatsResponse getStats() {
        return FeedbackStatsResponse.builder()
                .totalFeedback(feedbackRepository.count())
                .submittedCount(feedbackRepository.countByStatus(FeedbackStatus.SUBMITTED))
                .inProgressCount(feedbackRepository.countByStatus(FeedbackStatus.IN_PROGRESS))
                .respondedCount(feedbackRepository.countByStatus(FeedbackStatus.RESPONDED))
                .closedCount(feedbackRepository.countByStatus(FeedbackStatus.CLOSED))
                .averageRating(feedbackRepository.averageRating())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackResponse getFeedbackById(Long id) {
        Feedback f = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        return mapToResponse(f);
    }

    @Override
    @Transactional
    public FeedbackResponse respondToFeedback(Long id, RespondFeedbackRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User adminUser = (User) auth.getPrincipal();

        Feedback f = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        if (request.getAdminResponse() != null && !request.getAdminResponse().isBlank()) {
            f.setAdminResponse(request.getAdminResponse());
        }
        f.setStatus(request.getStatus());
        f.setRespondedByUserId(adminUser.getUserId());
        f.setRespondedAt(LocalDateTime.now());

        f = feedbackRepository.save(f);
        log.info("Admin {} responded to feedback #{}: status={}", adminUser.getUserId(), id, request.getStatus());
        return mapToResponse(f);
    }
}
