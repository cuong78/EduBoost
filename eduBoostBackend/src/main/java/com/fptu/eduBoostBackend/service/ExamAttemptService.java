package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.exam.AttemptAutoSaveRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptHeartbeatRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptSubmitRequest;
import com.fptu.eduBoostBackend.dto.request.exam.TeacherAttemptGradeRequest;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStateResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStartResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptReviewResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptSubmitResponse;
import com.fptu.eduBoostBackend.dto.response.exam.StudentExamAttemptHistoryResponse;

import java.util.List;

public interface ExamAttemptService {

    AttemptStartResponse startAttempt(Long examId, Long scheduleId, String schedulePassword);

    AttemptStateResponse getAttemptState(String attemptCode);

    AttemptStateResponse autoSave(String attemptCode, AttemptAutoSaveRequest request);

    AttemptSubmitResponse submit(String attemptCode, AttemptSubmitRequest request);

    void heartbeat(String attemptCode, AttemptHeartbeatRequest request);

    void reportViolation(String attemptCode, String violationType);

    AttemptReviewResponse getAttemptReview(String attemptCode);

    /** Teacher view: includes correct answers and teacher override fields. */
    AttemptReviewResponse getTeacherAttemptReview(Long scheduleId, String attemptCode);

    /** Teacher grading: persists manual points overrides and recomputes score. */
    void gradeTeacherAttempt(Long scheduleId, String attemptCode, TeacherAttemptGradeRequest request);

    List<StudentExamAttemptHistoryResponse> getStudentScheduleAttempts(Long scheduleId);
}

