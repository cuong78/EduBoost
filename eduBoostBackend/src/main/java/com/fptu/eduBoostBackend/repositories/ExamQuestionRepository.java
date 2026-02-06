package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamQuestion;
import com.fptu.eduBoostBackend.entities.enums.ExamQuestionSourceFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
    
    @Query("SELECT eq FROM ExamQuestion eq " +
           "LEFT JOIN FETCH eq.question q " +
           "LEFT JOIN FETCH q.lesson " +
           "LEFT JOIN FETCH q.cognitiveLevel " +
           "WHERE eq.exam.id = :examId " +
           "ORDER BY eq.orderNumber ASC")
    List<ExamQuestion> findByExamIdWithDetailsOrdered(@Param("examId") Long examId);
    
    @Query("SELECT eq FROM ExamQuestion eq WHERE eq.exam.id = :examId ORDER BY eq.orderNumber ASC")
    List<ExamQuestion> findByExamIdOrdered(@Param("examId") Long examId);
    
    @Query("SELECT eq FROM ExamQuestion eq " +
           "LEFT JOIN FETCH eq.question " +
           "WHERE eq.id = :id")
    Optional<ExamQuestion> findByIdWithQuestion(@Param("id") Long id);
    
    @Query("SELECT MAX(eq.orderNumber) FROM ExamQuestion eq WHERE eq.exam.id = :examId")
    Integer findMaxOrderNumber(@Param("examId") Long examId);
    
    @Query("SELECT COUNT(eq) FROM ExamQuestion eq WHERE eq.exam.id = :examId")
    int countByExamId(@Param("examId") Long examId);
    
    @Query("SELECT COUNT(eq) FROM ExamQuestion eq WHERE eq.exam.id = :examId AND eq.sourceFlag = :sourceFlag")
    int countByExamIdAndSourceFlag(@Param("examId") Long examId, @Param("sourceFlag") ExamQuestionSourceFlag sourceFlag);
    
    void deleteByExamId(Long examId);
    
    @Modifying
    @Query("UPDATE ExamQuestion eq SET eq.orderNumber = :newOrder WHERE eq.id = :id")
    void updateOrderNumber(@Param("id") Long id, @Param("newOrder") Integer newOrder);
    
    @Query("SELECT CASE WHEN COUNT(eq) > 0 THEN true ELSE false END FROM ExamQuestion eq WHERE eq.exam.id = :examId AND eq.question.id = :questionId")
    boolean existsByExamIdAndQuestionId(@Param("examId") Long examId, @Param("questionId") Long questionId);
}
