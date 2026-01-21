import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass, 4: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    // STEP 1: SEND OTP
    const handleSendOtp = (e) => {
        e.preventDefault();
        if (!email) return setError('Vui lòng nhập email');

        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    // STEP 2: VERIFY OTP
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;

        let newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length < 6) return setError('Vui lòng nhập đủ 6 số OTP');

        setLoading(true);
        setError('');

        // Simulate Verify API
        setTimeout(() => {
            setLoading(false);
            if (otpValue !== '123456') {
                setError('Mã OTP không đúng (Gợi ý: 123456)');
            } else {
                setStep(3);
            }
        }, 1500);
    };

    // STEP 3: RESET PASSWORD
    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
        if (newPassword !== confirmPassword) return setError('Mật khẩu xác nhận không khớp');

        setLoading(true);
        setError('');

        // Simulate Reset API
        setTimeout(() => {
            setLoading(false);
            setStep(4);
        }, 1500);
    };

    return (
        <div className="auth-card glass">
            {/* Back Link */}
            {step !== 4 && (
                <Link to="/login" className="back-link">
                    <ArrowLeft size={16} /> Quay lại đăng nhập
                </Link>
            )}

            {/* Header */}
            <h2>
                {step === 1 && 'Quên mật khẩu?'}
                {step === 2 && 'Xác thực OTP'}
                {step === 3 && 'Đặt lại mật khẩu'}
                {step === 4 && 'Hoàn tất!'}
            </h2>
            <p className="auth-subtitle">
                {step === 1 && 'Nhập email của bạn để nhận mã xác thực.'}
                {step === 2 && `Mã xác thực đã được gửi tới ${email}`}
                {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn.'}
                {step === 4 && 'Mật khẩu của bạn đã được cập nhật thành công.'}
            </p>

            {/* Error Message */}
            {error && (
                <div style={{ color: '#ff4757', background: 'rgba(255, 71, 87, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {/* STEP 1: EMAIL */}
            {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                        <label>Email đăng ký</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Gửi mã OTP <ArrowRight size={18} /></span>}
                    </button>
                </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                    <div className="otp-container">
                        {otp.map((data, index) => (
                            <input
                                className="otp-input"
                                type="text"
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={e => handleOtpChange(e.target, index)}
                                onFocus={e => e.target.select()}
                            />
                        ))}
                    </div>
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : 'Xác nhận OTP'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button type="button" className="text-link" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-accent-1)', fontWeight: 600, cursor: 'pointer' }}>
                            Gửi lại mã?
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                placeholder="Ít nhất 6 ký tự"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : 'Đổi mật khẩu'}
                    </button>
                </form>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ marginBottom: '2rem', display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)' }}>
                        <CheckCircle size={48} color="#2ed573" />
                    </div>
                    <button onClick={() => navigate('/login')} className="btn btn-primary full-width" style={{ background: '#2ed573', border: 'none' }}>
                        Đăng nhập ngay
                    </button>
                </div>
            )}

            <style>{`
        .otp-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 2rem 0;
        }
        .otp-input {
          width: 50px !important; 
          height: 55px;
          padding: 0 !important;
          text-align: center;
          font-size: 1.5rem !important;
          font-weight: bold;
          border: 2px solid rgba(255,255,255,0.3) !important;
          border-radius: 12px !important;
          background: rgba(255,255,255,0.2) !important;
          color: inherit;
        }
        .otp-input:focus {
          border-color: var(--color-accent-1) !important;
          background: rgba(255,255,255,0.4) !important;
          box-shadow: 0 0 0 4px rgba(96, 78, 255, 0.1) !important;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default ForgotPassword;
