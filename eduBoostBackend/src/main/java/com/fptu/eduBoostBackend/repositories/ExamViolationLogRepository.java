package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamViolationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamViolationLogRepository extends JpaRepository<ExamViolationLog, Long> {

    List<ExamViolationLog> findByAssignmentIdOrderByTimestampDesc(Long assignmentId);

    int countByAssignmentId(Long assignmentId);
}
