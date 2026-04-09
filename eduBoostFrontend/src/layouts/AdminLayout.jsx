import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Award,
  BookOpen,
  Crown,
  FileText,
  GraduationCap,
  HelpCircle,
  Menu,
  MessageSquare,
  Users,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import LanguageSwitch from "../components/common/LanguageSwitch";
import { useLanguage } from "../contexts/language-context";
import "../styles/dashboard-layout.css";

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();

  const copy =
    language === "vi"
      ? {
          users: "Quản lý tài khoản",
          grades: "Quản lý khối",
          classes: "Quản lý lớp học",
          subjects: "Môn học",
          resources: "Tài nguyên bài học",
          questionBank: "Ngân hàng câu hỏi",
          plans: "Quản lý gói",
          feedback: "Feedback",
          title: "Khu vực quản trị",
          stable: "Trạng thái hệ thống: ổn định",
        }
      : {
          users: "User management",
          grades: "Grade management",
          classes: "Class management",
          subjects: "Subjects",
          resources: "Lesson resources",
          questionBank: "Question bank",
          plans: "Plan management",
          feedback: "Feedback",
          title: "Admin area",
          stable: "System status: stable",
        };

  const isActive = (path) => location.pathname === path;
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const items = [
    { to: "/admin/users", active: isActive("/admin/users"), icon: Users, label: copy.users },
    {
      to: "/admin/grade-levels",
      active: isActive("/admin/grade-levels"),
      icon: Award,
      label: copy.grades,
    },
    {
      to: "/admin/classes",
      active: isActive("/admin/classes"),
      icon: GraduationCap,
      label: copy.classes,
    },
    {
      to: "/admin/subjects",
      active: isActive("/admin/subjects"),
      icon: BookOpen,
      label: copy.subjects,
    },
    {
      to: "/admin/lesson-resources",
      active: isActive("/admin/lesson-resources"),
      icon: FileText,
      label: copy.resources,
    },
    {
      to: "/admin/question-bank",
      active: isActive("/admin/question-bank"),
      icon: HelpCircle,
      label: copy.questionBank,
    },
    {
      to: "/admin/subscriptions",
      active: isActive("/admin/subscriptions"),
      icon: Crown,
      label: copy.plans,
    },
    {
      to: "/admin/feedback",
      active: isActive("/admin/feedback"),
      icon: MessageSquare,
      label: copy.feedback,
    },
  ];

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && <div className="dl-overlay" onClick={closeSidebar}></div>}

      <aside className={`dl-sidebar sidebar-dark ${isSidebarOpen ? "open" : ""}`}>
        <div className="dl-sidebar-header">
          <Link to="/" className="dl-logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost Admin</span>
          </Link>
        </div>

        <nav className="dl-nav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`dl-nav-item ${item.active ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <Icon size={20} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="admin" />
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
            <span className="dl-status-badge">{copy.stable}</span>
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
