import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2, Eye, EyeOff, Users, BookOpen, Shield, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ParentLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const invitationCode = location.state?.invitationCode;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username không được để trống';
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const redirectTo = invitationCode ? `/parent/link` : '/parent';
      await login(formData, null, { redirectTo });
      if (invitationCode) {
        navigate('/parent/link', { state: { invitationCode } });
      }
    } catch (error) {
      // Error handling is done in useAuth hook
    }
  };

  return (
    <div className="parent-login-page">
      {/* Left Hero Panel */}
      <div className="parent-hero-panel">
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={14} />
            <span>Khu vực Phụ huynh</span>
          </div>

          <h1 className="hero-title">
            Đồng hành cùng<br />
            con trên hành trình<br />
            <span className="hero-highlight">học tập</span>
          </h1>

          <p className="hero-desc">
            Theo dõi tiến độ, kết nối với giáo viên và hỗ trợ con em học tốt hơn mỗi ngày.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <BookOpen size={18} />
              </div>
              <span>Xem kết quả học tập theo thời gian thực</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={18} />
              </div>
              <span>Kết nối với giáo viên và lớp học</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Heart size={18} />
              </div>
              <span>Hỗ trợ con phát triển toàn diện</span>
            </div>
          </div>

          {/* Decorative blobs */}
          <div className="hero-blob blob-a" />
          <div className="hero-blob blob-b" />
          <div className="hero-blob blob-c" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="parent-form-panel">
        <div className="form-container">
          {/* Header */}
          <div className="form-header">
            <div className="form-avatar">
              <Users size={28} />
            </div>
            <h2>Đăng nhập</h2>
            <p>Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập.</p>
          </div>

          <form onSubmit={handleSubmit} className="pl-form">
            {/* Username */}
            <div className="pl-form-group">
              <label>
                Username hoặc Email
                <span className="required">*</span>
              </label>
              <div className="pl-input-wrapper">
                <User size={17} className="pl-input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="email@example.com"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.username ? 'pl-input error' : 'pl-input'}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <span className="pl-error-msg">
                  <AlertCircle size={13} /> {errors.username}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="pl-form-group">
              <label>
                Mật khẩu
                <span className="required">*</span>
              </label>
              <div className="pl-input-wrapper">
                <Lock size={17} className="pl-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.password ? 'pl-input error' : 'pl-input'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pl-pw-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <span className="pl-error-msg">
                  <AlertCircle size={13} /> {errors.password}
                </span>
              )}
            </div>

            {/* Forgot password */}
            <div className="pl-forgot">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="pl-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="pl-spinner" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <p className="pl-footer-note">
            Chưa có tài khoản? Liên hệ giáo viên để được cấp.
          </p>

          <Link to="/" className="pl-back-home">
            ← Về trang chủ
          </Link>
        </div>
      </div>

      <style>{`
        .parent-login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* ── LEFT HERO PANEL ── */
        .parent-hero-panel {
          position: relative;
          background: linear-gradient(135deg, #6c3fff 0%, #a78bfa 50%, #c084fc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 3rem 2.5rem;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          color: white;
          max-width: 400px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.75rem;
          letter-spacing: 0.3px;
        }

        .hero-title {
          font-size: 2.6rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.25rem;
          letter-spacing: -0.5px;
        }

        .hero-highlight {
          background: linear-gradient(90deg, #fde68a, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 1rem;
          line-height: 1.7;
          opacity: 0.88;
          margin-bottom: 2.5rem;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          opacity: 0.92;
        }

        .feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Decorative blobs */
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
        }
        .blob-a {
          width: 300px; height: 300px;
          background: #a855f7;
          top: -80px; right: -60px;
        }
        .blob-b {
          width: 250px; height: 250px;
          background: #7c3aed;
          bottom: -60px; left: -40px;
        }
        .blob-c {
          width: 180px; height: 180px;
          background: #f0abfc;
          top: 50%; right: 20px;
          transform: translateY(-50%);
        }

        /* ── RIGHT FORM PANEL ── */
        .parent-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #fafafa;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-avatar {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, #6c3fff, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 24px rgba(108, 63, 255, 0.3);
        }

        .form-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e1b4b;
          margin-bottom: 0.4rem;
        }

        .form-header p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Form fields */
        .pl-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .pl-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .pl-form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .required {
          color: #ef4444;
          margin-left: 1px;
        }

        .pl-input-wrapper {
          position: relative;
        }

        .pl-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          z-index: 2;
        }

        .pl-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-family: inherit;
          font-size: 0.95rem;
          color: #111827;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .pl-input:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }

        .pl-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .pl-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .pl-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pl-pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
          z-index: 2;
        }

        .pl-pw-toggle:hover { color: #7c3aed; }
        .pl-pw-toggle:focus { outline: none; }

        .pl-error-msg {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .pl-forgot {
          text-align: right;
          margin-top: -0.5rem;
        }

        .pl-forgot a {
          font-size: 0.85rem;
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .pl-forgot a:hover { opacity: 0.75; }

        .pl-submit-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c3fff, #a78bfa);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s;
          box-shadow: 0 4px 14px rgba(108, 63, 255, 0.35);
          letter-spacing: 0.2px;
          margin-top: 0.25rem;
        }

        .pl-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(108, 63, 255, 0.45);
        }

        .pl-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .pl-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .pl-spinner {
          animation: plSpin 1s linear infinite;
        }

        @keyframes plSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .pl-footer-note {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .pl-back-home {
          display: block;
          text-align: center;
          margin-top: 0.75rem;
          font-size: 0.85rem;
          color: #7c3aed;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .pl-back-home:hover { opacity: 0.7; }

        /* Responsive: stack on mobile */
        @media (max-width: 768px) {
          .parent-login-page {
            grid-template-columns: 1fr;
          }

          .parent-hero-panel {
            padding: 2.5rem 1.5rem;
            min-height: 220px;
          }

          .hero-title {
            font-size: 1.8rem;
          }

          .hero-features {
            display: none;
          }

          .parent-form-panel {
            padding: 2.5rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentLogin;
