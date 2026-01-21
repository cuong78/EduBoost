import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Users, Settings, Shield, LayoutDashboard, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-layout">
            <aside className="sidebar glass-dark">
                <div className="sidebar-header">
                    <Link to="/" className="logo">
                        <img src={logo} alt="EduBoost" />
                        <span style={{ color: 'white' }}>EduBoost Admin</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Tổng quan
                    </Link>
                    <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                        <Users size={20} /> Quản lý tài khoản
                    </Link>
                    <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings') ? 'active' : ''}`}>
                        <Settings size={20} /> Cài đặt hệ thống
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout">
                        <LogOut size={20} /> Đăng xuất
                    </button>
                    <div className="user-profile">
                        <div className="avatar admin-avatar">AD</div>
                        <div className="user-info">
                            <span className="name">Admin User</span>
                            <span className="role">Administrator</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="dashboard-content">
                <header className="topbar glass">
                    <h2>Khu vực quản trị</h2>
                    <div className="topbar-actions">
                        <span className="badge">System Status: Stable</span>
                    </div>
                </header>
                <div className="page-container">
                    <Outlet />
                </div>
            </main>

            <style>{`
                .admin-layout {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }
                
                /* Dark sidebar for admin to distinguish */
                .glass-dark {
                    background: rgba(30, 30, 40, 0.95);
                    backdrop-filter: blur(12px);
                    border-right: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                }

                .sidebar {
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                }

                .sidebar-header {
                    margin-bottom: 3rem;
                }

                .logo {
                    font-size: 1.4rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }

                .logo img {
                    height: 32px;
                    width: auto;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    color: rgba(255,255,255,0.7);
                    font-weight: 500;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                    font-size: 1rem;
                    text-decoration: none;
                }

                .nav-item:hover, .nav-item.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                 .nav-item.active {
                     border-left: 3px solid var(--color-accent-1);
                }

                .sidebar-footer {
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 1.5rem;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 1rem;
                }

                .avatar.admin-avatar {
                    background: #ff4757;
                }
                
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.9rem;
                }
                
                .user-info .name { font-weight: 600; color: white;}
                .user-info .role { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

                .dashboard-content {
                    display: flex;
                    flex-direction: column;
                }

                .topbar {
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(255,255,255,0.5);
                }
                
                .page-container {
                    padding: 2rem;
                    flex: 1;
                    overflow-y: auto;
                }
                
                .badge {
                    background: #2ed573;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
