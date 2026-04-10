import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  House,
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
  Sparkles,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import GuidedTour from "../components/common/GuidedTour";
import WelcomeModal from "../components/common/WelcomeModal";
import { TEACHER_SIDEBAR_STEPS } from "../utils/tourSteps";
import "../styles/dashboard-layout.css";
import "../styles/guided-tour.css";

const PENDING_TEACHER_TOUR_KEY = "eduboost_pending_teacher_tour";

const TeacherLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [runSidebarTour, setRunSidebarTour] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const shouldRunTour = localStorage.getItem(PENDING_TEACHER_TOUR_KEY) === "true";
    if (shouldRunTour) {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(true);
      }
      setShowWelcomeModal(true);
    }
  }, []);

  const startSidebarTour = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(true);
    }
    setShowWelcomeModal(false);
    setRunSidebarTour(false);
    setTimeout(() => setRunSidebarTour(true), 320);
  };

  const skipSidebarTour = () => {
    localStorage.removeItem(PENDING_TEACHER_TOUR_KEY);
    setShowWelcomeModal(false);
    setRunSidebarTour(false);
  };

  const handleSidebarTourFinish = () => {
    localStorage.removeItem(PENDING_TEACHER_TOUR_KEY);
    setRunSidebarTour(false);
  };

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
            to="/teacher/home"
            className={`dl-nav-item ${isActive("/teacher/home") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <House size={20} /> <span className="dl-nav-label">Màn hình chính</span>
          </Link>
          <Link
            to="/teacher/classes"
            className={`dl-nav-item ${location.pathname.startsWith("/teacher/classes") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-classes"
          >
            <Users size={20} /> <span className="dl-nav-label">Lớp học</span>
          </Link>
          <Link
            to="/teacher/create-question"
            className={`dl-nav-item dl-nav-highlight ${isActive("/teacher/create-question") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-create-question"
          >
            <PenLine size={20} /> <span className="dl-nav-label">Tạo câu hỏi</span>
          </Link>
          <Link
            to="/teacher/question-bank"
            className={`dl-nav-item ${isActive("/teacher/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-question-bank"
          >
            <Library size={20} /> <span className="dl-nav-label">Ngân hàng câu hỏi</span>
          </Link>
          <Link
            to="/teacher/resources"
            className={`dl-nav-item ${isActive("/teacher/resources") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-resources"
          >
            <FolderOpen size={20} /> <span className="dl-nav-label">Quản lý tài nguyên</span>
          </Link>
          <Link
            to="/teacher/matrix-templates"
            className={`dl-nav-item dl-nav-highlight ${isActive("/teacher/matrix-templates") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-matrix"
          >
            <Table2 size={20} /> <span className="dl-nav-label">Quản lý ma trận</span>
          </Link>
          <Link
            to="/teacher/exams"
            className={`dl-nav-item ${location.pathname.startsWith("/teacher/exams") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-exams"
          >
            <ClipboardList size={20} /> <span className="dl-nav-label">Quản lý đề thi</span>
          </Link>
          <Link
            to="/teacher/create-exam"
            className={`dl-nav-item dl-nav-highlight ${isActive("/teacher/create-exam") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-create-exam"
          >
            <FilePlus size={20} /> <span className="dl-nav-label">Tạo đề thi</span>
          </Link>
          <Link
            to="/teacher/feedback"
            className={`dl-nav-item ${isActive("/teacher/feedback") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-feedback"
          >
            <Send size={20} /> <span className="dl-nav-label">Góp ý</span>
          </Link>
          {/* Tạm ẩn - Gói đăng ký
          <Link
            to="/teacher/subscription"
            className={`dl-nav-item ${isActive("/teacher/subscription") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Gem size={20} /> <span className="dl-nav-label">Gói đăng ký</span>
          </Link>
          */}

          {/* Divider + Guide link */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", margin: "8px 0" }} />
          <Link
            to="/teacher/guide"
            className={`dl-nav-item ${isActive("/teacher/guide") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-guide"
          >
            <BookOpen size={20} /> <span className="dl-nav-label">Hướng dẫn</span>
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <UserMenu userType="teacher" />
        </div>
      </aside>

      <main className="dl-main">
        {showWelcomeModal && (
          <WelcomeModal
            ignoreSeen
            onStartTour={startSidebarTour}
            onSkip={skipSidebarTour}
          />
        )}
        <GuidedTour
          steps={TEACHER_SIDEBAR_STEPS}
          tourKey="teacher_sidebar"
          run={runSidebarTour}
          onFinish={handleSidebarTourFinish}
        />
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          </div>
          <div className="dl-topbar-actions">
            <button
              type="button"
              className="tour-help-btn"
              onClick={startSidebarTour}
              aria-label="Xem hướng dẫn"
            >
              <Sparkles size={16} />
              <span>Hướng dẫn nhanh</span>
            </button>
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
