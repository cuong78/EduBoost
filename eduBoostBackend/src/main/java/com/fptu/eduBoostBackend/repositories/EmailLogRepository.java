package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.EmailLog;
import com.fptu.eduBoostBackend.entities.enums.EmailStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {


}

