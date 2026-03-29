package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.*;
import com.fptu.eduBoostBackend.dto.response.*;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExamService {
    
    // CRUD operations
    Page<ExamResponse> getExams(Long subjectId, Integer gradeLevel, Long examTypeId, 
                                 ExamStatus status, Long createdById, Pageable pageable);
    
    ExamResponse getExamById(Long id);
    
    ExamResponse createExam(ExamRequest request);
    
    ExamResponse updateExam(Long id, ExamRequest request);
    
    void deleteExam(Long id);
    
    // Question management
    AutoSelectQuestionsResponse autoSelectQuestions(Long examId);
    
    AutoSelectQuestionsResponse autoSelectQuestionsWithConfig(Long examId, AutoSelectQuestionsRequest request);
    
    ExamQuestionResponse addQuestionToExam(Long examId, AddQuestionToExamRequest request);
    
    List<ExamQuestionResponse> aiGenerateQuestionsForExam(Long examId, ExamAIGenerateRequest request);
    
    ExamQuestionResponse editExamQuestion(Long examId, Long examQuestionId, EditExamQuestionRequest request);
    
    ExamQuestionResponse regenerateWrongAnswers(Long examId, Long examQuestionId);
    
    void deleteExamQuestion(Long examId, Long examQuestionId);
    
    void reorderQuestions(Long examId, ReorderQuestionsRequest request);
    
    // Status management — DRAFT / USED / PUBLISHED only
    ExamResponse changeExamStatus(Long examId, ChangeExamStatusRequest request);
    
    // Export (auto-sets status to USED if current status is DRAFT)
    byte[] exportExam(Long examId, String format);

    // Statistics
    ExamStatisticsResponse getExamStatistics(Long examId);
    
    List<ExamResponse> getMyExams();
    
    List<ExamResponse> getPublishedExams(Long subjectId, Integer gradeLevel, Long examTypeId);
    
    // Variant (shuffle) operations
    List<ExamResponse> shuffleExam(Long examId, ShuffleExamRequest request);
    
    List<ExamResponse> getExamVariants(Long examId);
    
    void deleteExamVariants(Long examId);
}
