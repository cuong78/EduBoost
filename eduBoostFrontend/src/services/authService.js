import { apiClient } from "./api";
import { errorResponse } from "../types/api-response";
import { API } from "../constants/api";
import { tokenManager } from "../utils/token-manager";
import axios from 'axios';

const API_BASE = `${API.BASE}`;
const API_GET_USER = `${API.USER}/profile`;
const API_FORGOT_PASSWORD = `${API.BASE}/forgot-password`;

export const authService = {
    getMyInfo: async () => {
        try {
            const response = await apiClient.get(API_GET_USER);
            const resp = response.data || {};
            // Unwrap common response shapes
            const data = resp.data ?? resp;
            return data;
        } catch (error) {
            console.error('Failed to fetch my info', error);
            throw error;
        }
    },

    // Get user by phone number
    getUserByPhone: async (phone) => {
        try {
            const response = await apiClient.get(`${API.BASE}/user/by-phone`, {
                params: { phone }
            });
            const resp = response.data || {};
            // Unwrap common response shapes
            const data = resp.data ?? resp;
            return data;
        } catch (error) {
            console.error('Failed to fetch user by phone', error);
            throw error;
        }
    },
    register: async (data) => {
        // Backend expects: { username, password, confirmPassword, email, phone }
        // Our form uses phoneNumber → map to phone
        const payload = {
            username: data.username,
            password: data.password,
            confirmPassword: data.confirmPassword,
            email: data.email,
            phone: data.phone,
        };

        try {
            // Use a direct axios call WITHOUT credentials/Authorization to avoid CORS preflight issues
            const response = await axios.post(`${API.BASE}/auth/register`, payload, {
                withCredentials: false,
                headers: { 'Content-Type': 'application/json' },
            });
            const res = response.data || {};
            const code = res.code ?? res.statusCode ?? response.status;
            if (code === 200) return { data: res.data, message: res.message };
            throw new Error(res.message || 'Register failed');
        } catch (error) {
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.message;
            if (status === 409) {
                // Normalize duplicate conflict message
                const message = serverMessage || 'Tên đăng nhập, email hoặc số điện thoại đã tồn tại';
                throw new Error(message);
            }
            throw error;
        }
    },

    verifyEmail: async (token) => {
        const response = await axios.post(`${API.BASE}/auth/verify`, null, {
            params: { token },
            withCredentials: false,
            headers: { 'Content-Type': 'application/json' },
        });
        const res = response.data || {};
        const code = res.code ?? res.statusCode;
        if (code === 200) return { message: res.message };
        throw new Error(res.message || 'Verify email failed');
    },

    login: async (data) => {
        // Sử dụng axios trực tiếp để tránh CORS issue với withCredentials
        const response = await axios.post(`${API.BASE}/auth/login`, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: false
        });
        
        const res = response.data || {};
        const code = res.statusCode ?? res.code ?? response.status;
        
        if (code === 200) {
            return {
                token: res.data.token,
                roles: res.data.roles || []
            };
        }
        
        throw new Error(res.message || 'Login failed');
    },

    logout: async (token) => {
        try {
            const authToken = token ?? tokenManager.getToken() ?? "";
            // Sử dụng axios trực tiếp để gửi POST request đến /api/logout
            const response = await axios.post(`${API.BASE}/auth/logout`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                withCredentials: false
            });
            
            const res = response.data || {};
            const code = res.statusCode ?? res.code ?? response.status;
            
            if (code === 200) {
                return {
                    code: 200,
                    message: res.message || 'Logout successful',
                    data: res.data || null
                };
            }
            // Nếu token đã hết hạn, xem như logout thành công phía client
            if (code === 401 || code === 403) {
                return {
                    code: 200,
                    message: 'Logout successful',
                    data: null
                };
            }

            return errorResponse(res.message || 'Logout failed');
        } catch (error) {
            console.error("Logout thất bại", error);
            // Nếu có bất kỳ lỗi nào (500, 401, 403...), vẫn coi như logout thành công
            // Vì mục đích chính là xóa token ở client
            return {
                code: 200,
                message: 'Logout successful (client-side)',
                data: null
            };
        }
    },


    requestPasswordReset: async (email) => {
        try {
            const response = await axios.post(`${API.BASE}/auth/forgot-password`, { email }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: false
            });
            const res = response.data || {};
            return {
                code: res.statusCode || 200,
                message: res.message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
                data: res.data
            };
        } catch (error) {
            console.error('Request password reset failed', error);
            throw error;
        }
    },

    verifyPassword: async (email, otp) => {
        console.log(`${API_FORGOT_PASSWORD}/auth/verify-token`);
        try {
            const response = await apiClient.post(`${API_FORGOT_PASSWORD}/verify-token`, { email, otp });
            return response.data;
        } catch (error) {
            console.error('Xác minh OTP thất bại', error);
            throw error;
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const response = await axios.post(`${API.BASE}/auth/reset-password`, 
                { token, newPassword }, 
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: false
                }
            );
            const res = response.data || {};
            return {
                code: res.statusCode || 200,
                message: res.message || 'Đặt lại mật khẩu thành công',
                data: res.data
            };
        } catch (error) {
            console.error('Đặt lại mật khẩu thất bại', error);
            throw error;
        }
    },

    refreshToken: async () => {
        const currentToken = tokenManager.getToken();

        if (!currentToken) throw new Error("No token available for refresh");

        // Sử dụng axios trực tiếp thay vì apiClient để tránh vòng lặp vô hạn
        const response = await axios.post(`${API.BASE}/auth/refresh-token`, {
            token: currentToken,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            withCredentials: false
        });

        const newToken = response.data?.data?.token;

        if (newToken) {
            tokenManager.saveToken(newToken);
            return newToken;
        } else {
            throw new Error("Failed to refresh token");
        }
    },


    loginWithGoogle: async (code) => {
        try {
            const response = await axios.post(`${API.BASE}/auth/google-login`, { code }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: false
            });
            const res = response.data || {};
            const code_status = res.statusCode ?? res.code ?? response.status;
            
            if (code_status === 200) {
                return {
                    code: 200,
                    message: res.message || 'Google login successful',
                    data: {
                        token: res.data.token,
                        roles: res.data.roles || []
                    }
                };
            }
            
            return errorResponse(res.message || 'Google login failed');
        } catch (error) {
            console.error("Google login failed", error);
            return errorResponse(error?.response?.data?.message || 'Google login failed');
        }
    }

};
