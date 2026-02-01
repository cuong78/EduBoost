import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ParentLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const invitationCode = location.state?.invitationCode;
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSignIn = async (response) => {
    if (!response.credential) {
      alert('Không nhận được thông tin từ Google');
      setGoogleLoading(false);
      return;
    }

    setGoogleLoading(true);
    try {
      const success = await loginWithGoogle(response.credential);
      if (!success) {
        alert('Đăng nhập Google thất bại');
      } else if (invitationCode) {
        // If login successful and has invitation code, navigate to link page
        navigate('/parent/link', { state: { invitationCode } });
      }
      // Navigation is handled in useAuth hook
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Đăng nhập Google thất bại: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    // Wait for Google script to load, then initialize and render button
    const initGoogleButton = () => {
      if (googleClientId && window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleSignIn,
        });
        
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });
      }
    };

    if (window.google) {
      initGoogleButton();
    } else {
      // Wait for Google script to load
      const checkInterval = setInterval(() => {
        if (window.google) {
          clearInterval(checkInterval);
          initGoogleButton();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);

      return () => clearInterval(checkInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

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

      <div className="auth-separator">
        <span>Hoặc tiếp tục với</span>
      </div>

      <div className="social-login" style={{ display: 'flex', justifyContent: 'center' }}>
        {googleClientId && window.google ? (
          <div ref={googleButtonRef} style={{ width: '100%', maxWidth: '400px' }}></div>
        ) : (
          <button
            type="button"
            className="btn btn-glass social-btn full-width"
            disabled={googleLoading || isLoading || !googleClientId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem'
            }}
          >
            {googleLoading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  alt="Google" 
                  width="20" 
                  height="20"
                />
                <span>Đăng nhập với Google</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="auth-footer">
        Chưa có tài khoản? <Link to="/parent/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default ParentLogin;
