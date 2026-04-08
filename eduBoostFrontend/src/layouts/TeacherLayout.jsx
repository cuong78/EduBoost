import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  BookOpen,
  ClipboardList,
  FilePlus,
  FolderOpen,
  Gem,
  Library,
  Menu,
  PenLine,
  Send,
  Table2,
  Users,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import LanguageSwitch from "../components/common/LanguageSwitch";
import { useLanguage } from "../contexts/language-context";
import "../styles/dashboard-layout.css";

const TeacherLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();

  const copy =
    language === "vi"
      ? {
          classes: "Lớp học",
          createQuestion: "Tạo câu hỏi",
          questionBank: "Ngân hàng câu hỏi",
          resources: "Quản lý tài nguyên",
          matrix: "Quản lý ma trận",
          exams: "Quản lý đề thi",
          createExam: "Tạo đề thi",
          feedback: "Góp ý",
          subscription: "Gói đăng ký",
          guide: "Hướng dẫn",
        }
      : {
          classes: "Classes",
          createQuestion: "Create questions",
          questionBank: "Question bank",
          resources: "Resources",
          matrix: "Matrix templates",
          exams: "Exam management",
          createExam: "Create exam",
          feedback: "Feedback",
          subscription: "Subscriptions",
          guide: "Guide",
        };

  const isActive = (path) => location.pathname === path;
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const items = [
    {
      to: "/teacher/classes",
      active: location.pathname.startsWith("/teacher/classes"),
      icon: Users,
      label: copy.classes,
    },
    {
      to: "/teacher/create-question",
      active: isActive("/teacher/create-question"),
      icon: PenLine,
      label: copy.createQuestion,
      highlight: true,
    },
    {
      to: "/teacher/question-bank",
      active: isActive("/teacher/question-bank"),
      icon: Library,
      label: copy.questionBank,
    },
    {
      to: "/teacher/resources",
      active: isActive("/teacher/resources"),
      icon: FolderOpen,
      label: copy.resources,
    },
    {
      to: "/teacher/matrix-templates",
      active: isActive("/teacher/matrix-templates"),
      icon: Table2,
      label: copy.matrix,
      highlight: true,
    },
    {
      to: "/teacher/exams",
      active: location.pathname.startsWith("/teacher/exams"),
      icon: ClipboardList,
      label: copy.exams,
    },
    {
      to: "/teacher/create-exam",
      active: isActive("/teacher/create-exam"),
      icon: FilePlus,
      label: copy.createExam,
      highlight: true,
    },
    {
      to: "/teacher/feedback",
      active: isActive("/teacher/feedback"),
      icon: Send,
      label: copy.feedback,
    },
    {
      to: "/teacher/subscription",
      active: isActive("/teacher/subscription"),
      icon: Gem,
      label: copy.subscription,
    },
  ];

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && <div className="dl-overlay" onClick={closeSidebar}></div>}

      <aside className={`dl-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="dl-sidebar-header">
          <div className="dl-logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost</span>
          </div>
        </div>

        <nav className="dl-nav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`dl-nav-item ${item.highlight ? "dl-nav-highlight" : ""} ${
                  item.active ? "active" : ""
                }`}
                onClick={closeSidebar}
              >
                <Icon size={20} /> {item.label}
              </Link>
            );
          })}

          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", margin: "8px 0" }} />
          <Link
            to="/teacher/guide"
            className={`dl-nav-item ${isActive("/teacher/guide") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <BookOpen size={20} /> {copy.guide}
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="teacher" />
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={() => setIsSidebarOpen((value) => !value)}>
              <Menu size={24} />
            </button>
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

export default TeacherLayout;
