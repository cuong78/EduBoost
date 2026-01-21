import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Extract token from URL
        const params = new URLSearchParams(location.hash ? location.hash.split('?')[1] : location.search);
        const tokenParam = params.get('token');
        
        if (!tokenParam) {
            showErrorToast('Token không hợp lệ');
            setTimeout(() => navigate('/forgot-password'), 2000);
        } else {
            setToken(tokenParam);
        }
    }, [location, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!newPassword) {
            newErrors.newPassword = 'Mật khẩu không được để trống';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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

        setLoading(true);
        try {
            const response = await authService.resetPassword(token, newPassword);
            showSuccessToast(response.message);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error?.message || 'Đặt lại mật khẩu thất bại';
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
                    <h2>Thành công!</h2>
                    <p className="auth-subtitle">
                        Mật khẩu của bạn đã được đặt lại thành công.<br />
                        Đang chuyển đến trang đăng nhập...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-card glass">
            <h2>Đặt lại mật khẩu</h2>
            <p className="auth-subtitle">
                Nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Mật khẩu mới <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Ít nhất 6 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            className={errors.newPassword ? 'error' : ''}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="password-toggle"
                            tabIndex={-1}
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <span className="error-message">
                            <AlertCircle size={14} /> {errors.newPassword}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Xác nhận mật khẩu <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="password-toggle"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <span className="error-message">
                            <AlertCircle size={14} /> {errors.confirmPassword}
                        </span>
                    )}
                </div>

                <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ marginLeft: '0.5rem' }}>Đang xử lý...</span>
                        </>
                    ) : (
                        'Đặt lại mật khẩu'
                    )}
                </button>
            </form>

            <p className="auth-footer">
                Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default ResetPassword;
