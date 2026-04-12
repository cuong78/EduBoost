import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  House,
  BookOpen,
  PenLine,
  FilePlus,
  ClipboardList,
  ClipboardCheck,
  Users,
  Library,
  FolderOpen,
  Menu,
  Table2,
  Gem,
  Send,
  Sparkles,
  BarChart3,
  X,
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
            to="/teacher/assignments"
            className={`dl-nav-item ${isActive("/teacher/assignments") ? "active" : ""}`}
            onClick={closeSidebar}
            data-tour="nav-assignments"
          >
            <BarChart3 size={20} /> <span className="dl-nav-label">Thống kê</span>
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

        {/* Floating Feedback FAB — dismissible */}
        <FeedbackFAB />
      </main>
    </div>
  );
};

export default TeacherLayout;

/* ─── Dismissible Feedback FAB ─── */
const FAB_KEY = 'eduboost_fab_dismissed';

const FeedbackFAB = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(FAB_KEY) !== '1'; }
    catch { return true; }
  });

  const dismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(FAB_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fab-feedback-wrap">
        <button
          className="fab-feedback-btn"
          onClick={() => navigate('/teacher/feedback')}
          title="Gửi góp ý"
        >
          <Send size={16} />
          <span>Góp ý</span>
        </button>
        <button className="fab-feedback-close" onClick={dismiss} title="Đóng" aria-label="Đóng">
          <X size={13} />
        </button>
      </div>

      <style>{`
        .fab-feedback-wrap {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 0;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(99, 102, 241, 0.22);
          box-shadow:
            0 4px 20px rgba(99, 102, 241, 0.12),
            0 1px 4px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          overflow: hidden;
        }

        .fab-feedback-wrap:hover {
          box-shadow:
            0 8px 28px rgba(99, 102, 241, 0.2),
            0 2px 8px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .fab-feedback-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0.55rem 1rem 0.55rem 1.1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.86rem;
          font-weight: 700;
          color: #6366f1;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .fab-feedback-btn:hover { color: #4f46e5; }

        .fab-feedback-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          margin-right: 6px;
          border-radius: 50%;
          border: none;
          background: rgba(100, 116, 139, 0.1);
          color: #94a3b8;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          flex-shrink: 0;
        }

        .fab-feedback-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      `}</style>
    </>
  );
};
