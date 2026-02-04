package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.CognitiveLevelResponse;
import com.fptu.eduBoostBackend.repositories.CognitiveLevelRepository;
import com.fptu.eduBoostBackend.service.CognitiveLevelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CognitiveLevelServiceImpl implements CognitiveLevelService {

    private final CognitiveLevelRepository cognitiveLevelRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CognitiveLevelResponse> getAllCognitiveLevels() {
        log.info("Fetching all cognitive levels");
        return cognitiveLevelRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(level -> CognitiveLevelResponse.builder()
                        .id(level.getId())
                        .level(level.getLevel())
                        .description(level.getDescription())
                        .displayOrder(level.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }
}
