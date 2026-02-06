package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Exam;
import com.fptu.eduBoostBackend.entities.enums.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    @Query("SELECT e FROM Exam e " +
           "LEFT JOIN FETCH e.examType " +
           "LEFT JOIN FETCH e.subject " +
           "LEFT JOIN FETCH e.chapter " +
           "LEFT JOIN FETCH e.createdBy " +
           "WHERE (:subjectId IS NULL OR e.subject.id = :subjectId) " +
           "AND (:gradeLevel IS NULL OR e.gradeLevel = :gradeLevel) " +
           "AND (:examTypeId IS NULL OR e.examType.id = :examTypeId) " +
           "AND (:status IS NULL OR e.status = :status) " +
           "AND (:createdById IS NULL OR e.createdBy.id = :createdById) " +
           "ORDER BY e.createdAt DESC")
    Page<Exam> findByFilters(
            @Param("subjectId") Long subjectId,
            @Param("gradeLevel") Integer gradeLevel,
            @Param("examTypeId") Long examTypeId,
            @Param("status") ExamStatus status,
            @Param("createdById") Long createdById,
            Pageable pageable);
    
    @Query("SELECT e FROM Exam e " +
           "LEFT JOIN FETCH e.examType " +
           "LEFT JOIN FETCH e.subject " +
           "LEFT JOIN FETCH e.chapter " +
           "LEFT JOIN FETCH e.matrixTemplate " +
           "LEFT JOIN FETCH e.createdBy " +
           "LEFT JOIN FETCH e.approvedBy " +
           "WHERE e.id = :id")
    Optional<Exam> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT e FROM Exam e " +
           "LEFT JOIN FETCH e.examType " +
           "LEFT JOIN FETCH e.subject " +
           "WHERE e.createdBy.id = :userId " +
           "ORDER BY e.createdAt DESC")
    List<Exam> findByCreatedById(@Param("userId") Long userId);
    
    boolean existsByExamCode(String examCode);
    
    @Query("SELECT COUNT(e) FROM Exam e WHERE e.createdBy.id = :userId")
    long countByCreatedById(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(e) FROM Exam e WHERE e.subject.id = :subjectId AND e.gradeLevel = :gradeLevel")
    long countBySubjectAndGrade(@Param("subjectId") Long subjectId, @Param("gradeLevel") Integer gradeLevel);
}
