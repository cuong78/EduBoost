import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Lấy tên role từ mảng roles, loại bỏ prefix "ROLE_" nếu có
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

  // Loại bỏ prefix "ROLE_" nếu có
  if (roleName && roleName.startsWith("ROLE_")) {
    roleName = roleName.substring(5);
  }

  return roleName;
};

/**
 * Component để redirect người dùng đã đăng nhập khỏi các trang public
 * như home, login, register
 */
export default function RedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to load before making decisions
  if (loading) {
    return null; // or a loading spinner
  }

  // KHÔNG redirect nếu đang ở trong protected routes (admin, teacher, student, parent)
  const protectedPaths = ['/admin', '/teacher', '/student', '/parent'];
  const isProtectedRoute = protectedPaths.some(path => location.pathname.startsWith(path));
  
  if (isProtectedRoute) {
    return <Outlet />;
  }

  // Nếu đã đăng nhập, redirect về dashboard tương ứng với role
  if (user && user.roles && user.roles.length > 0) {
    const roleName = getRoleName(user.roles);

    const roleRedirect =
      roleName === "PARENT"
        ? "/parent"
        : roleName === "STUDENT"
          ? "/student"
          : roleName === "ADMIN"
            ? "/admin"
            : "/teacher";

    return <Navigate to={roleRedirect} replace />;
  }

  // Nếu chưa đăng nhập, cho phép truy cập
  return <Outlet />;
}
