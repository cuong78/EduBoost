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
     * @return User nếu token hợp lệ
     * @throws RuntimeException nếu token không hợp lệ hoặc đã hết hạn
     */
    User validateAndUseToken(String token);
    
    /**
     * Xóa tất cả tokens cũ của user (khi đổi mật khẩu chẳng hạn)
     */
    void invalidateUserTokens(User user);
}
