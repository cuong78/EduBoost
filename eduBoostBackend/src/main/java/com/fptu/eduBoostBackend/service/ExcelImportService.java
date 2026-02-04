package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ExcelImportService {
    QuestionBankImportResponse parseExcelFile(MultipartFile file, Long lessonId);
}
