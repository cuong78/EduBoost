package com.fptu.eduBoostBackend.repositories;


import com.fptu.eduBoostBackend.entities.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);

}

