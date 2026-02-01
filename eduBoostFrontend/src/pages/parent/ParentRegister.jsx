import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ParentRegister = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, isLoading } = useAuth();
    const invitationCode = location.state?.invitationCode;
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        // Username validation (6-28 characters)
        if (!formData.username.trim()) {
            newErrors.username = 'Username không được để trống';
        } else if (formData.username.length < 6 || formData.username.length > 28) {
            newErrors.username = 'Username phải có từ 6-28 ký tự';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Phone validation (10 digits)
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại phải có 10 chữ số';
        }

        // Password validation (min 6 characters)
        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
        } else if (formData.password !== formData.confirmPassword) {
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

        try {
            const dataToSend = { ...formData, role: 'parent' };
            await register(dataToSend, () => {
                setShowSuccess(true);
                // Reset form
                setFormData({
                    username: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                });
            });
        } catch (error) {
            // Error handling is done in useAuth hook
        }
    };

    if (showSuccess) {
        return (
            <div className="auth-card glass">
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#16a34a'
                    }}>
                        <CheckCircle size={48} />
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>Đăng ký thành công!</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                        Chúng tôi đã gửi email xác thực đến địa chỉ email của bạn.<br/>
                        Vui lòng kiểm tra hộp thư và nhấp vào link để xác thực tài khoản.
                    </p>
                    <Link 
                        to="/parent/login" 
                        state={invitationCode ? { invitationCode } : undefined}
                        className="btn btn-primary"
                    >
                        Đến trang đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-card glass">
            <h2>Đăng ký tài khoản phụ huynh</h2>
            <p className="auth-subtitle">Kết nối với con em qua mã mời từ giáo viên.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Tên đăng nhập (6-28 ký tự)"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.username ? 'error' : ''}
                        />
                    </div>
                    {errors.username && (
                        <span className="error-message">
                            <AlertCircle size={14} /> {errors.username}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Email <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.email ? 'error' : ''}
                        />
                    </div>
                    {errors.email && (
                        <span className="error-message">
                            <AlertCircle size={14} /> {errors.email}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label>Số điện thoại <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="input-wrapper">
                        <Phone size={18} className="input-icon" />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="0123456789 (10 chữ số)"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.phone ? 'error' : ''}
                        />
                    </div>
                    {errors.phone && (
                        <span className="error-message">
                            <AlertCircle size={14} /> {errors.phone}
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
                            placeholder="Tối thiểu 6 ký tự"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.password ? 'error' : ''}
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

                <div className="form-group">
                    <label>Xác nhận mật khẩu <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
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

                <button
                    type="submit"
                    className="btn btn-primary full-width"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ marginLeft: '0.5rem' }}>Đang đăng ký...</span>
                        </>
                    ) : (
                        'Đăng ký ngay'
                    )}
                </button>
            </form>

            <p className="auth-footer" style={{ marginTop: '2rem' }}>
                Đã có tài khoản? <Link to="/parent/login">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default ParentRegister;
