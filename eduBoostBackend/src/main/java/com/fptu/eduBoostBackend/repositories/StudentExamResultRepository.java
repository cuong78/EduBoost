package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.StudentExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.fptu.eduBoostBackend.entities.Exam;

public interface StudentExamResultRepository extends JpaRepository<StudentExamResult, Long> {

    List<StudentExamResult> findByStudent(Student student);

    Optional<StudentExamResult> findFirstByStudentAndExamAndAttemptNumberOrderByResultIdDesc(Student student, Exam exam, Integer attemptNumber);

    Optional<StudentExamResult> findByStudent_StudentIdAndResultId(String studentId, Long resultId);
}

