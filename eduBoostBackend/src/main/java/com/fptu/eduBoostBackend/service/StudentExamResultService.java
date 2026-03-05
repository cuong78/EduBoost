package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.StudentExamResultDetailResponse;
import com.fptu.eduBoostBackend.dto.response.StudentExamResultSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentExamResultService {

    Page<StudentExamResultSummaryResponse> getStudentResults(String studentId,
                                                             Long subjectId,
                                                             Integer semester,
                                                             String schoolYear,
                                                             Pageable pageable);

    StudentExamResultDetailResponse getStudentResultDetail(String studentId, Long resultId);
}

