import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  BookOpen,
  PenLine,
  FilePlus,
  ClipboardList,
  Users,
  Library,
  FolderOpen,
  Menu,
  Table2,
  Gem,
  Send,
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
            <Users size={20} /> Lớp học
          </Link>
          <Link
            to="/teacher/create-question"
            className={`dl-nav-item dl-nav-highlight ${isActive("/teacher/create-question") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <PenLine size={20} /> Tạo câu hỏi
          </Link>
          <Link
            to="/teacher/question-bank"
            className={`dl-nav-item ${isActive("/teacher/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Library size={20} /> Ngân hàng câu hỏi
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
            className={`dl-nav-item dl-nav-highlight ${isActive("/teacher/matrix-templates") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Table2 size={20} /> Quản lý ma trận
          </Link>
          <Link
            to="/teacher/exams"
            className={`dl-nav-item ${location.pathname.startsWith("/teacher/exams") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <ClipboardList size={20} /> Quản lý đề thi
          </Link>
          <Link
            to="/teacher/create-exam"
            className={`dl-nav-item dl-nav-highlight ${isActive("/teacher/create-exam") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FilePlus size={20} /> Tạo đề thi
          </Link>
          <Link
            to="/teacher/feedback"
            className={`dl-nav-item ${isActive("/teacher/feedback") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Send size={20} /> Góp ý
          </Link>
          <Link
            to="/teacher/subscription"
            className={`dl-nav-item ${isActive("/teacher/subscription") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Gem size={20} /> Gói đăng ký
          </Link>

          {/* Divider + Guide link */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", margin: "8px 0" }} />
          <Link
            to="/teacher/guide"
            className={`dl-nav-item ${isActive("/teacher/guide") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <BookOpen size={20} /> Hướng dẫn
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
          <div className="dl-topbar-actions">
          </div>
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
