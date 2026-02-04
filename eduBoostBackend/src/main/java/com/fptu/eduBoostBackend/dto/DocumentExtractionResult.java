package com.fptu.eduBoostBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentExtractionResult {
    private String content;
    private Map<String, String> metadata;
    private Integer wordCount;
    private Integer charCount;
    private Integer estimatedTokens;
    private Integer pageCount;
    private String language;
}
