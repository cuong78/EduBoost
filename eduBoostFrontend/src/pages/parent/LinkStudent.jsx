import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, KeyRound, Users } from 'lucide-react';
import { parentService } from '../../services/parentService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import { useAuth } from '../../hooks/useAuth';
import { RELATIONSHIP_OPTIONS } from '../../constants/invitation';

export default function LinkStudent() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const roleName = user?.roles?.[0]?.roleName ?? (typeof user?.roles?.[0] === 'string' ? user.roles[0] : null);
    const isParent = roleName === 'PARENT';
    const isAuthenticated = !!user;

    // Get invitation code from location state (if redirected from login)
    const [invitationCode, setInvitationCode] = useState(location.state?.invitationCode || '');
    const [relationship, setRelationship] = useState('mother');
    const [linking, setLinking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLink = async (e) => {
        e.preventDefault();
        
        // Validate inputs
        if (!invitationCode?.trim()) {
            setErrorMessage('Vui lòng nhập mã mời');
            return;
        }

        if (!isAuthenticated || !isParent) {
            setErrorMessage('Bạn cần đăng nhập với tài khoản phụ huynh để kết nối.');
            return;
        }

        setLinking(true);
        setErrorMessage('');
        
        try {
            const response = await parentService.linkStudent({
                invitationCode: invitationCode.trim(),
                relationship: relationship.toUpperCase(),
            });
            
            // Show success message with student info
            const studentName = response?.student?.fullName || 'học sinh';
            showSuccessToast(`Kết nối thành công với ${studentName}`);
            
            // Navigate to students list
            navigate('/parent/students');
        } catch (err) {
            const errorMsg = err?.response?.data?.message ?? err?.message ?? 'Kết nối thất bại';
            setErrorMessage(errorMsg);
            showErrorToast(errorMsg);
        } finally {
            setLinking(false);
        }
    };

    // If not authenticated or not parent, show auth gate
    if (!isAuthenticated || !isParent) {
        return (
            <>
                <div className="auth-card glass link-student-card">
                    <h2><Users size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Đăng nhập Phụ huynh</h2>
                    <p className="auth-subtitle">Bạn cần đăng nhập với tài khoản phụ huynh để kết nối với con em</p>
                    
                    <div className="auth-gate">
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                            Vui lòng đăng nhập hoặc đăng ký tài khoản phụ huynh để sử dụng mã mời kết nối với học sinh.
                        </p>
                        <div className="auth-gate-btns">
                            <Link 
                                to="/parent/login" 
                                state={{ from: '/parent/link', invitationCode: invitationCode || undefined }}
                                className="btn btn-primary full-width"
                            >
                                Đăng nhập
                            </Link>
                            <Link 
                                to="/parent/register" 
                                state={{ from: '/parent/link', invitationCode: invitationCode || undefined }}
                                className="btn btn-glass full-width"
                            >
                                Đăng ký phụ huynh
                            </Link>
                        </div>
                    </div>
                </div>
                <style>{`
                    .link-student-card { max-width: 480px; }
                    .auth-gate { margin-top: 1rem; padding: 1.5rem; background: rgba(99,102,241,0.08); border-radius: 12px; text-align: center; }
                    .auth-gate p { margin-bottom: 1rem; color: var(--color-text-secondary); }
                    .auth-gate-btns { display: flex; flex-direction: column; gap: 0.75rem; }
                    .required { color: #dc2626; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </>
        );
    }

    // If authenticated and is parent, show link form
    return (
        <>
            <div className="auth-card glass link-student-card">
                <h2><KeyRound size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Nhập mã mời</h2>
                <p className="auth-subtitle">Nhập mã mời từ giáo viên để kết nối với con em</p>

                <form onSubmit={handleLink} className="auth-form">
                    <div className="form-group">
                        <label>Mã mời <span className="required">*</span></label>
                        <input
                            type="text"
                            value={invitationCode}
                            onChange={(e) => { setInvitationCode(e.target.value); setErrorMessage(''); }}
                            placeholder="VD: ABC123XY"
                            disabled={linking}
                            className={errorMessage ? 'error' : ''}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Mối quan hệ với học sinh <span className="required">*</span></label>
                        <select 
                            value={relationship} 
                            onChange={(e) => setRelationship(e.target.value)}
                            disabled={linking}
                        >
                            {RELATIONSHIP_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {errorMessage && (
                        <span className="error-message">
                            <AlertCircle size={14} /> {errorMessage}
                        </span>
                    )}

                    <button type="submit" className="btn btn-primary full-width" disabled={linking}>
                        {linking ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> 
                                <span style={{ marginLeft: '0.5rem' }}>Đang kết nối...</span>
                            </>
                        ) : (
                            'Kết nối với học sinh'
                        )}
                    </button>
                </form>
            </div>
            <style>{`
                .link-student-card { max-width: 480px; }
                .auth-gate { margin-top: 1rem; padding: 1.5rem; background: rgba(99,102,241,0.08); border-radius: 12px; text-align: center; }
                .auth-gate p { margin-bottom: 1rem; color: var(--color-text-secondary); }
                .auth-gate-btns { display: flex; flex-direction: column; gap: 0.75rem; }
                .required { color: #dc2626; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}
