import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Lấy tên role từ mảng roles
 * Xử lý cả trường hợp role là string hoặc object
 * Loại bỏ prefix "ROLE_" nếu có (do backend trả về ROLE_TEACHER, ROLE_ADMIN,...)
 */
const getRoleName = (roles) => {
  if (!roles || roles.length === 0) return null;
  const first = roles[0];

  let roleName = null;
  if (typeof first === "string") {
    roleName = first;
  } else if (typeof first === "object" && first?.roleName) {
    roleName = first.roleName;
  }

  // Loại bỏ prefix "ROLE_" nếu có (VD: "ROLE_TEACHER" -> "TEACHER")
  if (roleName && roleName.startsWith("ROLE_")) {
    roleName = roleName.substring(5);
  }

  return roleName;
};

/**
 * Require authentication + role for a route subtree.
 * - not logged in -> /login
 * - wrong role -> /unauthorized
 */
export default function RequireRole({ allow = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to load before making decisions
  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roleName = getRoleName(user.roles)?.toUpperCase();
  const allowed = allow.map((r) => String(r).toUpperCase());

  if (!roleName || !allowed.includes(roleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
