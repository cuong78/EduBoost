package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAssignmentRepository extends JpaRepository<ExamAssignment, Long> {

    /** Teacher: all assignments created by this teacher */
    @Query("SELECT a FROM ExamAssignment a " +
           "LEFT JOIN FETCH a.exam e " +
           "LEFT JOIN FETCH a.schoolClass c " +
           "WHERE a.createdBy.userId = :teacherId " +
           "ORDER BY a.createdAt DESC")
    List<ExamAssignment> findByTeacherId(@Param("teacherId") Long teacherId);

    /** Student: assignments for this student's class that are active or upcoming */
    @Query("SELECT a FROM ExamAssignment a " +
           "LEFT JOIN FETCH a.exam e " +
           "LEFT JOIN FETCH a.schoolClass c " +
           "JOIN Student s ON s.schoolClass.classId = c.classId " +
           "WHERE s.studentId = :studentId " +
           "AND a.status IN ('SCHEDULED','ACTIVE') " +
           "ORDER BY a.startTime ASC")
    List<ExamAssignment> findActiveForStudent(@Param("studentId") Long studentId);

    /** Student: all assignments (including ENDED) for history */
    @Query("SELECT a FROM ExamAssignment a " +
           "LEFT JOIN FETCH a.exam e " +
           "LEFT JOIN FETCH a.schoolClass c " +
           "JOIN Student s ON s.schoolClass.classId = c.classId " +
           "WHERE s.studentId = :studentId " +
           "ORDER BY a.startTime DESC")
    List<ExamAssignment> findAllForStudent(@Param("studentId") Long studentId);

    /** Validate access code for a specific assignment */
    Optional<ExamAssignment> findByAssignmentIdAndAccessCode(Long assignmentId, String accessCode);

    /** Assignments that should be auto-activated (startTime passed, still SCHEDULED) */
    @Query("SELECT a FROM ExamAssignment a WHERE a.status = 'SCHEDULED' AND a.startTime <= :now")
    List<ExamAssignment> findToActivate(@Param("now") LocalDateTime now);

    /** Assignments that should be auto-ended (endTime passed, still ACTIVE) */
    @Query("SELECT a FROM ExamAssignment a WHERE a.status = 'ACTIVE' AND a.endTime <= :now")
    List<ExamAssignment> findToEnd(@Param("now") LocalDateTime now);

    /** Get classes teaching by a teacher with a specific gradeLevel */
    @Query("SELECT DISTINCT a.schoolClass FROM ExamAssignment a " +
           "WHERE a.createdBy.userId = :teacherId")
    List<com.fptu.eduBoostBackend.entities.SchoolClass> findClassesByTeacher(@Param("teacherId") Long teacherId);
}
