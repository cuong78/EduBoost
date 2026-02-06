package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByChapter(Chapter chapter);
    List<Lesson> findByChapterOrderByLessonNumberAsc(Chapter chapter);
    List<Lesson> findByChapterId(Long chapterId);
}
