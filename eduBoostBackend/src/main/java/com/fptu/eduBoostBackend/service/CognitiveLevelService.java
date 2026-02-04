package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.CognitiveLevelResponse;

import java.util.List;

public interface CognitiveLevelService {
    List<CognitiveLevelResponse> getAllCognitiveLevels();
}
