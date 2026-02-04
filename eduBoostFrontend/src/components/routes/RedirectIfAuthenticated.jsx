import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component để redirect người dùng đã đăng nhập khỏi các trang public
 * như home, login, register
 */
export default function RedirectIfAuthenticated() {
    const { user } = useAuth();

    // Nếu đã đăng nhập, redirect về dashboard tương ứng với role
    if (user && user.roles && user.roles.length > 0) {
        const roleName = typeof user.roles[0] === 'string' 
            ? user.roles[0] 
            : user.roles[0]?.roleName;

        const roleRedirect = 
            roleName === 'PARENT' ? '/parent' :
            roleName === 'STUDENT' ? '/student' :
            roleName === 'ADMIN' ? '/admin' :
            '/teacher';

        return <Navigate to={roleRedirect} replace />;
    }

    // Nếu chưa đăng nhập, cho phép truy cập
    return <Outlet />;
}
