import { useState, useEffect } from 'react';
import { tokenManager } from '../utils/token-manager';
import { showWarningToast } from '../utils/show-toast';

export const useTokenStatus = () => {
    const [tokenStatus, setTokenStatus] = useState({
        isValid: false,
        timeUntilExpiry: 0,
        isExpiringSoon: false,
    });

    useEffect(() => {
        const checkTokenStatus = () => {
            const token = tokenManager.getToken();

            if (!token) {
                setTokenStatus({
                    isValid: false,
                    timeUntilExpiry: 0,
                    isExpiringSoon: false,
                });
                return;
            }

            const isExpired = tokenManager.isTokenExpired(token);
            const isExpiringSoon = tokenManager.isTokenExpiringSoon(token);
            const timeUntilExpiry = tokenManager.getTimeUntilExpiry(token);

            setTokenStatus({
                isValid: !isExpired,
                timeUntilExpiry,
                isExpiringSoon,
            });

            // Hiển thị cảnh báo khi token sắp hết hạn (còn 2 phút) - chỉ hiển thị 1 lần
            if (isExpiringSoon && timeUntilExpiry <= 120 && timeUntilExpiry > 60) {
                const minutes = Math.floor(timeUntilExpiry / 60);
                const seconds = timeUntilExpiry % 60;
                showWarningToast(
                    `Phiên đăng nhập sắp hết hạn! Còn ${minutes}:${seconds.toString().padStart(2, '0')} phút. Hệ thống sẽ tự động gia hạn.`
                );
            }
        };

        // Kiểm tra ngay lập tức
        checkTokenStatus();

        // Kiểm tra mỗi 30 giây
        const interval = setInterval(checkTokenStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    return tokenStatus;
};