package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Lesson;
import com.fptu.eduBoostBackend.entities.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Long> {
    List<LessonResource> findByLesson(Lesson lesson);
    List<LessonResource> findByLessonId(Long lessonId);

    @Query("""
        SELECT l.id AS lessonId, l.lessonName AS lessonName, l.lessonNumber AS lessonNumber,
               c.id AS chapterId, c.chapterNumber AS chapterNumber, c.chapterName AS chapterName,
               s.id AS subjectId, s.subjectName AS subjectName, c.gradeLevel AS gradeLevel
        FROM Lesson l
        JOIN l.chapter c
        JOIN c.subject s
        WHERE NOT EXISTS (
            SELECT 1 FROM LessonResource lr WHERE lr.lesson.id = l.id
        )
        ORDER BY c.gradeLevel, s.subjectName, c.chapterNumber, l.lessonNumber
    """)
    List<Object[]> findLessonsWithoutResources();
}
