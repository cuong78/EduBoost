import { createContext, useState, useEffect } from "react";
import { tokenManager } from "../utils/token-manager";

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
          const decoded = tokenManager.decodeToken(token);
          setUser(decoded);
          setIsAuthenticated(true);
          tokenManager.scheduleTokenRefresh(token);
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
