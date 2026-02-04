package com.fptu.eduBoostBackend.schedule;

import com.fptu.eduBoostBackend.repositories.OneTimeLoginTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduled task để cleanup expired one-time login tokens
 * Chạy mỗi ngày lúc 2:00 AM
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {
    
    private final OneTimeLoginTokenRepository tokenRepository;
    
    /**
     * Xóa các tokens đã hết hạn
     * Chạy mỗi ngày lúc 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired one-time login tokens...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            tokenRepository.deleteByExpiresAtBefore(now);
            
            log.info("Successfully cleaned up expired one-time login tokens");
        } catch (Exception e) {
            log.error("Error during token cleanup: {}", e.getMessage(), e);
        }
    }
}
