import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { LayoutDashboard, LogOut, Users, Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "../styles/dashboard-layout.css";

const ParentLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && (
        <div className="dl-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`dl-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="dl-sidebar-header">
          <Link to="/parent" className="dl-logo">
            <img src={logo} alt="EduBoost" />
            <span>EduBoost</span>
          </Link>
        </div>

        <nav className="dl-nav">
          <Link
            to="/parent"
            className={`dl-nav-item ${location.pathname === "/parent" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} /> Trang chủ
          </Link>
          <Link
            to="/parent/students"
            className={`dl-nav-item ${location.pathname.startsWith("/parent/students") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <Users size={20} /> Con của tôi
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <button className="dl-nav-item" onClick={handleLogout}>
            <LogOut size={20} /> Đăng xuất
          </button>
          <div className="dl-user-profile">
            <div className="dl-avatar">
              {user?.username?.substring(0, 2).toUpperCase() ||
                user?.fullName?.substring(0, 2).toUpperCase() ||
                "PH"}
            </div>
            <div className="dl-user-info">
              <span className="dl-user-name">
                {user?.username || user?.fullName || "Phụ huynh"}
              </span>
              <span className="dl-user-role">Phụ huynh</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="dl-topbar-title">Khu vực Phụ huynh</h2>
          </div>
          <div className="dl-topbar-actions" />
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ParentLayout;
