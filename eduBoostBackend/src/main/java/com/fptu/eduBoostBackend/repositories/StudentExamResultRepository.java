package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.StudentExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentExamResultRepository extends JpaRepository<StudentExamResult, Long> {

    // studentId is UUID String
    List<StudentExamResult> findByStudentStudentId(String studentId);

    List<StudentExamResult> findByExamId(Long examId);

    @Query("SELECT r FROM StudentExamResult r " +
           "WHERE r.student.studentId = :studentId " +
           "AND r.assignment.assignmentId = :assignmentId")
    Optional<StudentExamResult> findByStudentAndAssignment(
            @Param("studentId") String studentId,
            @Param("assignmentId") Long assignmentId);

    /** Get student String UUID from current user */
    @Query("SELECT r FROM StudentExamResult r " +
           "WHERE r.student.studentId = :studentId " +
           "AND r.resultId = :resultId")
    Optional<StudentExamResult> findByStudentStudentIdAndResultId(
            @Param("studentId") String studentId,
            @Param("resultId") Long resultId);

    /** Lookup by User's userId (for anti-cheat tab switch endpoint) */
    @Query("SELECT r FROM StudentExamResult r " +
           "WHERE r.student.user.userId = :userId " +
           "AND r.assignment.assignmentId = :assignmentId")
    Optional<StudentExamResult> findByStudentUserIdAndAssignment(
            @Param("userId") Long userId,
            @Param("assignmentId") Long assignmentId);

    @Query("SELECT COUNT(r) FROM StudentExamResult r WHERE r.assignment.assignmentId = :assignmentId")
    int countByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT r FROM StudentExamResult r " +
           "LEFT JOIN FETCH r.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH r.exam e " +
           "LEFT JOIN FETCH r.assignment a " +
           "WHERE r.assignment.assignmentId = :assignmentId " +
           "ORDER BY r.submittedAt DESC")
    List<StudentExamResult> findByAssignmentId(@Param("assignmentId") Long assignmentId);
}
