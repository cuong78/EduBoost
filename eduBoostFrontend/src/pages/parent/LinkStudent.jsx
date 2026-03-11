import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle, KeyRound, Users, Heart, Shield, BookOpen, ChevronDown, Check } from "lucide-react";
import { parentService } from "../../services/parentService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import { useAuth } from "../../hooks/useAuth";
import { RELATIONSHIP_OPTIONS } from "../../constants/invitation";

export default function LinkStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const roleName =
    user?.roles?.[0]?.roleName ??
    (typeof user?.roles?.[0] === "string" ? user.roles[0] : null);
  const cleanRoleName = roleName?.replace("ROLE_", "").toUpperCase();
  const isParent = cleanRoleName === "PARENT";
  const isAuthenticated = !!user;

  const [invitationCode, setInvitationCode] = useState(
    location.state?.invitationCode || "",
  );
  const [relationship, setRelationship] = useState("mother");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [linking, setLinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedRelLabel = RELATIONSHIP_OPTIONS.find(o => o.value === relationship)?.label ?? relationship;

  const handleLink = async (e) => {
    e.preventDefault();

    if (!invitationCode?.trim()) {
      setErrorMessage("Vui lòng nhập mã mời");
      return;
    }

    if (!isAuthenticated || !isParent) {
      setErrorMessage("Bạn cần đăng nhập với tài khoản phụ huynh để kết nối.");
      return;
    }

    setLinking(true);
    setErrorMessage("");

    try {
      const response = await parentService.linkStudent({
        invitationCode: invitationCode.trim(),
        relationship: relationship.toUpperCase(),
      });

      const studentName = response?.student?.fullName || "học sinh";
      showSuccessToast(`Kết nối thành công với ${studentName}`);
      navigate("/parent/students");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ?? err?.message ?? "Kết nối thất bại";
      setErrorMessage(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setLinking(false);
    }
  };

  if (!isAuthenticated || !isParent) {
    return (
      <div className="ls-page">
        <div className="ls-card">
          {/* Left Panel */}
          <div className="ls-panel-left">
            <div className="ls-panel-badge">
              <Shield size={14} /> Khu vực Phụ huynh
            </div>
            <div className="ls-panel-icon">
              <Users size={36} />
            </div>
            <h2 className="ls-panel-title">Kết nối<br />với con em</h2>
            <p className="ls-panel-desc">
              Đăng nhập để bắt đầu theo dõi hành trình học tập của con.
            </p>
            <div className="ls-panel-features">
              <div className="ls-feat"><BookOpen size={16} /> Xem kết quả học tập</div>
              <div className="ls-feat"><Heart size={16} /> Đồng hành mỗi ngày</div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="ls-panel-right">
            <h3>Đăng nhập để tiếp tục</h3>
            <p className="ls-right-sub">Bạn cần đăng nhập với tài khoản phụ huynh để sử dụng mã mời kết nối với học sinh.</p>

            <Link
              to="/parent/login"
              state={{ from: "/parent/link", invitationCode: invitationCode || undefined }}
              className="ls-submit-btn"
            >
              Đăng nhập tài khoản phụ huynh
            </Link>

            <p className="ls-note">
              Chưa có tài khoản? Liên hệ giáo viên để được cấp.
            </p>
          </div>
        </div>

        <style>{`
          ${linkStudentStyles}
        `}</style>
      </div>
    );
  }

  return (
    <div className="ls-page">
      <div className="ls-card">
        {/* Left Panel */}
        <div className="ls-panel-left">
          <div className="ls-panel-badge">
            <KeyRound size={14} /> Mã mời
          </div>
          <div className="ls-panel-icon">
            <KeyRound size={36} />
          </div>
          <h2 className="ls-panel-title">Nhập mã mời<br />từ giáo viên</h2>
          <p className="ls-panel-desc">
            Giáo viên sẽ cung cấp mã mời riêng cho từng học sinh. Nhập mã để bắt đầu kết nối.
          </p>
          <div className="ls-panel-features">
            <div className="ls-feat"><Shield size={16} /> An toàn & bảo mật</div>
            <div className="ls-feat"><Heart size={16} /> Kết nối ngay lập tức</div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="ls-panel-right">
          <h3>Thông tin kết nối</h3>

          <form onSubmit={handleLink} className="ls-form">
            <div className="ls-field">
              <label>
                Mã mời <span className="ls-required">*</span>
              </label>
              <div className="ls-input-wrap">
                <KeyRound size={17} className="ls-input-icon" />
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => {
                    setInvitationCode(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="VD: ABC123XY"
                  disabled={linking}
                  className={errorMessage ? "ls-input error" : "ls-input"}
                  autoFocus
                />
              </div>
            </div>

            <div className="ls-field">
              <label>
                Mối quan hệ với học sinh <span className="ls-required">*</span>
              </label>
              <div className="ls-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className={`ls-dropdown-trigger ${dropdownOpen ? 'open' : ''}`}
                  onClick={() => !linking && setDropdownOpen(o => !o)}
                  disabled={linking}
                >
                  <span>{selectedRelLabel}</span>
                  <ChevronDown size={17} className={`ls-dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="ls-dropdown-menu">
                    {RELATIONSHIP_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`ls-dropdown-item ${relationship === o.value ? 'selected' : ''}`}
                        onClick={() => { setRelationship(o.value); setDropdownOpen(false); }}
                      >
                        <span>{o.label}</span>
                        {relationship === o.value && <Check size={15} className="ls-dropdown-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="ls-error-box">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="ls-submit-btn"
              disabled={linking}
            >
              {linking ? (
                <>
                  <Loader2 size={18} className="ls-btn-spin" />
                  <span>Đang kết nối...</span>
                </>
              ) : (
                "Kết nối với học sinh"
              )}
            </button>
          </form>

          <Link to="/parent/students" className="ls-back-link">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>

      <style>{`
        ${linkStudentStyles}
      `}</style>
    </div>
  );
}

const linkStudentStyles = `
  .ls-page {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem 0 2rem;
    min-height: 60vh;
  }

  .ls-card {
    width: 100%;
    max-width: 780px;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(108, 63, 255, 0.18);
    border: 1px solid rgba(108, 63, 255, 0.15);
  }

  /* LEFT GRADIENT PANEL */
  .ls-panel-left {
    background: linear-gradient(145deg, #6c3fff 0%, #a78bfa 55%, #c084fc 100%);
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow: hidden;
    color: white;
  }

  .ls-panel-left::before {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    top: -60px; right: -60px;
  }

  .ls-panel-left::after {
    content: '';
    position: absolute;
    width: 150px; height: 150px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    bottom: -40px; left: -30px;
  }

  .ls-panel-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 99px;
    padding: 5px 12px;
    font-size: 0.78rem;
    font-weight: 600;
    width: fit-content;
    position: relative;
    z-index: 2;
  }

  .ls-panel-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }

  .ls-panel-title {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.25;
    margin: 0;
    position: relative; z-index: 2;
  }

  .ls-panel-desc {
    font-size: 0.9rem;
    line-height: 1.65;
    opacity: 0.88;
    margin: 0;
    position: relative; z-index: 2;
  }

  .ls-panel-features {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.5rem;
    position: relative; z-index: 2;
  }

  .ls-feat {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.92;
  }

  /* RIGHT PANEL */
  .ls-panel-right {
    background: #fafafa;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .ls-panel-right h3 {
    font-size: 1.4rem;
    font-weight: 800;
    color: #1e1b4b;
    margin: 0;
  }

  .ls-right-sub {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.6;
  }

  .ls-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .ls-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .ls-field label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .ls-required {
    color: #ef4444;
  }

  .ls-input-wrap {
    position: relative;
  }

  .ls-input-icon {
    position: absolute;
    left: 14px;
    top: 50%; transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
  }

  .ls-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border-radius: 12px;
    border: 1.5px solid #e5e7eb;
    background: white;
    font-family: inherit;
    font-size: 0.95rem;
    color: #111827;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .ls-input:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }

  .ls-input.error {
    border-color: #ef4444;
  }

  .ls-select-wrap {
    position: relative;
  }

  .ls-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1.5px solid #e5e7eb;
    background: white;
    font-family: inherit;
    font-size: 0.95rem;
    color: #111827;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .ls-select:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }

  .ls-error-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .ls-submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 0.85rem;
    border-radius: 12px;
    background: linear-gradient(135deg, #6c3fff, #a78bfa);
    color: white;
    font-size: 0.95rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 4px 14px rgba(108, 63, 255, 0.35);
    text-decoration: none;
    text-align: center;
  }

  .ls-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(108, 63, 255, 0.45);
    color: white;
  }

  .ls-submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .ls-btn-spin {
    animation: ls-spin 1s linear infinite;
  }

  @keyframes ls-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .ls-back-link {
    text-align: center;
    font-size: 0.85rem;
    color: #7c3aed;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .ls-back-link:hover { opacity: 0.7; }

  .ls-note {
    text-align: center;
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
  }

  @media (max-width: 640px) {
    .ls-card {
      grid-template-columns: 1fr;
    }
    .ls-panel-left {
      padding: 2rem 1.5rem;
    }
    .ls-panel-right {
      padding: 2rem 1.5rem;
    }
  }

  /* ── CUSTOM DROPDOWN ── */
  .ls-dropdown {
    position: relative;
    width: 100%;
  }

  .ls-dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1.5px solid #e5e7eb;
    background: white;
    font-family: inherit;
    font-size: 0.95rem;
    color: #111827;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .ls-dropdown-trigger:focus,
  .ls-dropdown-trigger.open {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }

  .ls-dropdown-trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .ls-dropdown-chevron {
    color: #9ca3af;
    flex-shrink: 0;
    transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .ls-dropdown-chevron.rotated {
    transform: rotate(180deg);
    color: #7c3aed;
  }

  .ls-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 100;
    background: white;
    border: 1.5px solid rgba(124, 58, 237, 0.2);
    border-radius: 14px;
    box-shadow: 0 8px 28px rgba(108, 63, 255, 0.15), 0 2px 8px rgba(0,0,0,0.06);
    overflow: hidden;
    animation: ls-dropdown-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes ls-dropdown-in {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .ls-dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1rem;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.92rem;
    color: #374151;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
    border-bottom: 1px solid rgba(108, 63, 255, 0.06);
  }

  .ls-dropdown-item:last-child {
    border-bottom: none;
  }

  .ls-dropdown-item:hover {
    background: rgba(108, 63, 255, 0.06);
    color: #6c3fff;
  }

  .ls-dropdown-item.selected {
    background: rgba(108, 63, 255, 0.08);
    color: #6c3fff;
    font-weight: 700;
  }

  .ls-dropdown-check {
    color: #7c3aed;
    flex-shrink: 0;
  }
`;

