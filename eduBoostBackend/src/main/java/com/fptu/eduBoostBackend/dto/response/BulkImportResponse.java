package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkImportResponse {
    private int totalFiles;
    private int totalQuestions;
    private int successCount;
    private int aiClassifiedCount;
    private List<String> errors;
    private Map<String, Integer> byGrade;
}
