package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.CognitiveLevelResponse;
import com.fptu.eduBoostBackend.service.CognitiveLevelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Cognitive Level Management", description = "APIs for managing cognitive levels")
public class CognitiveLevelController {

    private final CognitiveLevelService cognitiveLevelService;

    @GetMapping("/cognitive-levels")
    @Operation(summary = "Get all cognitive levels",
            description = "Returns a list of all cognitive levels ordered by display order")
    public ResponseEntity<List<CognitiveLevelResponse>> getAllCognitiveLevels() {
        log.info("Fetching all cognitive levels");
        List<CognitiveLevelResponse> levels = cognitiveLevelService.getAllCognitiveLevels();
        return ResponseEntity.ok(levels);
    }
}
