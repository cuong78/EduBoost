import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const ParentLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="parent-layout">
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <Link to="/parent" className="logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/parent"
            className={`nav-item ${location.pathname === "/parent" ? "active" : ""}`}
          >
            <LayoutDashboard size={20} /> Trang chủ
          </Link>
          <Link
            to="/parent/students"
            className={`nav-item ${location.pathname.startsWith("/parent/students") ? "active" : ""}`}
          >
            <Users size={20} /> Con của tôi
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} /> Đăng xuất
          </button>
          <div className="user-profile">
            <div className="avatar">
              {user?.username?.substring(0, 2).toUpperCase() ||
                user?.fullName?.substring(0, 2).toUpperCase() ||
                "PH"}
            </div>
            <div className="user-info">
              <span className="name">
                {user?.username || user?.fullName || "Phụ huynh"}
              </span>
              <span className="role">Phụ huynh</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="topbar glass">
          <h2>Khu vực Phụ huynh</h2>
          <div className="topbar-actions" />
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>

      <style>{`
                .parent-layout {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    min-height: 100vh;
                    background: var(--color-bg-primary);
                }

                .sidebar {
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--glass-border);
                    padding: 1.5rem;
                }

                .sidebar-header {
                    margin-bottom: 3rem;
                }

                .logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }

                .logo img {
                    height: 32px;
                    width: auto;
                }

                .logo span {
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                    font-size: 1rem;
                    text-decoration: none;
                }

                .nav-item:hover, .nav-item.active {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }

                .nav-item.active {
                    background: linear-gradient(90deg, rgba(96, 78, 255, 0.1) 0%, transparent 100%);
                    border-left: 3px solid var(--color-accent-1);
                }

                .sidebar-footer {
                    border-top: 1px solid rgba(0,0,0,0.05);
                    padding-top: 1.5rem;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 1rem;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--color-accent-1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.9rem;
                }

                .user-info .name { font-weight: 600; }
                .user-info .role { font-size: 0.8rem; color: var(--color-text-secondary); }

                .dashboard-content {
                    display: flex;
                    flex-direction: column;
                }

                .topbar {
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    border-bottom: 1px solid var(--glass-border);
                    background: rgba(255,255,255,0.5);
                }

                .page-container {
                    padding: 2rem;
                    flex: 1;
                    overflow-y: auto;
                }
            `}</style>
    </div>
  );
};

export default ParentLayout;
