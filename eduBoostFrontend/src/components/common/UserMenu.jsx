import { useState, useRef, useEffect } from 'react';
import { User, Settings, FileText, LogOut, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const UserMenu = ({ userType }) => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const getMenuItems = () => {
        switch (userType) {
            case 'student':
                return [
                    { icon: User, label: 'Thông tin cá nhân', link: '/student/profile?tab=account' },
                    { icon: Settings, label: 'Cài đặt', link: '/student/profile?tab=settings' },
                ];
            case 'teacher':
                return [
                    { icon: User, label: 'Hồ sơ giáo viên', link: '/teacher/profile' },
                    { icon: Settings, label: 'Cài đặt', link: '/teacher/profile?tab=settings' },
                ];
            case 'admin':
                return [
                    { icon: User, label: 'Tài khoản', link: '/admin/settings' },
                    { icon: Settings, label: 'Cài đặt hệ thống', link: '/admin/settings' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="user-menu-container" ref={menuRef}>
            {/* Trigger Area */}
            <div className="user-profile-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="avatar">
                    {user?.username?.substring(0, 2).toUpperCase() || (userType === 'admin' ? 'AD' : 'HV')}
                </div>
                <div className="user-info">
                    <span className="name">{user?.username || (userType === 'student' ? 'Học viên' : userType === 'teacher' ? 'Giáo viên' : 'Admin')}</span>
                    <span className="role">
                        {userType === 'student' ? 'Học viên' : userType === 'teacher' ? 'Giáo viên' : 'Quản trị viên'}
                    </span>
                </div>
                <div className={`arrow-icon ${isOpen ? 'open' : ''}`}>
                    <ChevronUp size={16} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="menu-dropdown glass">
                    <div className="menu-header">
                        <span className="menu-label">Tài khoản của tôi</span>
                    </div>

                    <div className="menu-items">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.link}
                                className="menu-item"
                                onClick={() => setIsOpen(false)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="menu-footer">
                        <button className="menu-item logout-red" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .user-menu-container {
                    position: relative;
                }

                .user-profile-trigger {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    user-select: none;
                }
                .user-profile-trigger:hover {
                    background: rgba(0,0,0,0.05);
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--color-accent-1, var(--ds-primary));
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .user-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    font-size: 0.9rem;
                    overflow: hidden;
                }
                .user-info .name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; }
                .user-info .role { font-size: 0.75rem; opacity: 0.7; color: inherit; }

                .arrow-icon {
                    color: #94a3b8;
                    transition: transform 0.2s;
                }
                .arrow-icon.open { transform: rotate(180deg); }

                /* Dropdown */
                .menu-dropdown {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    width: 100%;
                    margin-bottom: 10px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    border: 1px solid rgba(0,0,0,0.05);
                    padding: 8px;
                    animation: slideUp 0.2s ease-out;
                    z-index: 50;
                }

                .menu-header {
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .menu-items {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    margin-bottom: 8px;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    color: #4b5563;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                    width: 100%;
                    cursor: pointer;
                }
                .menu-item:hover {
                    background: var(--ds-border-light);
                    color: #1f293b;
                }

                .menu-footer {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 8px;
                }

                .logout-red {
                    color: var(--ds-error);
                }
                .logout-red:hover {
                    background: #fef2f2;
                    color: var(--ds-error-text);
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default UserMenu;
