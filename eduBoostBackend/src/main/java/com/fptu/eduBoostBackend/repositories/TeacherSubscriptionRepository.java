package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.TeacherSubscription;
import com.fptu.eduBoostBackend.entities.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherSubscriptionRepository extends JpaRepository<TeacherSubscription, Long> {

    /** Find active subscription for a teacher */
    @Query("SELECT ts FROM TeacherSubscription ts " +
           "JOIN FETCH ts.plan " +
           "WHERE ts.teacher.teacherId = :teacherId " +
           "AND ts.status = 'ACTIVE' " +
           "ORDER BY ts.createdAt DESC")
    Optional<TeacherSubscription> findActiveByTeacherId(@Param("teacherId") String teacherId);

    /** Find all subscriptions for a teacher, latest first */
    @Query("SELECT ts FROM TeacherSubscription ts " +
           "JOIN FETCH ts.plan " +
           "WHERE ts.teacher.teacherId = :teacherId " +
           "ORDER BY ts.createdAt DESC")
    List<TeacherSubscription> findAllByTeacherId(@Param("teacherId") String teacherId);

    /** Find subscriptions to check expiry (for scheduled job) */
    List<TeacherSubscription> findByStatus(SubscriptionStatus status);
}
