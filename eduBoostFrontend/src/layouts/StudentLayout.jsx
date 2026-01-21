import { Outlet, Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { BookOpen, MessageSquare, Users, Settings, LogOut, LayoutDashboard } from 'lucide-react';

const StudentLayout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="student-layout">
            <aside className="sidebar glass">
                <div className="sidebar-header">
                    <Link to="/" className="logo">
                        <img src={logo} alt="EduBoost" />
                        <span>EduBoost</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/student/courses" className={`nav-item ${isActive('/student/courses') ? 'active' : ''}`}>
                        <BookOpen size={20} /> Bài giảng
                    </Link>
                    <Link to="/student/chat" className={`nav-item ${isActive('/student/chat') ? 'active' : ''}`}>
                        <MessageSquare size={20} /> Chat AI
                    </Link>
                    <Link to="/student/forum" className={`nav-item ${isActive('/student/forum') ? 'active' : ''}`}>
                        <Users size={20} /> Diễn đàn
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout">
                        <LogOut size={20} /> Đăng xuất
                    </button>
                    <div className="user-profile">
                        <div className="avatar">HV</div>
                        <div className="user-info">
                            <span className="name">Học viên A</span>
                            <span className="role">Lớp 12A1</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="dashboard-content">
                <header className="topbar glass">
                    <h2>Dashboard Học Viên</h2>
                    <div className="topbar-actions">
                        {/* Notification bells etc could go here */}
                    </div>
                </header>
                <div className="page-container">
                    <Outlet />
                </div>
            </main>

            <style>{`
                .student-layout {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }

                .sidebar {
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--glass-border);
                    padding: 1.5rem;
                }

                .sidebar-header {
                    margin-bottom: 3rem;
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }

                .logo img {
                    height: 32px;
                    width: auto;
                }

                .logo span {
                     background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
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
                    color: var(--color-text-secondary);
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
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }
                
                .nav-item.active {
                     background: linear-gradient(90deg, rgba(96, 78, 255, 0.1) 0%, transparent 100%);
                     border-left: 3px solid var(--color-accent-1);
                }

                .sidebar-footer {
                    border-top: 1px solid rgba(0,0,0,0.05);
                    padding-top: 1.5rem;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 1rem;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--color-accent-2);
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
                
                .user-info .name { font-weight: 600; }
                .user-info .role { font-size: 0.8rem; color: var(--color-text-secondary); }

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
            `}</style>
        </div>
    );
};

export default StudentLayout;
