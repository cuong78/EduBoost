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
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Trong lúc đang kiểm tra trạng thái đăng nhập
  if (loading) {
    return null;
  }

  // Chưa đăng nhập → chuyển về trang login, đồng thời nhớ lại route cũ
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  const roleName = getRoleName(user.roles);

  // Nếu route yêu cầu role cụ thể và user không nằm trong danh sách cho phép
  if (allow.length > 0 && !allow.includes(roleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Đúng role → cho phép truy cập vào subtree
  return <Outlet />;
}
