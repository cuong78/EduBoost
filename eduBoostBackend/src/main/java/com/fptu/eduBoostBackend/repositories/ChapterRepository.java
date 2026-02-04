package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findBySubjectAndGradeLevel(Subject subject, Integer gradeLevel);
    List<Chapter> findBySubject(Subject subject);
}
