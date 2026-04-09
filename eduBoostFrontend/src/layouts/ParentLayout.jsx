import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { LayoutDashboard, LogOut, Menu, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import LanguageSwitch from "../components/common/LanguageSwitch";
import { useLanguage } from "../contexts/language-context";
import "../styles/dashboard-layout.css";

const ParentLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();

  const copy =
    language === "vi"
      ? {
          home: "Trang chủ",
          myChildren: "Con của tôi",
          logout: "Đăng xuất",
          parent: "Phụ huynh",
          area: "Khu vực phụ huynh",
        }
      : {
          home: "Home",
          myChildren: "My children",
          logout: "Sign out",
          parent: "Parent",
          area: "Parent area",
        };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {isSidebarOpen && <div className="dl-overlay" onClick={closeSidebar}></div>}

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
            <LayoutDashboard size={20} /> {copy.home}
          </Link>
          <Link
            to="/parent/students"
            className={`dl-nav-item ${
              location.pathname.startsWith("/parent/students") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <Users size={20} /> {copy.myChildren}
          </Link>
        </nav>

        <div className="dl-sidebar-footer">
          <button className="dl-nav-item" onClick={logout}>
            <LogOut size={20} /> {copy.logout}
          </button>
          <div className="dl-user-profile">
            <div className="dl-avatar">
              {user?.username?.substring(0, 2).toUpperCase() ||
                user?.fullName?.substring(0, 2).toUpperCase() ||
                "PH"}
            </div>
            <div className="dl-user-info">
              <span className="dl-user-name">
                {user?.username || user?.fullName || copy.parent}
              </span>
              <span className="dl-user-role">{copy.parent}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-menu-toggle" onClick={() => setIsSidebarOpen((value) => !value)}>
              <Menu size={24} />
            </button>
            <h2 className="dl-topbar-title">{copy.area}</h2>
          </div>
          <div className="dl-topbar-actions">
            <LanguageSwitch compact />
          </div>
        </header>
        <div className="dl-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ParentLayout;
