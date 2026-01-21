import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { showErrorToast, showSuccessToast } from '../utils/show-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            showErrorToast('Vui lòng nhập email hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.requestPasswordReset(email);
            showSuccessToast(response.message);
            setSuccess(true);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Gửi email thất bại';
            showErrorToast(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-card glass">
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ marginBottom: '2rem', display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)' }}>
                        <CheckCircle size={48} color="#2ed573" />
                    </div>
                    <h2>Kiểm tra email của bạn</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
                        Chúng tôi đã gửi link đặt lại mật khẩu đến<br />
                        <strong>{email}</strong>
                    </p>
                    <Link to="/login" className="btn btn-primary full-width">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-card glass">
            <Link to="/login" className="back-link">
                <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>

            <h2>Quên mật khẩu?</h2>
            <p className="auth-subtitle">
                Nhập email của bạn để nhận link đặt lại mật khẩu.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Email đăng ký</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ marginLeft: '0.5rem' }}>Đang gửi...</span>
                        </>
                    ) : (
                        'Gửi link đặt lại mật khẩu'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
