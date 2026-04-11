import { useState, useEffect } from 'react';
import { User, Lock, Camera, Save, Bell, Moon, Volume2, X, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import { authService } from '../../services/authService';

import { useAuth } from '../../hooks/useAuth';

const UserProfile = () => {
    const { user: authUser } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'account';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [isEditing, setIsEditing] = useState(false);
    
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initial state from authUser
    const [user, setUser] = useState({
        username: '',
        email: '',
        phone: '',
        bio: '',
        role: ''
    });

    const isTeacherRole = String(user.role || '').toUpperCase().includes('TEACHER');

    useEffect(() => {
        if (authUser) {
            // Helper to get role name safely
            const getRoleName = (roles) => {
                if (!roles || roles.length === 0) return 'User';
                const firstRole = roles[0];
                if (typeof firstRole === 'string') return firstRole;
                if (typeof firstRole === 'object' && firstRole.roleName) return firstRole.roleName;
                return 'User';
            };

            setUser({
                username: authUser.fullName || authUser.username || '',
                email: authUser.email || '',
                phone: authUser.phoneNumber || '',
                bio: 'Chưa có thông tin giới thiệu.', // Placeholder as backend doesn't support yet
                role: getRoleName(authUser.roles)
            });
        }
    }, [authUser]);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('eduboost-theme');
        setIsDarkMode(savedTheme === 'dark');
    }, []);



    const handleSave = () => {
        // Mock API call
        setTimeout(() => {
            setIsEditing(false);
            showSuccessToast('Cập nhật thông tin thành công!');
        }, 500);
    };

    const handleToggleDarkMode = (checked) => {
        setIsDarkMode(checked);
        localStorage.setItem('eduboost-theme', checked ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', checked);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                showErrorToast('Mật khẩu mới và xác nhận mật khẩu không khớp');
                return;
            }
            if (passwordForm.newPassword.length < 6) {
                showErrorToast('Mật khẩu mới phải có ít nhất 6 ký tự');
                return;
            }
            setIsChangingPassword(true);
            await authService.changePassword(
                passwordForm.oldPassword,
                passwordForm.newPassword,
                passwordForm.confirmPassword
            );
            showSuccessToast('Đổi mật khẩu thành công');
            setShowPasswordModal(false);
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showErrorToast(err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="profile-container">
            <h1 className="page-title">Hồ sơ cá nhân</h1>

            <div className="profile-layout">
                {/* Tabs Sidebar */}
                <div className="profile-tabs glass">
                    <button
                        className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        <User size={20} /> Tài khoản
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Bell size={20} /> Cài đặt
                    </button>
                </div>

                {/* Content Area */}
                <div className="profile-content glass">
                    {activeTab === 'account' && (
                        <div className="tab-pane fade-in">
                            <h3 className="section-title">Thông tin cơ bản</h3>
                            <div className="avatar-section">
                                <div className="large-avatar">HV</div>
                                <button className="btn-icon"><Camera size={18} /></button>
                            </div>

                            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        disabled={!isEditing}
                                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={user.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={user.phone}
                                        disabled={!isEditing}
                                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giới thiệu</label>
                                    <textarea
                                        rows={3}
                                        value={user.bio}
                                        disabled={!isEditing}
                                        onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                    />
                                </div>

                                <div className="form-actions">
                                    {isEditing ? (
                                        <button className="btn btn-primary" onClick={handleSave}>
                                            <Save size={18} /> Lưu thay đổi
                                        </button>
                                    ) : (
                                        <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="divider"></div>

                            <h3 className="section-title">Bảo mật</h3>
                            <div className="security-row">
                                <div className="flex items-center gap-3">
                                    <Lock size={20} className="text-secondary" />
                                    <span>Mật khẩu</span>
                                </div>
                                <button className="btn-text" onClick={() => setShowPasswordModal(true)}>Đổi mật khẩu</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="tab-pane fade-in">
                            <h3 className="section-title">Cấu hình ứng dụng</h3>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4><Bell size={18} /> Thông báo</h4>
                                    <p>Nhận email về bài tập và lịch học mới</p>
                                </div>
                                <label className="data-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4><Moon size={18} /> Chế độ tối</h4>
                                    <p>Sử dụng giao diện tối để bảo vệ mắt</p>
                                </div>
                                <label className="data-switch">
                                    <input
                                        type="checkbox"
                                        checked={isDarkMode}
                                        onChange={(e) => handleToggleDarkMode(e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4><Volume2 size={18} /> Âm thanh</h4>
                                    <p>Hiệu ứng âm thanh khi làm bài tập</p>
                                </div>
                                <label className="data-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in">
                        <div className="modal-header">
                            <h3>Đổi mật khẩu</h3>
                            <button className="btn-icon" onClick={() => setShowPasswordModal(false)}><X size={18} /></button>
                        </div>
                        <form className="profile-form" style={{ marginTop: '20px' }} onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        required
                                        value={passwordForm.oldPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nhập lại mật khẩu mới</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)} disabled={isChangingPassword}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                                    {isChangingPassword ? 'Đang cập nhật...' : 'Xác nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .profile-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .page-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin-bottom: 2rem;
                    color: var(--color-text-primary);
                }

                .profile-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    align-items: start;
                }
                
                @media (min-width: 768px) {
                    .profile-layout {
                        grid-template-columns: 250px 1fr;
                        gap: 2rem;
                    }
                }

                .profile-tabs {
                    padding: 1rem;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: row;
                    overflow-x: auto;
                    gap: 0.5rem;
                    white-space: nowrap;
                }
                
                .profile-tabs::-webkit-scrollbar {
                    display: none;
                }
                
                @media (min-width: 768px) {
                    .profile-tabs {
                        flex-direction: column;
                        overflow-x: visible;
                    }
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--color-text-secondary);
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                @media (min-width: 768px) {
                    .tab-btn { padding: 1rem; }
                }
                .tab-btn:hover { background: rgba(0,0,0,0.05); color: var(--color-text-primary); }
                .tab-btn.active { background: var(--color-accent-1); color: white; }

                .profile-content {
                    padding: 1.5rem;
                    border-radius: 16px;
                    min-height: 500px;
                }
                
                @media (min-width: 768px) {
                    .profile-content { padding: 2.5rem; }
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: var(--color-text-primary);
                }

                /* Account Tab */
                .avatar-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 2rem;
                }
                .large-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--color-accent-2);
                    color: white;
                    font-size: 2rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-icon:hover { border-color: var(--color-accent-1); color: var(--color-accent-1); }

                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .form-group label {
                    display: block;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                }
                .form-group input, .form-group textarea {
                    width: 100%;
                    padding: 0.875rem;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #1e293b;
                    font-family: inherit;
                    font-size: 1rem;
                }
                .form-group input:disabled, .form-group textarea:disabled {
                    background: transparent;
                    border-color: transparent;
                    padding-left: 0;
                    font-weight: 600;
                }

                .divider {
                    height: 1px;
                    background: #f1f5f9;
                    margin: 2.5rem 0;
                }

                .security-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                }
                .btn-text { background: none; border: none; color: var(--color-accent-1); font-weight: 600; cursor: pointer; }


                /* Settings Toggle */
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .setting-info h4 { display: flex; align-items: center; gap: 10px; margin: 0 0 0.25rem 0; color: #334155; }
                .setting-info p { margin: 0; font-size: 0.9rem; color: #94a3b8; padding-left: 28px; }

                /* Switch CSS */
                .data-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 28px;
                }
                .data-switch input { opacity: 0; width: 0; height: 0; }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #cbd5e1;
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--color-accent-1);
                }
                input:checked + .slider:before {
                    transform: translateX(22px);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 450px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .modal-header h3 { margin: 0; font-size: 1.25rem; color: var(--color-text-primary); }

                .fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default UserProfile;
