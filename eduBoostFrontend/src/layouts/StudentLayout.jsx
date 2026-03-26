import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  MessageSquare,
  Users,
  FileQuestion,
  Menu,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import "../styles/dashboard-layout.css";

const StudentLayout = () => {
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
    <div className="dashboard-layout">
      {isSidebarOpen && (
        <div className="dl-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`dl-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="dl-sidebar-header">
          <Link to="/student" className="dl-logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost</span>
          </Link>
        </div>

        <nav className="dl-nav">
          <Link
            to="/student/chat"
            className={`dl-nav-item ${isActive("/student/chat") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <MessageSquare size={20} /> Chat AI
          </Link>
          <Link
            to="/student/exams"
            className={`dl-nav-item ${isActive("/student/exams") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileQuestion size={20} /> Bài kiểm tra
          </Link>
          <Link
            to="/student/forum"
            className={`dl-nav-item ${isActive("/student/forum") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Users size={20} /> Diễn đàn
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="student" />
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="dl-topbar-title">Dashboard Học Viên</h2>
          </div>
          <div className="dl-topbar-actions"></div>
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
