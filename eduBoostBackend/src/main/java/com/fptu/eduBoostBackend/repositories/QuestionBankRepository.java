package com.fptu.eduBoostBackend.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fptu.eduBoostBackend.entities.QuestionBank;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {

    @Query(value = "SELECT q FROM QuestionBank q " +
           "LEFT JOIN FETCH q.lesson l " +
           "LEFT JOIN FETCH q.cognitiveLevel " +
           "LEFT JOIN FETCH q.createdBy " +
           "WHERE (:lessonId IS NULL OR l.id = :lessonId) " +
           "AND (:cognitiveLevelId IS NULL OR q.cognitiveLevel.id = :cognitiveLevelId) " +
           "AND (:sourceType IS NULL OR q.sourceType = :sourceType) " +
           "AND (:chapterId IS NULL OR l.chapter.id = :chapterId) " +
           "AND (:createdById IS NULL OR q.createdBy.userId = :createdById)",
           countQuery = "SELECT COUNT(q) FROM QuestionBank q " +
           "LEFT JOIN q.lesson l " +
           "WHERE (:lessonId IS NULL OR l.id = :lessonId) " +
           "AND (:cognitiveLevelId IS NULL OR q.cognitiveLevel.id = :cognitiveLevelId) " +
           "AND (:sourceType IS NULL OR q.sourceType = :sourceType) " +
           "AND (:chapterId IS NULL OR l.chapter.id = :chapterId) " +
           "AND (:createdById IS NULL OR q.createdBy.userId = :createdById)")
    Page<QuestionBank> findWithFiltersPaged(
            @Param("lessonId") Long lessonId,
            @Param("cognitiveLevelId") Long cognitiveLevelId,
            @Param("sourceType") QuestionSourceType sourceType,
            @Param("chapterId") Long chapterId,
            @Param("createdById") Long createdById,
            Pageable pageable);
    
    List<QuestionBank> findByLessonId(Long lessonId);
    
    @Query("SELECT q FROM QuestionBank q WHERE " +
           "(:lessonId IS NULL OR q.lesson.id = :lessonId) AND " +
           "(:cognitiveLevelId IS NULL OR q.cognitiveLevel.id = :cognitiveLevelId) AND " +
           "(:sourceType IS NULL OR q.sourceType = :sourceType)")
    List<QuestionBank> findWithFilters(
            @Param("lessonId") Long lessonId,
            @Param("cognitiveLevelId") Long cognitiveLevelId,
            @Param("sourceType") QuestionSourceType sourceType
    );
    
    long countByLessonId(Long lessonId);
    
    @Query("SELECT COUNT(q) FROM QuestionBank q WHERE q.lesson.chapter.subject.id = :subjectId")
    long countBySubjectId(@Param("subjectId") Long subjectId);
    
    @Query("SELECT COUNT(q) FROM QuestionBank q WHERE q.sourceType = 'AI_GENERATED'")
    long countAiGenerated();
    
    @Query("SELECT COUNT(q) FROM QuestionBank q WHERE q.sourceType = 'MANUAL'")
    long countManual();
    
    @Query("SELECT COUNT(q) FROM QuestionBank q WHERE q.sourceType = 'IMPORTED'")
    long countImported();
    
    @Query("SELECT q FROM QuestionBank q " +
           "LEFT JOIN FETCH q.lesson l " +
           "LEFT JOIN FETCH q.cognitiveLevel " +
           "WHERE l.chapter.id = :chapterId " +
           "ORDER BY l.lessonNumber ASC, q.cognitiveLevel.displayOrder ASC")
    List<QuestionBank> findByLessonChapterIdOrdered(@Param("chapterId") Long chapterId);
    
    @Query("SELECT q FROM QuestionBank q " +
           "WHERE q.lesson.id = :lessonId " +
           "AND q.cognitiveLevel.id = :cognitiveLevelId")
    List<QuestionBank> findByLessonIdAndCognitiveLevelId(
            @Param("lessonId") Long lessonId,
            @Param("cognitiveLevelId") Long cognitiveLevelId);
}
