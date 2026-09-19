import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  Loader2,
} from "lucide-react";
import { enrollmentService } from "../services/enrollmentService";
import { tokenManager } from "../utils/token-manager";

export default function EnrollPage() {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [classInfo, setClassInfo] = useState(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (classId) {
      enrollmentService
        .getClassPublicInfo(classId)
        .then((data) => {
          setClassInfo(data);
        })
        .catch((err) => {
          console.error("Không thể lấy thông tin lớp:", err);
        })
        .finally(() => {
          setLoadingClass(false);
        });
    } else {
      setLoadingClass(false);
    }
  }, [classId]);

  const handleGoogleEnrollment = async (response) => {
    if (!response.credential) {
      setErrors({ global: "Không nhận được thông tin từ Google." });
      return;
    }
    if (!classId) {
      setErrors({ global: "Mã lớp học không hợp lệ hoặc thiếu trong liên kết" });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const res = await enrollmentService.enrollWithGoogle({
        idToken: response.credential,
        classId,
      });

      if (res.token) {
        tokenManager.saveToken(res.token);
      }
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }

      setResult(res);
    } catch (err) {
      console.error("Google enrollment error:", err);
      const errMsg =
        err?.response?.data?.message ||
        "Đăng ký bằng Google thất bại. Vui lòng thử lại.";
      setErrors({ global: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const initGoogleButton = () => {
      if (googleClientId && window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleEnrollment,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signup_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 320,
        });
      }
    };

    if (window.google) {
      initGoogleButton();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google) {
          clearInterval(checkInterval);
          initGoogleButton();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);

      return () => clearInterval(checkInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId, classId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Vui lòng nhập họ và tên";
    if (!form.email.trim()) {
      next.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      next.email = "Email không hợp lệ";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!classId) {
      setErrors({ global: "Mã lớp học không hợp lệ hoặc thiếu trong liên kết" });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const res = await enrollmentService.enrollStudent({
        classId,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      if (res.token) {
        tokenManager.saveToken(res.token);
      }
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }
      setResult(res);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        "Ghi danh thất bại. Vui lòng thử lại hoặc liên hệ giáo viên.";
      setErrors({ global: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToDashboard = () => {
    const hasToken = localStorage.getItem("token");
    if (hasToken) {
      window.location.href = "/student/chat";
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="enroll-page-wrapper">
      <div className="enroll-container">
        {/* Page Header */}
        <div className="enroll-header-badge">
          <div className="enroll-icon-circle">
            <GraduationCap size={32} />
          </div>
          <h1 className="enroll-title">Đăng Ký Tham Gia Lớp Học</h1>
          <p className="enroll-subtitle">
            Nền tảng Giáo dục & Quản lý thi thông minh EduBoost
          </p>
        </div>

        {/* Form Card */}
        <div className="enroll-card">
          {/* Class Banner Info */}
          {classInfo && (
            <div className="enroll-class-banner">
              <div className="class-banner-icon">
                <School size={24} />
              </div>
              <div className="class-banner-text">
                <h3 className="banner-class-title">{classInfo.className}</h3>
                <p className="banner-class-meta">
                  <span>Khối {classInfo.gradeLevelName}</span>
                  {classInfo.schoolYear && <span> • Năm học: {classInfo.schoolYear}</span>}
                </p>
                {classInfo.teacherName && (
                  <p className="banner-teacher-name">
                    👨‍🏫 Giáo viên: {classInfo.teacherName}
                  </p>
                )}
              </div>
            </div>
          )}

          {!classId && (
            <div className="enroll-alert error">
              <AlertCircle size={20} />
              <div>
                <strong>Thiếu Mã Lớp Học:</strong> Liên kết không chứa thông tin lớp. Vui lòng quét lại mã QR từ giáo viên.
              </div>
            </div>
          )}

          {/* Success View */}
          {result ? (
            <div className="enroll-success-box">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="success-headline">Ghi Danh Thành Công! 🎉</h3>

              <div className="success-info-card">
                <p>
                  <strong>Lớp học:</strong> {result.className}
                </p>
                {result.studentCode && (
                  <p>
                    <strong>Mã Học Sinh:</strong>{" "}
                    <span className="student-code-badge">{result.studentCode}</span>
                  </p>
                )}
                <p className="success-note">
                  {result.token
                    ? "Bạn đã được tự động đăng nhập với vai trò Học Sinh và ghi danh vào lớp thành công!"
                    : result.newUser
                    ? "Tài khoản học sinh mới của bạn đã được khởi tạo. Thông tin đăng nhập và mật khẩu tạm thời đã được gửi tới email của bạn."
                    : "Hệ thống đã tự động thêm lớp học này vào tài khoản của bạn."}
                </p>
              </div>

              {result.temporaryPassword && (
                <div className="temp-password-card">
                  <div className="temp-password-header">
                    <Lock size={16} />
                    <span>Mật khẩu tạm thời của bạn:</span>
                  </div>
                  <div className="temp-password-value">{result.temporaryPassword}</div>
                  <p className="temp-password-hint">
                    Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToDashboard}
                className="enroll-btn-submit text-center flex-center"
              >
                <span>{result.token ? "Vào Lớp Học Ngay" : "Đăng Nhập Ngay"}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            /* Enrollment Form */
            <div className="enroll-content-area">
              {errors.global && (
                <div className="enroll-alert error">
                  <AlertCircle size={20} />
                  <span>{errors.global}</span>
                </div>
              )}

              {/* Quick Google Enrollment */}
              <div className="google-enroll-box">
                <p className="google-enroll-label">Đăng ký & Tham gia nhanh với Google:</p>
                <div className="google-btn-container">
                  {googleClientId && window.google ? (
                    <div ref={googleButtonRef} style={{ margin: "0 auto" }} />
                  ) : (
                    <div className="google-loading-fallback">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang tải Google Sign-In...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="enroll-divider">
                <span>Hoặc nhập thông tin thủ công</span>
              </div>

              <form onSubmit={handleSubmit} className="enroll-form">
                <div className="enroll-field-group">
                  <label className="field-label">
                    Họ và tên học sinh <span className="req-star">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <User size={18} className="field-icon" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={`field-input ${errors.fullName ? "is-invalid" : ""}`}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="field-error-text">{errors.fullName}</span>
                  )}
                </div>

                <div className="enroll-field-group">
                  <label className="field-label">
                    Địa chỉ Email <span className="req-star">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <Mail size={18} className="field-icon" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hocsinh@gmail.com"
                      className={`field-input ${errors.email ? "is-invalid" : ""}`}
                    />
                  </div>
                  {errors.email ? (
                    <span className="field-error-text">{errors.email}</span>
                  ) : (
                    <span className="field-hint-text">
                      Mật khẩu và thông tin lớp học sẽ được gửi tới Email này.
                    </span>
                  )}
                </div>

                <div className="enroll-field-group">
                  <label className="field-label">
                    Số điện thoại <span className="opt-text">(Tùy chọn)</span>
                  </label>
                  <div className="field-input-wrapper">
                    <Phone size={18} className="field-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0987654321"
                      className="field-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !classId}
                  className="enroll-btn-submit"
                >
                  {submitting ? (
                    <span>Đang xử lý đăng ký...</span>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Xác Nhận Đăng Ký Lớp</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .enroll-page-wrapper {
          min-height: 100vh;
          padding: 3rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .enroll-container {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }

        .enroll-header-badge {
          text-align: center;
          margin-bottom: 2rem;
        }

        .enroll-icon-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
          margin-bottom: 1rem;
        }

        .enroll-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .enroll-subtitle {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        .enroll-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2.25rem 2rem;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.03);
        }

        .enroll-class-banner {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .class-banner-icon {
          width: 48px;
          height: 48px;
          background: #0284c7;
          color: #ffffff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
        }

        .banner-class-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0369a1;
          margin: 0 0 0.25rem 0;
        }

        .banner-class-meta {
          font-size: 0.8125rem;
          color: #0c4a6e;
          margin: 0;
          font-weight: 500;
        }

        .banner-teacher-name {
          font-size: 0.8125rem;
          color: #0369a1;
          margin: 0.25rem 0 0 0;
          font-weight: 600;
        }

        .enroll-alert {
          padding: 1rem 1.25rem;
          border-radius: 14px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .enroll-alert.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .enroll-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .enroll-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #334155;
        }

        .req-star {
          color: #ef4444;
        }

        .opt-text {
          color: #94a3b8;
          font-weight: 400;
        }

        .field-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          font-size: 0.9375rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }

        .field-input:focus {
          background: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .field-input.is-invalid {
          border-color: #ef4444;
          background: #fff5f5;
        }

        .field-error-text {
          font-size: 0.8125rem;
          color: #ef4444;
          font-weight: 500;
        }

        .field-hint-text {
          font-size: 0.775rem;
          color: #64748b;
        }

        .enroll-btn-submit {
          width: 100%;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: #ffffff;
          border: none;
          border-radius: 14px;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.35);
          transition: all 0.2s ease;
        }

        .enroll-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px -5px rgba(37, 99, 235, 0.45);
        }

        .enroll-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Success State Box */
        .enroll-success-box {
          text-align: center;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .success-icon-wrapper {
          width: 72px;
          height: 72px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .success-headline {
          font-size: 1.5rem;
          font-weight: 800;
          color: #15803d;
          margin: 0;
        }

        .success-info-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          padding: 1.25rem;
          text-align: left;
          width: 100%;
          font-size: 0.9375rem;
          color: #166534;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .student-code-badge {
          background: #dbeafe;
          color: #1d4ed8;
          font-family: monospace;
          font-weight: 800;
          padding: 0.25rem 0.625rem;
          border-radius: 8px;
        }

        .success-note {
          font-size: 0.8125rem;
          color: #15803d;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .temp-password-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 16px;
          padding: 1.25rem;
          text-align: left;
          width: 100%;
          color: #92400e;
        }

        .temp-password-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .temp-password-value {
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: 800;
          background: #ffffff;
          border: 1px solid #fcd34d;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          display: inline-block;
          color: #b45309;
          letter-spacing: 0.05em;
        }

        .temp-password-hint {
          font-size: 0.775rem;
          color: #b45309;
          margin: 0.5rem 0 0 0;
        }

        .google-enroll-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 1.25rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
        }

        .google-enroll-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #334155;
          margin: 0;
        }

        .google-btn-container {
          display: flex;
          justify-content: center;
          width: 100%;
          min-height: 44px;
        }

        .google-loading-fallback {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .enroll-divider {
          position: relative;
          text-align: center;
          margin: 1.25rem 0 1.5rem 0;
        }

        .enroll-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }

        .enroll-divider span {
          position: relative;
          background: #ffffff;
          padding: 0 0.875rem;
          font-size: 0.8125rem;
          color: #94a3b8;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
