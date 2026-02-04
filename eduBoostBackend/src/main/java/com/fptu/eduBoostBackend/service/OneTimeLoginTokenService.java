package com.fptu.eduBoostBackend.service;

import com.fptu.eduBoostBackend.entities.User;

public interface OneTimeLoginTokenService {
    
    /**
     * Generate one-time login token for user
     * Token có hiệu lực trong 24 giờ
     * 
     * @param user User cần tạo token
     * @return Token string
     */
    String generateToken(User user);
    
    /**
     * Validate và sử dụng one-time token
     * Token chỉ có thể sử dụng 1 lần và phải còn hiệu lực
     * 
     * @param token Token string
     * @return Username của user
     * @throws RuntimeException nếu token không hợp lệ hoặc đã hết hạn
     */
    String validateTokenAndGetUsername(String token);
    
    /**
     * Xóa tất cả tokens cũ của user (khi đổi mật khẩu chẳng hạn)
     */
    void invalidateUserTokens(User user);
    
    /**
     * Save pre-generated token to database (for async operations)
     * 
     * @param tokenString Token string đã được tạo
     * @param userId User ID
     */
    void saveTokenByUserId(String tokenString, Long userId);
}
