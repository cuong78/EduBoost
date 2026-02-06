import { createContext, useState, useEffect } from "react";
import { tokenManager } from "../utils/token-manager";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (token && !tokenManager.isTokenExpired(token)) {
          // Fetch thông tin user đầy đủ từ API thay vì chỉ decode token
          try {
            const profileData = await authService.getMyInfo();
            const userInfo = {
              userId: profileData.userId,
              username: profileData.username,
              fullName: profileData.fullName,
              email: profileData.email,
              phoneNumber: profileData.phoneNumber,
              identityCard: profileData.identityCard,
              gender: profileData.gender || 'OTHER',
              dateOfBirth: profileData.dateOfBirth,
              address: profileData.address,
              avatarUrl: profileData.avatarUrl,
              memberScore: profileData.memberScore || 0,
              status: profileData.status || 'ACTIVE',
              deleted: profileData.deleted || false,
              roles: profileData.roles || [],
              permissions: profileData.permissions || []
            };
            setUser(userInfo);
            setIsAuthenticated(true);
            tokenManager.scheduleTokenRefresh(token);
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // Nếu API thất bại, fallback về decode token
            const decoded = tokenManager.decodeToken(token);
            setUser(decoded);
            setIsAuthenticated(true);
            tokenManager.scheduleTokenRefresh(token);
          }
        } else {
          tokenManager.clearToken();
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        tokenManager.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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
