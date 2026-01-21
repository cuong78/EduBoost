package com.fptu.eduBoostBackend.repositories;


import com.fptu.eduBoostBackend.entities.PasswordResetToken;
import com.fptu.eduBoostBackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);

    void deleteByUser(User user);
}
