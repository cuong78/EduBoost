package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.AIGenerateFromResourceRequest;
import com.fptu.eduBoostBackend.dto.request.AIGenerateFromUrlRequest;
import com.fptu.eduBoostBackend.dto.request.AIGenerateVariationsRequest;
import com.fptu.eduBoostBackend.dto.response.AIGenerateFromResourceResponse;
import com.fptu.eduBoostBackend.dto.response.AIGenerateFromUrlResponse;
import com.fptu.eduBoostBackend.dto.response.AIGenerateVariationsResponse;

public interface AIQuestionGeneratorService {
    
    /**
     * Generate questions from a lesson resource using AI
     * @param request The generation request containing resourceId, lessonId, and configuration
     * @return Generated questions with metadata
     */
    AIGenerateFromResourceResponse generateFromResource(AIGenerateFromResourceRequest request);
    
    /**
     * Generate variations of existing questions using AI
     * @param request The request containing base question IDs and number of variations
     * @return Variations for each base question with metadata
     */
    AIGenerateVariationsResponse generateVariations(AIGenerateVariationsRequest request);
    
    /**
     * Generate questions from a URL (article, webpage) using AI
     * @param request The request containing URL, lessonId, and configuration
     * @return Generated questions with metadata
     */
    AIGenerateFromUrlResponse generateFromUrl(AIGenerateFromUrlRequest request);
}
