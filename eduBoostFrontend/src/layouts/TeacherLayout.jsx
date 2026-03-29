import { useState, useCallback } from "react";
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
  HelpCircle,
} from "lucide-react";
import UserMenu from "../components/common/UserMenu";
import GuidedTour from "../components/common/GuidedTour";
import WelcomeModal from "../components/common/WelcomeModal";
import { TEACHER_SIDEBAR_STEPS, TOUR_STEPS_MAP } from "../utils/tourSteps.jsx";
import "../styles/dashboard-layout.css";
import "../styles/guided-tour.css";

const TeacherLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ─── Tour state ────────────────────────────────────────────────────────────
  const [runSidebarTour, setRunSidebarTour] = useState(false);
  const [runPageTour, setRunPageTour] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Welcome modal → start sidebar tour
  const handleStartTour = useCallback(() => {
    setRunSidebarTour(true);
  }, []);

  // After sidebar tour finishes → start page tour
  const handleSidebarTourFinish = useCallback(() => {
    setRunSidebarTour(false);
    // Small delay then launch page-specific tour
    setTimeout(() => setRunPageTour(true), 400);
  }, []);

  const handlePageTourFinish = useCallback(() => {
    setRunPageTour(false);
  }, []);

  // Help button: re-run the tour for current page
  const handleHelpClick = useCallback(() => {
    // If on a page with steps, run that tour; else run sidebar tour
    const pageSteps = TOUR_STEPS_MAP[location.pathname];
    if (pageSteps && pageSteps.length > 0) {
      setRunPageTour(true);
    } else {
      setRunSidebarTour(true);
    }
  }, [location.pathname]);

  // Get steps for current page
  const currentPageSteps = TOUR_STEPS_MAP[location.pathname] || [];

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
            data-tour="nav-classes"
          >
            <GraduationCap size={20} /> Lớp học
          </Link>
          <Link
            to="/teacher/create-question"
            className={`dl-nav-item ${isActive("/teacher/create-question") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-create-question"
          >
            <FileQuestion size={20} /> Tạo câu hỏi
          </Link>
          <Link
            to="/teacher/question-bank"
            className={`dl-nav-item ${isActive("/teacher/question-bank") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-question-bank"
          >
            <Database size={20} /> Ngân hàng câu hỏi
          </Link>
          <Link
            to="/teacher/resources"
            className={`dl-nav-item ${isActive("/teacher/resources") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-resources"
          >
            <FolderOpen size={20} /> Quản lý tài nguyên
          </Link>
          <Link
            to="/teacher/matrix-templates"
            className={`dl-nav-item ${isActive("/teacher/matrix-templates") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-matrix"
          >
            <LayoutGrid size={20} /> Quản lý ma trận
          </Link>
          <Link
            to="/teacher/exams"
            className={`dl-nav-item ${location.pathname.startsWith("/teacher/exams") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-exams"
          >
            <FileText size={20} /> Quản lý đề thi
          </Link>
          <Link
            to="/teacher/create-exam"
            className={`dl-nav-item ${isActive("/teacher/create-exam") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-create-exam"
          >
            <PenTool size={20} /> Tạo đề thi
          </Link>
          <Link
            to="/teacher/feedback"
            className={`dl-nav-item ${isActive("/teacher/feedback") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-feedback"
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

          {/* Divider + Guide link */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", margin: "8px 0" }} />
          <Link
            to="/teacher/guide"
            className={`dl-nav-item ${isActive("/teacher/guide") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-guide"
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
            <button className="tour-help-btn" onClick={handleHelpClick}>
              <HelpCircle size={18} />
              <span>Hướng dẫn</span>
            </button>
          </div>
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>

      {/* ─── Welcome Modal (first time only) ─── */}
      <WelcomeModal onStartTour={handleStartTour} onSkip={() => {}} />

      {/* ─── Sidebar Tour ─── */}
      <GuidedTour
        steps={TEACHER_SIDEBAR_STEPS}
        tourKey="teacher_sidebar"
        run={runSidebarTour}
        onFinish={handleSidebarTourFinish}
      />

      {/* ─── Page-specific Tour ─── */}
      {currentPageSteps.length > 0 && (
        <GuidedTour
          steps={currentPageSteps}
          tourKey={`teacher_page_${location.pathname}`}
          run={runPageTour}
          onFinish={handlePageTourFinish}
        />
      )}
    </div>
  );
};

export default TeacherLayout;
