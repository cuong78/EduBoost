package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.dto.request.MatrixTemplateRequest;
import com.fptu.eduBoostBackend.dto.response.MatrixTemplateResponse;

import java.util.List;

public interface MatrixTemplateService {
    
    List<MatrixTemplateResponse> getMatrixTemplates(Long examTypeId, Long subjectId, Integer gradeLevel);
    
    MatrixTemplateResponse getMatrixTemplateById(Long id);
    
    MatrixTemplateResponse createMatrixTemplate(MatrixTemplateRequest request);
    
    MatrixTemplateResponse updateMatrixTemplate(Long id, MatrixTemplateRequest request);
    
    void deleteMatrixTemplate(Long id);
}
