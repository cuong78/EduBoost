package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Long> {
    List<LessonResource> findByLesson(Lesson lesson);
}
