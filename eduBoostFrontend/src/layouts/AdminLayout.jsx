import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  GraduationCap,
  Award,
  Menu,
  Crown,
  MessageSquare,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import "../styles/dashboard-layout.css";

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
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="dl-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`dl-sidebar sidebar-dark ${isSidebarOpen ? "open" : ""}`}>
        <div className="dl-sidebar-header">
          <Link to="/" className="dl-logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost Admin</span>
          </Link>
        </div>

        <nav className="dl-nav">
          <Link
            to="/admin/users"
            className={`dl-nav-item ${isActive("/admin/users") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Users size={20} /> Quản lý tài khoản
          </Link>
          <Link
            to="/admin/grade-levels"
            className={`dl-nav-item ${isActive("/admin/grade-levels") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Award size={20} /> Quản lý khối
          </Link>
          <Link
            to="/admin/classes"
            className={`dl-nav-item ${isActive("/admin/classes") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <GraduationCap size={20} /> Quản lý lớp học
          </Link>
          <Link
            to="/admin/subjects"
            className={`dl-nav-item ${isActive("/admin/subjects") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <BookOpen size={20} /> Môn học
          </Link>
          <Link
            to="/admin/lesson-resources"
            className={`dl-nav-item ${isActive("/admin/lesson-resources") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileText size={20} /> Tài nguyên bài học
          </Link>
          <Link
            to="/admin/question-bank"
            className={`dl-nav-item ${isActive("/admin/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <HelpCircle size={20} /> Ngân hàng câu hỏi
          </Link>
          <Link
            to="/admin/subscriptions"
            className={`dl-nav-item ${isActive("/admin/subscriptions") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Crown size={20} /> Quản lý gói
          </Link>
          <Link
            to="/admin/feedback"
            className={`dl-nav-item ${isActive("/admin/feedback") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <MessageSquare size={20} /> Feedback
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="admin" />
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="dl-topbar-title">Khu vực quản trị</h2>
          </div>
          <div className="dl-topbar-actions">
            <span className="dl-status-badge">System Status: Stable</span>
          </div>
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
