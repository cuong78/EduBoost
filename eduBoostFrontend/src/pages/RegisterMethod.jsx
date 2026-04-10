import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RegisterMethod = () => {
    const navigate = useNavigate();
    const { loginWithGoogle, isLoading } = useAuth();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);
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
        // Wait for Google script to load
        if (window.google) {
            setGoogleReady(true);
        } else {
            const checkInterval = setInterval(() => {
                if (window.google) {
                    setGoogleReady(true);
                    clearInterval(checkInterval);
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);

            return () => clearInterval(checkInterval);
        }
    }, []);

    useEffect(() => {
        // Initialize and render button when Google is ready and ref is available
        if (!googleClientId || !googleReady || !googleButtonRef.current) {
            return;
        }

        const initGoogleButton = () => {
            if (googleButtonRef.current) {
                // Clear any existing button first
                if (googleButtonRef.current.firstChild) {
                    googleButtonRef.current.innerHTML = '';
                }
                
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleSignIn,
                });
                
                try {
                    window.google.accounts.id.renderButton(googleButtonRef.current, {
                        theme: 'outline',
                        size: 'large',
                        type: 'standard',
                        text: 'signin_with',
                        shape: 'rectangular',
                        logo_alignment: 'left',
                        width: '100%',
                    });
                    console.log('Google button rendered successfully in RegisterMethod');
                } catch (error) {
                    console.error('Error rendering Google button:', error);
                }
            }
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(initGoogleButton, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [googleClientId, googleReady]);

    return (
        <div className="auth-card glass">
            <h2>Đăng ký</h2>
            <p className="auth-subtitle">Hãy chọn phương thức đăng ký</p>

            <div style={{ marginTop: '2rem' }}>
                {/* Google Sign-In Button */}
                <div 
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        width: '100%'
                    }}
                >
                    {/* Always render the container, Google button will be rendered inside by useEffect */}
                    <div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: '40px' }}></div>
                </div>

                <div className="auth-separator">
                    <span>Hoặc</span>
                </div>

                <button
                    type="button"
                    className="btn btn-glass social-btn full-width"
                    onClick={() => navigate('/register/email')}
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        marginTop: '1rem'
                    }}
                >
                    <Mail size={20} />
                    <span>Đăng ký bằng email và mật khẩu</span>
                </button>
            </div>

            <p className="auth-footer" style={{ marginTop: '2rem' }}>
                Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default RegisterMethod;
