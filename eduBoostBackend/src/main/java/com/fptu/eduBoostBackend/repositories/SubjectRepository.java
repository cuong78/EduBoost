package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsBySubjectCode(String subjectCode);
    Optional<Subject> findBySubjectCode(String subjectCode);
}
