import { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  FileQuestion,
  BarChart3,
  WandSparkles,
  ArrowRight,
  X,
} from "lucide-react";

/**
 * WelcomeModal — Hiển thị 1 lần duy nhất khi Teacher đăng nhập lần đầu.
 *
 * Props:
 *  - onStartTour: () => void — callback bắt đầu guided tour
 *  - onSkip: () => void — callback bỏ qua
 */
const STORAGE_KEY = "eduboost_teacher_welcome_seen";

const WelcomeModal = ({ onStartTour, onSkip, ignoreSeen = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (ignoreSeen) {
      setVisible(true);
      return;
    }

    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, [ignoreSeen]);

  const handleStart = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
    if (onStartTour) onStartTour();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
    if (onSkip) onSkip();
  };

  if (!visible) return null;

  return (
    <div className="welcome-overlay" onClick={handleSkip}>
      <div
        className="welcome-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="welcome-close" onClick={handleSkip}>
          <X size={20} />
        </button>

        {/* Illustration */}
        <div className="welcome-icon-ring">
          <div className="welcome-icon-inner">
            <Sparkles size={36} color="#fff" />
          </div>
          <div className="welcome-mini-tag welcome-mini-tag-1">Teacher Workspace</div>
          <div className="welcome-mini-tag welcome-mini-tag-2">Guided Onboarding</div>
        </div>

        {/* Text */}
        <h2 className="welcome-title">
          Chào mừng đến với EduBoost! 🎉
        </h2>
        <p className="welcome-subtitle">
          Nền tảng tạo đề thi thông minh dành cho giáo viên
        </p>

        {/* Feature highlights */}
        <div className="welcome-features">
          <div className="welcome-feature">
            <span className="wf-icon" aria-hidden="true">
              <FileQuestion size={16} />
            </span>
            <div>
              <strong>Tạo câu hỏi</strong>
              <span>Nhập tay, import file, hoặc AI tự sinh</span>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="wf-icon" aria-hidden="true">
              <BarChart3 size={16} />
            </span>
            <div>
              <strong>Ma trận đề thi</strong>
              <span>Phân bổ câu theo mức nhận thức</span>
            </div>
          </div>
          <div className="welcome-feature">
            <span className="wf-icon" aria-hidden="true">
              <WandSparkles size={16} />
            </span>
            <div>
              <strong>Tạo đề thông minh</strong>
              <span>AI tự chọn & sinh câu hỏi phù hợp</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="welcome-actions">
          <button className="welcome-btn-primary" onClick={handleStart}>
            <Sparkles size={18} />
            Bắt đầu hướng dẫn
            <ArrowRight size={18} />
          </button>
          <button className="welcome-btn-skip" onClick={handleSkip}>
            Tôi đã biết, bỏ qua
          </button>
        </div>

        <p className="welcome-hint">
          💡 Bạn có thể xem lại hướng dẫn bất cứ lúc nào tại mục
          <strong> "📖 Hướng dẫn"</strong> trên thanh bên.
        </p>
      </div>
    </div>
  );
};

export default WelcomeModal;
