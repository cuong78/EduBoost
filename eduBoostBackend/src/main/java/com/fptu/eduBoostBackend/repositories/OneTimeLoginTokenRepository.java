package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.OneTimeLoginToken;
import com.fptu.eduBoostBackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OneTimeLoginTokenRepository extends JpaRepository<OneTimeLoginToken, Long> {
    
    Optional<OneTimeLoginToken> findByToken(String token);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    
    void deleteByUser(User user);
}
