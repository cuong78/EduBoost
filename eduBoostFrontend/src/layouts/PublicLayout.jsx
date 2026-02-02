import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';

const PublicLayout = () => {
    const { user } = useAuth();

    // If user is logged in, redirect to their dashboard
    if (user) {
        const roleName = user?.roles?.[0]?.roleName ?? (typeof user?.roles?.[0] === 'string' ? user.roles[0] : null);
        
        switch (roleName?.toUpperCase()) {
            case 'TEACHER':
                return <Navigate to="/teacher" replace />;
            case 'STUDENT':
                return <Navigate to="/student" replace />;
            case 'PARENT':
                return <Navigate to="/parent" replace />;
            case 'ADMIN':
                return <Navigate to="/admin" replace />;
            default:
                // If role is not recognized, allow access to public pages
                break;
        }
    }

    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default PublicLayout;
