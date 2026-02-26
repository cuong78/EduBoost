package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.GradeLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GradeLevelRepository extends JpaRepository<GradeLevel, Long> {
    Optional<GradeLevel> findByGradeName(String gradeName);
    boolean existsByGradeName(String gradeName);
}
