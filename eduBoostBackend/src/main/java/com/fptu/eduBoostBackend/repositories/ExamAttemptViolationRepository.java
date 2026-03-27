package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamAttempt;
import com.fptu.eduBoostBackend.entities.ExamAttemptViolation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamAttemptViolationRepository extends JpaRepository<ExamAttemptViolation, Long> {
    List<ExamAttemptViolation> findByAttemptOrderByOccurredAtDesc(ExamAttempt attempt);
}

