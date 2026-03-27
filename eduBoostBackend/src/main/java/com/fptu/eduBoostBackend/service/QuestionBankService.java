package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.QuestionBankRequest;
import com.fptu.eduBoostBackend.dto.response.QuestionBankResponse;
import com.fptu.eduBoostBackend.dto.response.QuestionBankStatsResponse;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuestionBankService {
    List<QuestionBankResponse> getQuestions(Long lessonId, Long cognitiveLevelId, QuestionSourceType sourceType);
    Page<QuestionBankResponse> getQuestionsPaged(Long lessonId, Long cognitiveLevelId, QuestionSourceType sourceType, Long chapterId, Long createdById, Pageable pageable);
    QuestionBankResponse getQuestionById(Long id);
    QuestionBankResponse createQuestion(QuestionBankRequest request);
    QuestionBankResponse updateQuestion(Long id, QuestionBankRequest request);
    void deleteQuestion(Long id);
    QuestionBankStatsResponse getStats(Long subjectId, Integer gradeLevel);
    List<QuestionBankResponse> createQuestionsBatch(List<QuestionBankRequest> requests);
}
