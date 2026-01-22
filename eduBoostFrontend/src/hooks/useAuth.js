import { useContext, useState } from "react";
import { authService } from "../services/authService";
import { showErrorToast, showSuccessToast } from "../utils/show-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context.jsx";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");

    const { user, setUser } = context;
    const token = localStorage.getItem("token");
    const isAdmin = user?.roles[0]?.roleName === "ADMIN";
    const isManager = user?.roles[0]?.roleName === "MANAGER";
    const isEmployee = user?.roles[0]?.roleName === "EMPLOYEE";

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const register = async (data, onSuccess) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            showSuccessToast(response?.message || "Đăng ký thành công! Vui lòng kiểm tra email của bạn.");
            onSuccess?.();
            return response;
        } catch (error) {
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.message;
            if (status === 409) {
                showErrorToast(serverMessage || "Tên đăng nhập, email hoặc số điện thoại đã tồn tại");
            } else {
                showErrorToast(error?.message || "Đăng ký thất bại");
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (
        data,
        onSuccess,
        options
    ) => {
        setIsLoading(true);
        try {
            const res = await authService.login(data); // res: LoginResponse

            if (!res?.token) {
                showErrorToast("Đăng nhập thất bại: Không nhận được token");
                return null;
            }

            // Lưu token vào localStorage
            localStorage.setItem("token", res.token);
            
            // Fetch thông tin user đầy đủ từ API profile
            const profileData = await authService.getMyInfo();
            
            // Tạo user object từ profile API
            const userInfo = {
                userId: profileData.userId || 0,
                username: profileData.username || data.username,
                fullName: profileData.fullName || profileData.username || data.username,
                email: profileData.email || data.username,
                phoneNumber: profileData.phoneNumber || profileData.phone || "",
                identityCard: profileData.identityCard || "",
                gender: profileData.gender || 'OTHER',
                dateOfBirth: profileData.dateOfBirth || "",
                address: profileData.address || "",
                avatarUrl: profileData.avatarUrl || "",
                memberScore: profileData.memberScore || 0,
                status: profileData.status || 'ACTIVE',
                deleted: profileData.deleted || false,
                roles: profileData.roles || res.roles || [],
                permissions: profileData.permissions || []
            };

            setUser(userInfo);
            showSuccessToast("Đăng nhập thành công!");

            onSuccess?.();
            
            // Get role name - xử lý cả array of strings và array of objects
            const getRoleName = (roles) => {
                if (!roles || roles.length === 0) return null;
                const firstRole = roles[0];
                if (typeof firstRole === 'string') return firstRole;
                if (typeof firstRole === 'object' && firstRole.roleName) return firstRole.roleName;
                return null;
            };
            
            const roleName = getRoleName(userInfo.roles);
            
            // Điều hướng sau đăng nhập - luôn chuyển đến /teacher
            const redirect = options?.redirectTo;
            if (redirect === null) {
                // Không điều hướng, ở lại trang hiện tại
            } else if (typeof redirect === 'string') {
                navigate(redirect);
            } else {
                navigate("/teacher");
            }

            return userInfo;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
            showErrorToast(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };



    const logout = async () => {
        setIsLoading(true);
        try {
            const response = await authService.logout(token || "");

            if (response.code === 200) {
                // Xóa toàn bộ localStorage
                localStorage.clear();
                setUser(null);
                showSuccessToast(response.message || "Đăng Xuất Thành Công!");
                window.location.href = "/";
            } else {
                showErrorToast(response.message || "Đăng Xuất Thất Bại");
            }
        } catch (error) {
            showErrorToast("Đăng xuất thất bại!");
            // Vẫn xóa localStorage trong trường hợp lỗi
            localStorage.clear();
            setUser(null);
            window.location.href = "/";
        } finally {
            setIsLoading(false);
        }
    };

    const hasPermission = (name) => {
        return user?.roles[0]?.permissions.some((p) => p.permissionName === name);
    };

    const getMyInfo = async () => {
        // API getMyInfo đã được gọi trong login và loginWithGoogle
        // Function này giữ lại để compatibility
        try {
            const data = await authService.getMyInfo();
            return data;
        } catch (error) {
            console.error("Failed to fetch user info:", error);
            throw error;
        }
    }
    const loginWithGoogle = async (code) => {
        setIsLoading(true);
        try {
            const response = await authService.loginWithGoogle(code);
            if (response.code === 200) {
                const token = response.data.token;
                localStorage.setItem("token", token);
                
                // Fetch thông tin user đầy đủ từ API profile
                const profileData = await authService.getMyInfo();
                
                // Tạo user object từ profile API
                const userInfo = {
                    userId: profileData.userId || 0,
                    username: profileData.username || "Google User",
                    fullName: profileData.fullName || profileData.username || "Google User",
                    email: profileData.email || "",
                    phoneNumber: profileData.phoneNumber || profileData.phone || "",
                    identityCard: profileData.identityCard || "",
                    gender: profileData.gender || 'OTHER',
                    dateOfBirth: profileData.dateOfBirth || "",
                    address: profileData.address || "",
                    avatarUrl: profileData.avatarUrl || "",
                    memberScore: profileData.memberScore || 0,
                    status: profileData.status || 'ACTIVE',
                    deleted: profileData.deleted || false,
                    roles: profileData.roles || response.data.roles || [],
                    permissions: profileData.permissions || []
                };
                setUser(userInfo);
                
                // Redirect dựa trên role từ profile API
                const firstRole = Array.isArray(userInfo.roles) && userInfo.roles.length ? userInfo.roles[0] : null;
                const roleName = typeof firstRole === 'string' ? firstRole : firstRole?.roleName;
                if (roleName === "ADMIN") {
                    navigate("/admin");
                } else if (roleName === "STAFF") {
                    navigate("/staff");
                } else {
                    navigate("/");
                }
                
                return true;
            }
            return false;
        } catch (error) {
            showErrorToast("Đăng nhập Google thất bại");
            return false;
        } finally {
            setIsLoading(false);
        }
    };



    const resetPassword = async (email, newPassword, confirmPassword) => {
        setIsLoading(true);
        try {
            const response = await authService.resetPassword(email, newPassword, confirmPassword);
            if (response.code === 200) {
                showSuccessToast("Đặt lại mật khẩu thành công");
            } else {
                showErrorToast(response.message || "Đặt lại mật khẩu thất bại");
                throw new Error(response.message || "Đặt lại mật khẩu không thành công");
            }
        } catch (error) {
            throw new Error(error || "Đặt lại mật khẩu không thành công");
        } finally {
            setIsLoading(false);
        }
    };

    const requestEmailVerification = async (email) => {
        setIsLoading(true);
        try {
            const response = await authService.requestPasswordReset(email);
            if (response.code === 200) {
                showSuccessToast(response.message || "Đã gửi email xác minh đến địa chỉ của bạn");
            } else {
                showErrorToast(response.message || "Gửi yêu cầu xác minh email thất bại");
                throw new Error(response.message || "Email không tồn tại");
            }
        } catch (error) {
            showErrorToast(error || "Gửi yêu cầu xác minh email thất bại");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const verifyPassword = async (email, otp) => {
        setIsLoading(true);
        try {
            const response = await authService.verifyPassword(email, otp);
            if (response.code === 200) {
                showSuccessToast(response.message || "Xác minh thành công");
            } else {
                showErrorToast(response.message || "Xác minh thất bại");
                throw new Error(response.message || "Xác minh OTP không thành công");
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || "Xác minh OTP không thành công";
            showErrorToast(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }


    return {
        login,
        isLoading,
        user,
        register,
        setUser,
        isAdmin,
        isManager,
        isEmployee,
        logout,
        hasPermission,
        getMyInfo,
        loginWithGoogle,
        resetPassword,
        requestEmailVerification,
        verifyPassword
    };
}
