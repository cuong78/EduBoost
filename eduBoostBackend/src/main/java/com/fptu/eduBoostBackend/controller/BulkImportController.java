package com.fptu.eduBoostBackend.controller;

import com.fptu.eduBoostBackend.dto.response.BulkImportResponse;
import com.fptu.eduBoostBackend.service.BulkImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "api")
@Tag(name = "Bulk Import", description = "APIs for bulk importing questions from ZIP files")
public class BulkImportController {

    private final BulkImportService bulkImportService;

    @PostMapping(value = "/question-bank/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import questions from ZIP",
            description = "Imports questions from a ZIP file with folder structure: Lop X/MonHoc/Chuong N/Bai M.[docx|xlsx]. "
                    + "Supports Word (.docx) with math formulas (LaTeX) and images (MinIO), and Excel (.xlsx). "
                    + "Optionally uses AI to classify cognitive levels.")
    public ResponseEntity<BulkImportResponse> bulkImport(
            @Parameter(description = "ZIP file containing Excel files in folder structure", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Use AI to auto-classify cognitive levels (default: true)")
            @RequestParam(value = "useAiClassification", defaultValue = "true") boolean useAiClassification) {

        log.info("Bulk import request: file={}, useAi={}", file.getOriginalFilename(), useAiClassification);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".zip")) {
            return ResponseEntity.badRequest().body(BulkImportResponse.builder()
                    .errors(java.util.List.of("File phải là định dạng ZIP (.zip)"))
                    .build());
        }

        BulkImportResponse response = bulkImportService.bulkImportFromZip(file, useAiClassification);
        return ResponseEntity.ok(response);
    }
}
