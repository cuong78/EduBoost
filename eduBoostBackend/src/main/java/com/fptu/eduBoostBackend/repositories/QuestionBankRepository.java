package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.QuestionBank;
import com.fptu.eduBoostBackend.entities.enums.QuestionSourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    
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
