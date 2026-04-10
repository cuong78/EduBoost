package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Chapter;
import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.repositories.projection.LessonCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByChapter(Chapter chapter);
    List<Lesson> findByChapterOrderByLessonNumberAsc(Chapter chapter);
    List<Lesson> findByChapterId(Long chapterId);
    long countByChapterId(Long chapterId);
    @Query("""
    select l.chapter.id as chapterId, count(l.id) as lessonCount
    from Lesson l
    where l.chapter.id in :chapterIds
    group by l.chapter.id
""")
    List<LessonCountProjection> countLessonsByChapterIds(List<Long> chapterIds);

}
