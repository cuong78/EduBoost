package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.SubjectRequest;
import com.fptu.eduBoostBackend.dto.response.SubjectResponse;

import java.util.List;

public interface SubjectService {
    List<SubjectResponse> getAllSubjects();
    SubjectResponse getSubjectById(Long id);
    SubjectResponse createSubject(SubjectRequest request);
    SubjectResponse updateSubject(Long id, SubjectRequest request);
    void deleteSubject(Long id);
}
