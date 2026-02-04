package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankImportResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface QuestionBankService {
    List<QuestionBankResponse> getQuestions(Long lessonId, Long cognitiveLevelId, QuestionSourceType sourceType);
    QuestionBankResponse getQuestionById(Long id);
    QuestionBankResponse createQuestion(QuestionBankRequest request);
    QuestionBankResponse updateQuestion(Long id, QuestionBankRequest request);
    void deleteQuestion(Long id);
    QuestionBankImportResponse importFromExcel(MultipartFile file, Long lessonId);
    Resource downloadTemplate();
    QuestionBankStatsResponse getStats(Long subjectId, Integer gradeLevel);
    List<QuestionBankResponse> createQuestionsBatch(List<QuestionBankRequest> requests);
}
