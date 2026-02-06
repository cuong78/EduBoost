package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamMatrixTemplateDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamMatrixTemplateDetailRepository extends JpaRepository<ExamMatrixTemplateDetail, Long> {
    
    @Query("SELECT d FROM ExamMatrixTemplateDetail d " +
           "LEFT JOIN FETCH d.cognitiveLevel " +
           "WHERE d.template.id = :templateId " +
           "ORDER BY d.cognitiveLevel.displayOrder ASC")
    List<ExamMatrixTemplateDetail> findByTemplateIdWithCognitiveLevel(@Param("templateId") Long templateId);
    
    void deleteByTemplateId(Long templateId);
    
    List<ExamMatrixTemplateDetail> findByTemplateId(Long templateId);
}
