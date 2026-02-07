package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ClassRepository extends JpaRepository<SchoolClass, String> {
    List<SchoolClass> findByTeacher(Teacher teacher);
    boolean existsByClassCode(String classCode);
}
