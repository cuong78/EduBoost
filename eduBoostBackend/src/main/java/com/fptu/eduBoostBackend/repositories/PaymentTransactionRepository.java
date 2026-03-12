package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.PaymentTransaction;
import com.fptu.eduBoostBackend.entities.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrderId(String orderId);

    @Query("SELECT pt FROM PaymentTransaction pt " +
           "JOIN FETCH pt.plan " +
           "WHERE pt.teacher.teacherId = :teacherId " +
           "ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findByTeacherIdOrderByCreatedAtDesc(@Param("teacherId") String teacherId);

    @Query("SELECT pt FROM PaymentTransaction pt " +
           "JOIN FETCH pt.plan " +
           "JOIN FETCH pt.teacher t " +
           "JOIN FETCH t.user " +
           "WHERE pt.paymentStatus = :status " +
           "ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findByPaymentStatus(@Param("status") PaymentStatus status);
}
