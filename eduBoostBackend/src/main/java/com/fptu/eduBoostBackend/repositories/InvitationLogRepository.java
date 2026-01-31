package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.InvitationLog;
import com.fptu.eduBoostBackend.entities.StudentInvitation;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationLogRepository extends JpaRepository<InvitationLog, Long> {


}

