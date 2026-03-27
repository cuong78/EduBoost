package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service for importing questions directly from Word (.docx) files.
 * Parses OMML math formulas to LaTeX, extracts images to MinIO.
 */
public interface WordImportService {

    /**
     * Import questions from a Word (.docx) file.
     *
     * @param file               The .docx file to import
     * @param lessonId           The lesson to associate questions with
     * @param useAiClassification Whether to use AI to classify cognitive levels
     * @return List of created QuestionBankResponse
     */
    List<QuestionBankResponse> importFromWord(MultipartFile file, Long lessonId, boolean useAiClassification);
}
