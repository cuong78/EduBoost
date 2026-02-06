package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamMatrixTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamMatrixTemplateRepository extends JpaRepository<ExamMatrixTemplate, Long> {
    
    @Query("SELECT t FROM ExamMatrixTemplate t " +
           "LEFT JOIN FETCH t.examType " +
           "LEFT JOIN FETCH t.subject " +
           "WHERE (:examTypeId IS NULL OR t.examType.id = :examTypeId) " +
           "AND (:subjectId IS NULL OR t.subject.id = :subjectId) " +
           "AND (:gradeLevel IS NULL OR t.gradeLevel = :gradeLevel) " +
           "ORDER BY t.createdAt DESC")
    List<ExamMatrixTemplate> findByFilters(
            @Param("examTypeId") Long examTypeId,
            @Param("subjectId") Long subjectId,
            @Param("gradeLevel") Integer gradeLevel);
    
    @Query("SELECT t FROM ExamMatrixTemplate t " +
           "LEFT JOIN FETCH t.examType " +
           "LEFT JOIN FETCH t.subject " +
           "LEFT JOIN FETCH t.createdBy " +
           "WHERE t.id = :id")
    ExamMatrixTemplate findByIdWithDetails(@Param("id") Long id);
    
    List<ExamMatrixTemplate> findBySubjectIdAndGradeLevel(Long subjectId, Integer gradeLevel);
    
    boolean existsByTemplateNameAndSubjectIdAndGradeLevel(String templateName, Long subjectId, Integer gradeLevel);
}
