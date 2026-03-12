package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamAttempt;
import com.fptu.eduBoostBackend.entities.ExamAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    Optional<ExamAttempt> findByAttemptCode(String attemptCode);

    List<ExamAttempt> findByStudent_StudentIdAndExam_IdAndStatus(String studentId, Long examId, ExamAttemptStatus status);
}

