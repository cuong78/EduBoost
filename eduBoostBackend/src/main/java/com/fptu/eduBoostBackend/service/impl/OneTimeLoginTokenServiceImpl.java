package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.entities.OneTimeLoginToken;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.repositories.OneTimeLoginTokenRepository;
import com.fptu.eduBoostBackend.repositories.UserRepository;
import com.fptu.eduBoostBackend.service.OneTimeLoginTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class OneTimeLoginTokenServiceImpl implements OneTimeLoginTokenService {
    
    private final OneTimeLoginTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();
    
    @Override
    @Transactional
    public String generateToken(User user) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String tokenString = base64Encoder.encodeToString(randomBytes);
        
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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String validateTokenAndGetUsername(String tokenString) {
        OneTimeLoginToken token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Token không tồn tại"));
        
        if (token.isUsed()) {
            throw new RuntimeException("Token đã được sử dụng");
        }
        
        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new RuntimeException("Token đã hết hạn");
        }
        
        // Lấy username trước khi mark as used
        String username = token.getUser().getUsername();
        
        // Mark as used
        token.setUsed(true);
        tokenRepository.save(token);
        
        log.info("One-time token validated and used for user: {}", username);
        return username;
    }
    
    @Override
    @Transactional
    public void invalidateUserTokens(User user) {
        tokenRepository.deleteByUser(user);
        log.info("Invalidated all one-time tokens for user: {}", user.getUsername());
    }
    
    @Override
    @Transactional
    public void saveTokenByUserId(String tokenString, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        OneTimeLoginToken token = OneTimeLoginToken.builder()
                .token(tokenString)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        
        tokenRepository.save(token);
        log.info("Saved pre-generated token for user: {}", user.getUsername());
    }
}
