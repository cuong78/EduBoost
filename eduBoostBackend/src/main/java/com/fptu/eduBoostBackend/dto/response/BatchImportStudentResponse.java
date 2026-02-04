package com.fptu.eduBoostBackend.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchImportStudentResponse {
    private int totalRows;
    private int successfulImports;
    private int failedImports;
    private List<ImportError> errors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportError {
        private int rowNumber;
        private String email; // Student email from the row
        private String errorMessage;
        private String field; // Which field caused the error (if applicable)
    }
}