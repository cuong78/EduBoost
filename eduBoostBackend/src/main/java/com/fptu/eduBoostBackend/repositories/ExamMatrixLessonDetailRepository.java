package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamMatrixLessonDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamMatrixLessonDetailRepository extends JpaRepository<ExamMatrixLessonDetail, Long> {

    @Query("SELECT d FROM ExamMatrixLessonDetail d " +
           "LEFT JOIN FETCH d.lesson " +
           "LEFT JOIN FETCH d.cognitiveLevel " +
           "WHERE d.template.id = :templateId " +
           "ORDER BY d.lesson.lessonNumber ASC, d.cognitiveLevel.displayOrder ASC")
    List<ExamMatrixLessonDetail> findByTemplateIdWithDetails(@Param("templateId") Long templateId);

    void deleteByTemplateId(Long templateId);

    List<ExamMatrixLessonDetail> findByTemplateId(Long templateId);
}
