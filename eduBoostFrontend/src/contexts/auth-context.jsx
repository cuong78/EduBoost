import { createContext, useState, useEffect } from "react";
import { tokenManager } from "../utils/token-manager";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // ── DEV MOCK MODE ──────────────────────────────────────────────
      // Nếu có MOCK_USER trong localStorage, dùng trực tiếp (không cần BE)
      const mockUserStr = localStorage.getItem('MOCK_USER');
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          if (isMounted) {
            setUser(mockUser);
            setIsAuthenticated(true);
            setLoading(false);
          }
          return;
        } catch (_) { /* invalid JSON, ignore */ }
      }
      // ────────────────────────────────────────────────────────────────

      try {
        const token = tokenManager.getToken();

        // Không có token → chưa đăng nhập
        if (!token || tokenManager.isTokenExpired(token)) {
          tokenManager.clearToken();
          if (!isMounted) return;
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Có token hợp lệ → lấy thông tin user
        const profile = await authService.getMyInfo();
        if (!isMounted) return;

        const userInfo = {
          userId: profile.userId || 0,
          username: profile.username || "",
          fullName: profile.fullName || profile.username || "",
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || profile.phone || "",
          identityCard: profile.identityCard || "",
          gender: profile.gender || "OTHER",
          dateOfBirth: profile.dateOfBirth || "",
          address: profile.address || "",
          avatarUrl: profile.avatarUrl || "",
          memberScore: profile.memberScore || 0,
          status: profile.status || "ACTIVE",
          deleted: profile.deleted || false,
          roles: profile.roles || [],
          permissions: profile.permissions || [],
        };

        setUser(userInfo);
        setIsAuthenticated(true);
      } catch (error) {
        // Token không hợp lệ hoặc gọi API lỗi → coi như chưa đăng nhập
        console.error("Failed to initialize auth state:", error);
        tokenManager.clearToken();
        if (!isMounted) return;
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
