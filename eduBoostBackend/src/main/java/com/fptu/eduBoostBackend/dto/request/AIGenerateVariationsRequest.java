package com.fptu.eduBoostBackend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AIGenerateVariationsRequest {
    
    @NotEmpty(message = "Base question IDs are required")
    private List<Long> baseQuestionIds;
    
    @NotNull(message = "Number of variations is required")
    @Min(value = 1, message = "Minimum 1 variation")
    @Max(value = 20, message = "Maximum 20 variations")
    private Integer numberOfVariations;
    
    /**
     * AI Provider: DEEPSEEK (default)
     */
    private String aiProvider = "DEEPSEEK";
}
