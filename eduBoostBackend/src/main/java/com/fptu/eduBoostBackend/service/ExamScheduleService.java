package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.ExamScheduleCreateRequest;
import com.fptu.eduBoostBackend.dto.request.ExamScheduleUpdateRequest;
import com.fptu.eduBoostBackend.dto.response.ExamScheduleSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExamScheduleService {

    ExamScheduleSummaryResponse createSchedule(ExamScheduleCreateRequest request);

    Page<ExamScheduleSummaryResponse> getClassSchedules(String classId, Pageable pageable);

    ExamScheduleSummaryResponse getScheduleDetail(Long scheduleId);

    void cancelSchedule(Long scheduleId);

    /** Mark schedule results as visible to students (AFTER_ANNOUNCE mode). */
    void announceResults(Long scheduleId);

    ExamScheduleSummaryResponse updateSchedule(Long scheduleId, ExamScheduleUpdateRequest request);

    List<ExamScheduleSummaryResponse> getStudentUpcomingExams();

    List<com.fptu.eduBoostBackend.dto.response.exam.ExamScheduleResultResponse> getScheduleResults(Long scheduleId);
}
