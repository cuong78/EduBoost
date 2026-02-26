package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.CreateGradeLevelRequest;
import com.fptu.eduBoostBackend.dto.request.UpdateGradeLevelRequest;
import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelDetailResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelSimpleResponse;

import java.util.List;

public interface GradeLevelService {
    List<GradeLevelDetailResponse> getAllGradeLevelsWithStats();
    List<GradeLevelSimpleResponse> getAllGradeLevels();
    GradeLevelSimpleResponse getGradeLevelById(Long gradeLevelId);
    GradeLevelDetailResponse getGradeLevelDetailById(Long gradeLevelId);
    List<ClassResponse> getClassesByGradeId(Long gradeLevelId);
    GradeLevelSimpleResponse createGradeLevel(CreateGradeLevelRequest request);
    GradeLevelSimpleResponse updateGradeLevel(Long gradeLevelId, UpdateGradeLevelRequest request);
    void deleteGradeLevel(Long gradeLevelId);
}
