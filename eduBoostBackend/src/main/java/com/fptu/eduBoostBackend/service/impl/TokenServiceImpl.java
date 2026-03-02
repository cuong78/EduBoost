package com.fptu.eduBoostBackend.service.impl;


import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.exception.exceptions.UnauthorizedException;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.security.JwtTokenProvider;
import com.fptu.eduBoostBackend.service.TokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation của TokenService
 * Thuộc Business Logic Layer
 * Sử dụng JwtTokenProvider (Infrastructure) để xử lý technical details
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String generateToken(User user) {
        log.info("Generating token for user: {}", user.getUsername());
        return jwtTokenProvider.generateToken(user);
    }

    @Override
    public User validateAndGetUser(String token) {
        // Parse token để lấy claims
        Claims claims;
        try {
            claims = jwtTokenProvider.getClaims(token);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        String username = claims.getSubject();

        // Lấy user từ database
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found or token is invalid"));
        // Kiểm tra token version
        int tokenVersion = jwtTokenProvider.getTokenVersion(claims);
        if (tokenVersion != user.getTokenVersion()) {
            log.warn("Token version mismatch for user: {}. Expected: {}, Got: {}",
                    username, user.getTokenVersion(), tokenVersion);
            throw new UnauthorizedException("Token has been invalidated");        }

        log.debug("Token validated successfully for user: {}", username);
        return user;
    }

    @Override
    @Transactional
    public void invalidateAllTokens(User user) {
        log.info("Invalidating all tokens for user: {}", user.getUsername());
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }
}