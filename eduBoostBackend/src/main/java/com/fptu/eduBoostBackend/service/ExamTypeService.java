package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.ExamTypeResponse;

import java.util.List;

public interface ExamTypeService {
    List<ExamTypeResponse> getAllExamTypes();
    ExamTypeResponse getExamTypeById(Long id);
}
