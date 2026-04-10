package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.SchoolClass;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findBySchoolClass(SchoolClass schoolClass);
    boolean existsByStudentCode(String studentCode);
    List<Student> findByUser(User user);
    List<Student> findByUserUserId(Long userId);
    Optional<Student> findFirstByUser(User user);
}
