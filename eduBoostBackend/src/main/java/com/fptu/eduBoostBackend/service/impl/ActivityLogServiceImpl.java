package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.ActivityLogListResponse;
import com.fptu.eduBoostBackend.dto.response.ActivityLogResponse;
import com.fptu.eduBoostBackend.dto.response.PaginationResponse;
import com.fptu.eduBoostBackend.entities.ActivityLog;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.repositories.ActivityLogRepository;
import com.fptu.eduBoostBackend.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void log(String action) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return;
            }

            if (!(authentication.getPrincipal() instanceof User user)) {
                return;
            }

            if (user.hasRole("ADMIN")) {
                return;
            }

            ActivityLog activityLog = ActivityLog.builder()
                    .userId(user.getUserId())
                    .userName(user.getFullName())
                    .action(action)
                    .build();

            activityLogRepository.save(activityLog);

        } catch (Exception e) {
            log.error("Failed to save activity log: {}", e.getMessage(), e);
        }
    }
    @Override
    public ActivityLogListResponse getActivityLogs(String keyword, Pageable pageable) {

        Page<ActivityLogResponse> pageResult = activityLogRepository.searchLogs(
                keyword,
                pageable
        ).map(this::mapToResponse);

        return ActivityLogListResponse.builder()
                .success(true)
                .data(pageResult.getContent())
                .pagination(PaginationResponse.builder()
                        .total(pageResult.getTotalElements())
                        .page(pageable.getPageNumber() + 1) // +1 cho page bắt đầu từ 1
                        .limit(pageable.getPageSize())
                        .build())
                .build();
    }

    private ActivityLogResponse mapToResponse(ActivityLog activityLog) {
        return ActivityLogResponse.builder()
                .id(activityLog.getId())
                .userId(activityLog.getUserId())
                .userName(activityLog.getUserName())
                .action(activityLog.getAction())
                .createdAt(activityLog.getCreatedAt())
                .build();
    }
}
