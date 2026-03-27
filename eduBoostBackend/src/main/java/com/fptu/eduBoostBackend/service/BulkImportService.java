package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.BulkImportResponse;
import org.springframework.web.multipart.MultipartFile;

public interface BulkImportService {
    BulkImportResponse bulkImportFromZip(MultipartFile zipFile, boolean useAiClassification);
}
