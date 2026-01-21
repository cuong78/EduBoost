import { authService } from './authService';
import { tokenManager } from '../utils/token-manager';
import { showErrorToast } from '../utils/show-toast';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const handle401 = async (originalRequest, apiClient) => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
        const newToken = await authService.refreshToken();
        tokenManager.saveToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
    } catch (error) {
        processQueue(error, null);
        tokenManager.clearToken();
        showErrorToast('Phiên đăng nhập đã hết hạn');
        window.location.href = '/login';
        return Promise.reject(error);
    } finally {
        isRefreshing = false;
    }
};
