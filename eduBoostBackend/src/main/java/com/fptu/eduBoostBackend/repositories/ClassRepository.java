package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.GradeLevel;
import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<SchoolClass, String> {
    List<SchoolClass> findByTeacher(Teacher teacher);
    List<SchoolClass> findByGradeLevel(GradeLevel gradeLevel);
    boolean existsByClassCode(String classCode);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.schoolClass.classId = :classId")
    int countStudentsByClassId(@Param("classId") String classId);

    /** Find all classes where teacher's user id matches */
    @Query("SELECT c FROM SchoolClass c WHERE c.teacher.user.userId = :userId")
    List<SchoolClass> findByTeacherUserId(@Param("userId") Long userId);

    /** Find classes by gradeLevel ID and teacher userId */
    @Query("SELECT c FROM SchoolClass c WHERE c.gradeLevel.gradeLevelId = :gradeLevelId AND c.teacher.user.userId = :userId")
    List<SchoolClass> findByGradeLevelAndTeacherUserId(@Param("gradeLevelId") Long gradeLevelId, @Param("userId") Long userId);
}
