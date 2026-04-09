import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { FileQuestion, Menu, MessageSquare, Users } from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import LanguageSwitch from "../components/common/LanguageSwitch";
import { useLanguage } from "../contexts/language-context";
import "../styles/dashboard-layout.css";

const StudentLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();

  const copy =
    language === "vi"
      ? {
          chat: "Chat AI",
          exams: "Bài kiểm tra",
          forum: "Diễn đàn",
          title: "Dashboard học viên",
        }
      : {
          chat: "AI chat",
          exams: "Exams",
          forum: "Forum",
          title: "Student dashboard",
        };

  const isActive = (path) => location.pathname === path;
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && <div className="dl-overlay" onClick={closeSidebar}></div>}

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
            <MessageSquare size={20} /> {copy.chat}
          </Link>
          <Link
            to="/student/exams"
            className={`dl-nav-item ${isActive("/student/exams") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <FileQuestion size={20} /> {copy.exams}
          </Link>
          <Link
            to="/student/forum"
            className={`dl-nav-item ${isActive("/student/forum") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Users size={20} /> {copy.forum}
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="student" />
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={() => setIsSidebarOpen((value) => !value)}>
              <Menu size={24} />
            </button>
            <h2 className="dl-topbar-title">{copy.title}</h2>
          </div>
          <div className="dl-topbar-actions">
            <LanguageSwitch compact />
          </div>
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
