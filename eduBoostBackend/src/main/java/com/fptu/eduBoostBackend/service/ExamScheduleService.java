package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.ExamScheduleCreateRequest;
import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExamScheduleService {

    ExamScheduleSummaryResponse createSchedule(ExamScheduleCreateRequest request);

    Page<ExamScheduleSummaryResponse> getClassSchedules(String classId, Pageable pageable);
}

