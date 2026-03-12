package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamAttempt;
import com.fptu.eduBoostBackend.entities.ExamAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamAttemptAnswerRepository extends JpaRepository<ExamAttemptAnswer, Long> {

    List<ExamAttemptAnswer> findByAttempt(ExamAttempt attempt);
}

