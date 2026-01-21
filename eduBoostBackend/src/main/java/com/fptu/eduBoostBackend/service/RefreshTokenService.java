package com.fptu.eduBoostBackend.service;



import com.fptu.eduBoostBackend.dto.response.TokenRefreshResponse;
import com.fptu.eduBoostBackend.entities.RefreshToken;
import com.fptu.eduBoostBackend.entities.User;

import java.util.Optional;

public interface RefreshTokenService {
    Optional<RefreshToken> findByToken(String token);

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyExpiration(RefreshToken token);

    // New method for controller
    TokenRefreshResponse refreshToken(String refreshToken);

    void deleteByUser(User user);
}