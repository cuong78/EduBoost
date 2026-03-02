import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Users,
  BookOpen,
  BookMarked,
  FileText,
  HelpCircle,
  GraduationCap,
  Award,
  Menu,
  X
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";

const AdminLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`sidebar glass-dark ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <img src={logo} alt="EduBoost" />
            <span style={{ color: "white" }}>EduBoost Admin</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin/users"
            className={`nav-item ${isActive("/admin/users") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Users size={20} /> Quản lý tài khoản
          </Link>
          <Link
            to="/admin/grade-levels"
            className={`nav-item ${isActive("/admin/grade-levels") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Award size={20} /> Quản lý khối
          </Link>
          <Link
            to="/admin/classes"
            className={`nav-item ${isActive("/admin/classes") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <GraduationCap size={20} /> Quản lý lớp học
          </Link>
          <Link
            to="/admin/subjects"
            className={`nav-item ${isActive("/admin/subjects") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <BookOpen size={20} /> Môn học
          </Link>
          <Link
            to="/admin/lesson-resources"
            className={`nav-item ${isActive("/admin/lesson-resources") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileText size={20} /> Tài nguyên bài học
          </Link>
          <Link
            to="/admin/question-bank"
            className={`nav-item ${isActive("/admin/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <HelpCircle size={20} /> Ngân hàng câu hỏi
          </Link>
        </nav>

        <div className="sidebar-footer">
          <UserMenu userType="admin" />
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="topbar glass">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2>Khu vực quản trị</h2>
          </div>
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
                    grid-template-columns: 1fr;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }
                
                @media (min-width: 1024px) {
                    .admin-layout {
                        grid-template-columns: 260px 1fr;
                    }
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
                    position: fixed;
                    left: 0;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                    width: 260px;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease-in-out;
                    z-index: 50;
                }
                
                .sidebar.open {
                    transform: translateX(0);
                }
                
                @media (min-width: 1024px) {
                    .sidebar {
                        position: sticky;
                        transform: translateX(0);
                        z-index: 10;
                    }
                }
                
                .sidebar-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 40;
                }
                
                @media (min-width: 1024px) {
                    .sidebar-overlay {
                        display: none;
                    }
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
                    padding: 0 1rem;
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.8);
                    position: sticky;
                    top: 0;
                    z-index: 30;
                }
                
                @media (min-width: 1024px) {
                    .topbar {
                        padding: 0 2rem;
                        background: rgba(255, 255, 255, 0.5);
                    }
                }
                
                .topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .topbar h2 {
                    font-size: 1.25rem;
                    margin: 0;
                }
                
                @media (min-width: 768px) {
                    .topbar h2 {
                        font-size: 1.5rem;
                    }
                }
                
                .menu-toggle {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.25rem;
                }
                
                @media (min-width: 1024px) {
                    .menu-toggle {
                        display: none;
                    }
                }
                
                .page-container {
                    padding: 1rem;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    width: 100%;
                    max-width: 100vw;
                }
                
                @media (min-width: 768px) {
                    .page-container {
                        padding: 2rem;
                    }
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
