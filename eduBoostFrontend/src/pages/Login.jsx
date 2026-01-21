import { Link } from 'react-router-dom';
import { Mail, Lock, Check } from 'lucide-react';

const Login = () => {
  return (
    <div className="auth-card glass">
      <h2>Chào mừng trở lại!</h2>
      <p className="auth-subtitle">Đăng nhập để tiếp tục hành trình của bạn.</p>

      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder="name@example.com" />
          </div>
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder="••••••••" />
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox">
            <input type="checkbox" /> Ghi nhớ đăng nhập
          </label>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <button className="btn btn-primary full-width">Đăng nhập</button>
      </form>

      <div className="auth-separator">
        <span>Hoặc tiếp tục với</span>
      </div>

      <div className="social-login">
        <button className="btn btn-glass social-btn">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
          Google
        </button>
        <button className="btn btn-glass social-btn">
          <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width="20" />
          Facebook
        </button>
      </div>

      <p className="auth-footer">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default Login;
