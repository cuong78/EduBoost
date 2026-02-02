package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.StudentInvitation;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudentInvitationRepository extends JpaRepository<StudentInvitation, String> {
    boolean existsByInvitationCode(String invitationCode);
    Optional<StudentInvitation> findByInvitationCode(String invitationCode);
    
    List<StudentInvitation> findByStudentAndStatus(Student student, InvitationStatus status);
    Page<StudentInvitation> findByStudent(Student student, Pageable pageable);
    
    long countByStatus(InvitationStatus status);
    
    @Query("SELECT si FROM StudentInvitation si WHERE si.status = :status AND si.expiresAt BETWEEN :startDate AND :endDate")
    List<StudentInvitation> findExpiringInvitations(
            @Param("status") InvitationStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT si FROM StudentInvitation si WHERE si.status = 'ACTIVE' AND si.expiresAt < :expiryDate")
    List<StudentInvitation> findExpiredActiveInvitations(@Param("expiryDate") LocalDateTime expiryDate);
    
    int deleteByStatusAndExpiresAtBefore(InvitationStatus status, LocalDateTime expiresAt);
}
