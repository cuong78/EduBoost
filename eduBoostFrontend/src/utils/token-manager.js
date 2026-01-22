import { jwtDecode } from 'jwt-decode';

/**
 * @typedef {Object} TokenPayload
 * @property {number} exp
 * @property {number} iat
 * @property {string} sub
 */

class TokenManager {
    constructor() {
        this.refreshTimer = null;
        this.REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 phút trước khi hết hạn
        this.isRefreshing = false;
    }

    /**
     * Decode JWT token
     * @param {string} token
     * @returns {TokenPayload|null}
     */
    decodeToken(token) {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }

    /**
     * Kiểm tra token có hết hạn chưa
     * @param {string} token
     * @returns {boolean}
     */
    isTokenExpired(token) {
        const decoded = this.decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    }

    /**
     * Kiểm tra token sắp hết hạn (trong vòng 5 phút)
     * @param {string} token
     * @returns {boolean}
     */
    isTokenExpiringSoon(token) {
        const decoded = this.decodeToken(token);
        if (!decoded) return true;

        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;
        return timeUntilExpiry < (this.REFRESH_THRESHOLD / 1000);
    }

    /**
     * Lấy thời gian còn lại của token (tính bằng giây)
     * @param {string} token
     * @returns {number}
     */
    getTimeUntilExpiry(token) {
        const decoded = this.decodeToken(token);
        if (!decoded) return 0;

        const currentTime = Date.now() / 1000;
        return Math.max(0, decoded.exp - currentTime);
    }

    /**
     * Lưu token vào localStorage
     * @param {string} token
     */
    saveToken(token) {
        localStorage.setItem('token', token);
        this.scheduleTokenRefresh(token);
    }

    /**
     * Lấy token từ localStorage
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Xóa token
     */
    clearToken() {
        localStorage.removeItem('token');
        this.clearRefreshTimer();
    }

    /**
     * Lên lịch refresh token
     * @param {string} token
     */
    scheduleTokenRefresh(token) {
        this.clearRefreshTimer();

        const timeUntilExpiry = this.getTimeUntilExpiry(token);
        const timeUntilRefresh = Math.max(0, timeUntilExpiry - (this.REFRESH_THRESHOLD / 1000));

        if (timeUntilRefresh > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshToken();
            }, timeUntilRefresh * 1000);
        }
    }

    /**
     * Clear refresh timer
     */
    clearRefreshTimer() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Refresh token (sẽ được implement bởi authService)
     * @private
     * @returns {Promise<void>}
     */
    async refreshToken() {
        try {
            // Import động để tránh circular dependency
            const { authService } = await import('../services/authService');
            const newToken = await authService.refreshToken();
            this.saveToken(newToken);
            console.log('Token refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh token:', error);
            this.clearToken();
            // Không redirect ngay lập tức, để user vẫn có thể sử dụng
            // Chỉ redirect khi thực sự cần thiết
        }
    }

    /**
     * Kiểm tra và refresh token nếu cần
     * @returns {Promise<boolean>}
     */
    async checkAndRefreshToken() {
        const token = this.getToken();
        if (!token) return false;

        // Nếu token đã hết hạn hoàn toàn, không thể refresh
        if (this.isTokenExpired(token)) {
            console.log('Token đã hết hạn hoàn toàn');
            this.clearToken();
            return false;
        }

        // Nếu token sắp hết hạn (trong vòng 5 phút), thử refresh
        if (this.isTokenExpiringSoon(token)) {
            // Chỉ log một lần khi bắt đầu refresh, không spam
            if (!this.isRefreshing) {
                console.log('🔄 Token sắp hết hạn, đang thử refresh...');
                this.isRefreshing = true;
            }

            try {
                const { authService } = await import('../services/authService');
                const newToken = await authService.refreshToken();
                this.saveToken(newToken);
                console.log('✅ Refresh token thành công');
                this.isRefreshing = false;
                return true;
            } catch (error) {
                console.error('❌ Failed to refresh token:', error);
                this.isRefreshing = false;
                // Không clear token ngay lập tức, để user vẫn có thể sử dụng cho đến khi thực sự hết hạn
                // Chỉ clear khi token thực sự hết hạn
                return false; // Return false để không tiếp tục vòng lặp
            }
        }

        return true;
    }
}

export const tokenManager = new TokenManager();