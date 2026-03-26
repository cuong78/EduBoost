import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  BookOpen,
  FileQuestion,
  PenTool,
  FileText,
  GraduationCap,
  Database,
  FolderOpen,
  Menu,
  LayoutGrid,
  Crown,
  MessageSquare,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import "../styles/dashboard-layout.css";

const TeacherLayout = () => {
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
          <div className="dl-logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost</span>
          </div>
        </div>

        <nav className="dl-nav">
          <Link
            to="/teacher/classes"
            className={`dl-nav-item ${location.pathname.startsWith("/teacher/classes") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <GraduationCap size={20} /> Lớp học
          </Link>
          <Link
            to="/teacher/create-question"
            className={`dl-nav-item ${isActive("/teacher/create-question") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileQuestion size={20} /> Tạo câu hỏi
          </Link>
          <Link
            to="/teacher/question-bank"
            className={`dl-nav-item ${isActive("/teacher/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Database size={20} /> Ngân hàng câu hỏi
          </Link>
          <Link
            to="/teacher/resources"
            className={`dl-nav-item ${isActive("/teacher/resources") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FolderOpen size={20} /> Quản lý tài nguyên
          </Link>
          <Link
            to="/teacher/matrix-templates"
            className={`dl-nav-item ${isActive("/teacher/matrix-templates") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <LayoutGrid size={20} /> Quản lý ma trận
          </Link>
          <Link
            to="/teacher/exams"
            className={`dl-nav-item ${location.pathname.startsWith("/teacher/exams") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileText size={20} /> Quản lý đề thi
          </Link>
          <Link
            to="/teacher/create-exam"
            className={`dl-nav-item ${isActive("/teacher/create-exam") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <PenTool size={20} /> Tạo đề thi
          </Link>
          <Link
            to="/teacher/feedback"
            className={`dl-nav-item ${isActive("/teacher/feedback") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <MessageSquare size={20} /> Góp ý
          </Link>
          <Link
            to="/teacher/subscription"
            className={`dl-nav-item ${isActive("/teacher/subscription") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Crown size={20} /> Gói đăng ký
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="teacher" />
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
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

export default TeacherLayout;
