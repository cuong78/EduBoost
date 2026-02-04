package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.entities.OneTimeLoginToken;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.repositories.OneTimeLoginTokenRepository;
import com.fptu.eduBoostBackend.service.OneTimeLoginTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class OneTimeLoginTokenServiceImpl implements OneTimeLoginTokenService {
    
    private final OneTimeLoginTokenRepository tokenRepository;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();
    
    @Override
    @Transactional
    public String generateToken(User user) {
        // Generate random token (32 bytes = 256 bits)
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String tokenString = base64Encoder.encodeToString(randomBytes);
        
        // Create token entity với thời hạn 24 giờ
        OneTimeLoginToken token = OneTimeLoginToken.builder()
                .token(tokenString)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        
        tokenRepository.save(token);
        log.info("Generated one-time login token for user: {}", user.getUsername());
        
        return tokenString;
    }
    
    @Override
    @Transactional
    public User validateAndUseToken(String tokenString) {
        OneTimeLoginToken token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Token không tồn tại"));
        
        // Kiểm tra token còn hợp lệ không
        if (!token.isValid()) {
            if (token.isUsed()) {
                throw new RuntimeException("Token đã được sử dụng");
            } else {
                throw new RuntimeException("Token đã hết hạn");
            }
        }
        
        // Đánh dấu token đã được sử dụng
        token.setUsed(true);
        tokenRepository.save(token);
        
        log.info("One-time token validated and used for user: {}", token.getUser().getUsername());
        return token.getUser();
    }
    
    @Override
    @Transactional
    public void invalidateUserTokens(User user) {
        tokenRepository.deleteByUser(user);
        log.info("Invalidated all one-time tokens for user: {}", user.getUsername());
    }
}
