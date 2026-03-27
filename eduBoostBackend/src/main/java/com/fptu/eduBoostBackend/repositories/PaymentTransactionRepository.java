package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.PaymentTransaction;
import com.fptu.eduBoostBackend.entities.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrderId(String orderId);

    Optional<PaymentTransaction> findByOrderIdAndPaymentStatus(String orderId, PaymentStatus status);

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

    /** Count transactions by status */
    long countByPaymentStatus(PaymentStatus status);

    /** Sum amount of SUCCESS transactions */
    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PaymentTransaction pt WHERE pt.paymentStatus = 'SUCCESS'")
    BigDecimal sumSuccessRevenue();

    /** Sum amount of SUCCESS transactions in date range */
    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PaymentTransaction pt " +
           "WHERE pt.paymentStatus = 'SUCCESS' " +
           "AND pt.paidAt >= :from AND pt.paidAt < :to")
    BigDecimal sumSuccessRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** All transactions ordered by date (admin) */
    @Query("SELECT pt FROM PaymentTransaction pt " +
           "JOIN FETCH pt.plan " +
           "JOIN FETCH pt.teacher t " +
           "JOIN FETCH t.user " +
           "ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findAllOrderByCreatedAtDesc();
}
