import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  BookOpen,
  FileQuestion,
  PenTool,
  LogOut,
  FileText,
  GraduationCap,
  Upload,
  Database,
  FolderOpen,
  Menu,
  X,
  LayoutGrid,
  Crown,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import { useAuth } from "../hooks/useAuth";

const TeacherLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="teacher-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`sidebar glass ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          {/* logo non-clickable for teacher role */}
          <div className="logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/teacher/classes"
            className={`nav-item ${location.pathname.startsWith("/teacher/classes") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <GraduationCap size={20} /> Lớp học
          </Link>
          <Link
            to="/teacher/create-question"
            className={`nav-item ${isActive("/teacher/create-question") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileQuestion size={20} /> Tạo question
          </Link>
          <Link
            to="/teacher/question-bank"
            className={`nav-item ${isActive("/teacher/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Database size={20} /> Ngân hàng câu hỏi
          </Link>
          <Link
            to="/teacher/resources"
            className={`nav-item ${isActive("/teacher/resources") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FolderOpen size={20} /> Quản lý tài nguyên
          </Link>
          <Link
            to="/teacher/matrix-templates"
            className={`nav-item ${isActive("/teacher/matrix-templates") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <LayoutGrid size={20} /> Quản lý ma trận
          </Link>
          <Link
            to="/teacher/exams"
            className={`nav-item ${location.pathname.startsWith("/teacher/exams") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileText size={20} /> Quản lý đề thi
          </Link>
          <Link
            to="/teacher/create-exam"
            className={`nav-item ${isActive("/teacher/create-exam") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <PenTool size={20} /> Tạo đề thi
          </Link>
          <Link
            to="/teacher/subscription"
            className={`nav-item ${isActive("/teacher/subscription") ? "active" : ""}`}
            onClick={closeSidebar}
            style={{ marginTop: "auto" }}
          >
            <Crown size={20} /> Gói đăng ký
          </Link>
        </nav>

        <div className="sidebar-footer">
          <UserMenu userType="teacher" />
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="topbar glass">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          </div>
          <div className="topbar-actions">{/* Notification bells etc */}</div>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>

      <style>{`
                .teacher-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }
                
                @media (min-width: 1024px) {
                    .teacher-layout {
                        grid-template-columns: 260px 1fr;
                    }
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
                    background: var(--glass-bg);
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
                    background: var(--color-accent-1);
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
                
                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }
            `}</style>
    </div>
  );
};

export default TeacherLayout;
