import { useEffect } from 'react';
import { tokenManager } from '../utils/token-manager';

export const useTokenExpiration = () => {
    useEffect(() => {
        const handleTokenExpiration = () => {
            const token = tokenManager.getToken();

            if (!token) {
                // Token không tồn tại, chỉ clear token
                tokenManager.clearToken();
                return;
            }

            if (tokenManager.isTokenExpired(token)) {
                // Token đã hết hạn, clear token
                tokenManager.clearToken();

                // Trigger event để mở modal login
                window.dispatchEvent(new CustomEvent('showLoginModal'));
            }
        };

        // Kiểm tra ngay lập tức
        handleTokenExpiration();

        // Kiểm tra mỗi phút
        const interval = setInterval(handleTokenExpiration, 60000);

        return () => clearInterval(interval);
    }, []);
};