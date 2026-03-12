package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.exam.AttemptAutoSaveRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptHeartbeatRequest;
import com.fptu.eduBoostBackend.dto.request.exam.AttemptSubmitRequest;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStateResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptStartResponse;
import com.fptu.eduBoostBackend.dto.response.exam.AttemptSubmitResponse;

public interface ExamAttemptService {

    AttemptStartResponse startAttempt(Long examId, Long scheduleId);

    AttemptStateResponse getAttemptState(String attemptCode);

    AttemptStateResponse autoSave(String attemptCode, AttemptAutoSaveRequest request);

    AttemptSubmitResponse submit(String attemptCode, AttemptSubmitRequest request);

    void heartbeat(String attemptCode, AttemptHeartbeatRequest request);
}

