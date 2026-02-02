import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username không được để trống';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }

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
      // If there's an invitation code, redirect to link page after login
      const redirectTo = invitationCode ? `/parent/link` : '/parent';
      await login(formData, null, { redirectTo });
      // If login successful and has invitation code, navigate to link page with code
      if (invitationCode) {
        navigate('/parent/link', { state: { invitationCode } });
      }
    } catch (error) {
      // Error handling is done in useAuth hook
    }
  };

  return (
    <div className="auth-card glass">
      <h2>Đăng nhập Phụ huynh</h2>
      <p className="auth-subtitle">Kết nối với con em của bạn qua EduBoost</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username hoặc Email <span style={{ color: '#DC2626' }}>*</span></label>
          <div className="input-wrapper">
            <User size={18} className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="email@example.com"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.username ? 'error' : ''}
              autoComplete="username"
            />
          </div>
          {errors.username && (
            <span className="error-message">
              <AlertCircle size={14} /> {errors.username}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Mật khẩu <span style={{ color: '#DC2626' }}>*</span></label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">
              <AlertCircle size={14} /> {errors.password}
            </span>
          )}
        </div>

        <div className="form-options" style={{ justifyContent: 'flex-end' }}>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary full-width"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ marginLeft: '0.5rem' }}>Đang đăng nhập...</span>
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <p className="auth-footer" style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-secondary)' }}>
        Liên hệ giáo viên để được cấp tài khoản phụ huynh
      </p>
    </div>
  );
};

export default ParentLogin;
