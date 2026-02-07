package com.fptu.eduBoostBackend.repositories;

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
}
