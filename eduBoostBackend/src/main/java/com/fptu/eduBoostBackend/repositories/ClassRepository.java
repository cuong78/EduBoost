package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Class;
import com.fptu.eduBoostBackend.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ClassRepository extends JpaRepository<Class, String> {
    List<Class> findByTeacher(Teacher teacher);
    boolean existsByClassCode(String classCode);
}
