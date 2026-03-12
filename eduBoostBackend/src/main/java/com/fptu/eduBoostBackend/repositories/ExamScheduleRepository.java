package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamSchedule;
import com.fptu.eduBoostBackend.entities.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    Page<ExamSchedule> findByTeacherAndSchoolClass_ClassId(Teacher teacher, String classId, Pageable pageable);
}

