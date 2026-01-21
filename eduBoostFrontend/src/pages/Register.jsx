import { Link } from 'react-router-dom';
import { Mail, Lock, User, Check } from 'lucide-react';

const Register = () => {
    return (
        <div className="auth-card glass">
            <h2>Tạo tài khoản mới</h2>
            <p className="auth-subtitle">Bắt đầu hành trình giáo dục số ngay hôm nay.</p>

            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Họ</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input type="text" placeholder="Nguyễn" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Tên</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input type="text" placeholder="Văn A" />
                        </div>
                    </div>
                </div>

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

                <div className="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input type="password" placeholder="••••••••" />
                    </div>
                </div>

                <div className="form-options">
                    <label className="checkbox">
                        <input type="checkbox" />
                        <span>Tôi đồng ý với <Link to="#">Điều khoản sử dụng</Link></span>
                    </label>
                </div>

                <button className="btn btn-primary full-width">Đăng ký ngay</button>
            </form>

            <p className="auth-footer" style={{ marginTop: '2rem' }}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default Register;
