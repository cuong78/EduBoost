package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.request.AIGenerateFromResourceRequest;
import com.fptu.eduBoostBackend.dto.request.AIGenerateFromUrlRequest;
import com.fptu.eduBoostBackend.dto.request.AIGenerateVariationsRequest;
import com.fptu.eduBoostBackend.dto.response.AIGenerateFromResourceResponse;
import com.fptu.eduBoostBackend.dto.response.AIGenerateFromUrlResponse;
import com.fptu.eduBoostBackend.dto.response.AIGenerateVariationsResponse;
import com.fptu.eduBoostBackend.service.AIQuestionGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "AI Question Generator", description = "APIs for AI-powered question generation")
public class AIQuestionController {

    private final AIQuestionGeneratorService aiQuestionGeneratorService;

    @PostMapping("/generate-from-resource")
    @Operation(summary = "Generate questions from resource",
            description = "Uses AI (DeepSeek) to generate exam questions from lesson resource content")
    public ResponseEntity<AIGenerateFromResourceResponse> generateFromResource(
            @Valid @RequestBody AIGenerateFromResourceRequest request) {
        
        log.info("AI generate request - resourceId: {}, lessonId: {}, numberOfQuestions: {}", 
                request.getResourceId(), request.getLessonId(), request.getNumberOfQuestions());
        
        AIGenerateFromResourceResponse response = aiQuestionGeneratorService.generateFromResource(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-variations")
    @Operation(summary = "Generate question variations",
            description = "Uses AI to generate variations of existing questions")
    public ResponseEntity<AIGenerateVariationsResponse> generateVariations(
            @Valid @RequestBody AIGenerateVariationsRequest request) {
        
        log.info("AI variations request - baseQuestionIds: {}, numberOfVariations: {}", 
                request.getBaseQuestionIds(), request.getNumberOfVariations());
        
        AIGenerateVariationsResponse response = aiQuestionGeneratorService.generateVariations(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-from-url")
    @Operation(summary = "Generate questions from URL",
            description = "Uses AI to generate questions from webpage/article content")
    public ResponseEntity<AIGenerateFromUrlResponse> generateFromUrl(
            @Valid @RequestBody AIGenerateFromUrlRequest request) {
        
        log.info("AI URL generation request - url: {}, lessonId: {}, numberOfQuestions: {}", 
                request.getUrl(), request.getLessonId(), request.getNumberOfQuestions());
        
        AIGenerateFromUrlResponse response = aiQuestionGeneratorService.generateFromUrl(request);
        return ResponseEntity.ok(response);
    }
}
