package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.StudentInvitation;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentInvitationRepository extends JpaRepository<StudentInvitation, String> {
    boolean existsByInvitationCode(String invitationCode);
    Optional<StudentInvitation> findByInvitationCode(String invitationCode);
    List<StudentInvitation> findByStudentAndStatus(Student student, InvitationStatus status);
    Page<StudentInvitation> findByStudent(Student student, Pageable pageable);

}
