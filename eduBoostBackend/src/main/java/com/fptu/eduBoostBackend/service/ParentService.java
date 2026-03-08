package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.LinkStudentRequest;
import com.fptu.eduBoostBackend.dto.request.ValidateInvitationRequest;
import com.fptu.eduBoostBackend.dto.response.LinkStudentResponse;
import com.fptu.eduBoostBackend.dto.response.ParentStudentDetailResponse;
import com.fptu.eduBoostBackend.dto.response.StudentExamResultDetailResponse;
import com.fptu.eduBoostBackend.dto.response.StudentExamResultSummaryResponse;
import com.fptu.eduBoostBackend.dto.response.ValidateInvitationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ParentService {
    ValidateInvitationResponse validateInvitation(ValidateInvitationRequest request);
    LinkStudentResponse linkStudent(LinkStudentRequest request);
    List<ParentStudentDetailResponse> getMyStudents();
    ParentStudentDetailResponse getStudentDetail(String studentId);
    void unlinkStudent(String studentId);
    Page<StudentExamResultSummaryResponse> getStudentScores(String studentId,
                                                           Long subjectId,
                                                           Integer semester,
                                                           String schoolYear,
                                                           Pageable pageable);

    StudentExamResultDetailResponse getStudentScoreDetail(String studentId, Long resultId);
}
