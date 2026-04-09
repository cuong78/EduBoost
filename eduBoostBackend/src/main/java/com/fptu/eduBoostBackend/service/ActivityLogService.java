package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.ActivityLogListResponse;
import com.fptu.eduBoostBackend.dto.response.ActivityLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
@Service
public interface ActivityLogService {
    void log(String action);
   ActivityLogListResponse getActivityLogs(String keyword, Pageable pageable);
}