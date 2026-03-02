import { createContext, useState, useEffect } from "react";
import { tokenManager } from "../utils/token-manager";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    userId: 1,
    username: "mock_user",
    fullName: "Mock User",
    email: "mock@example.com",
    roles: [{ roleName: "ADMIN" }, { roleName: "TEACHER" }, { roleName: "STUDENT" }, { roleName: "PARENT" }],
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Auth checks bypassed for local UI testing
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
