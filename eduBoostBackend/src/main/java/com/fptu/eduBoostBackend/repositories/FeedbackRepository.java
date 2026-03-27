package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Feedback;
import com.fptu.eduBoostBackend.entities.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /** All feedback by a teacher, latest first */
    List<Feedback> findByTeacher_TeacherIdOrderByCreatedAtDesc(String teacherId);

    /** All feedback ordered by date (admin) */
    List<Feedback> findAllByOrderByCreatedAtDesc();

    /** Count by status */
    long countByStatus(FeedbackStatus status);

    /** Average rating (non-null ratings only) */
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.rating IS NOT NULL")
    Double averageRating();
}
