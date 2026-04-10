package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.dto.response.ClassStudentCountProjection;
import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface ClassRepository extends JpaRepository<SchoolClass, String> {
    List<SchoolClass> findByTeacher(Teacher teacher);
    List<SchoolClass> findByGradeLevel(GradeLevel gradeLevel);
    boolean existsByClassCode(String classCode);
    
    @Query("SELECT COUNT(s) FROM Student s WHERE s.schoolClass.classId = :classId")
    int countStudentsByClassId(@Param("classId") String classId);
    @Query("""
    SELECT c
    FROM SchoolClass c
    LEFT JOIN FETCH c.teacher t
    LEFT JOIN FETCH t.user
    LEFT JOIN FETCH c.gradeLevel
""")
    List<SchoolClass> findAllWithDetails();
    @Query("""
    SELECT s.schoolClass.classId as classId, COUNT(s) as studentCount
    FROM Student s
    GROUP BY s.schoolClass.classId
""")
    List<ClassStudentCountProjection> countStudentsForAllClasses();
    @Query("""
    SELECT c
    FROM SchoolClass c
    LEFT JOIN FETCH c.gradeLevel
    LEFT JOIN FETCH c.teacher t
    LEFT JOIN FETCH t.user
    WHERE c.teacher = :teacher
""")
    List<SchoolClass> findByTeacherWithDetails(@Param("teacher") Teacher teacher);
    @Query("""
    SELECT s.schoolClass.classId as classId, COUNT(s) as studentCount
    FROM Student s
    WHERE s.schoolClass.teacher = :teacher
    GROUP BY s.schoolClass.classId
""")
    List<ClassStudentCountProjection> countStudentsForTeacherClasses(@Param("teacher") Teacher teacher);
}
