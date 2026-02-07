package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.ClassResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelResponse;
import com.fptu.eduBoostBackend.dto.response.GradeLevelSimpleResponse;

import java.util.List;

public interface GradeLevelService {
    List<GradeLevelSimpleResponse> getAllGradeLevels();
    List<ClassResponse> getClassesByGradeId(Long gradeLevelId);
}
