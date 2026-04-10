import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../contexts/language-context";
import logo from "../../assets/logo.png";

const NAVBAR_COPY = {
  vi: {
    about: "Về chúng tôi",
    guide: "Hướng dẫn",
    start: "Bắt đầu miễn phí",
    dashboard: "Bảng điều khiển",
    brandSubtitle: "Khảo thí, LMS & AI",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
  },
  en: {
    about: "About us",
    guide: "Guide",
    start: "Start free",
    dashboard: "Dashboard",
    brandSubtitle: "Assessment, LMS & AI",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
};

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", short: "VI" },
  { code: "en", label: "English", short: "EN" },
];

const LanguageSwitcher = ({ mobile = false }) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div
      className={`lang-dropdown ${mobile ? "lang-dropdown--mobile" : ""}`}
      ref={ref}
    >
      <button
        type="button"
        className="lang-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe2 size={15} />
        <span>{current.short}</span>
        <ChevronDown size={13} className={`lang-dropdown__chevron ${open ? "lang-dropdown__chevron--open" : ""}`} />
      </button>
      {open && (
        <div className="lang-dropdown__panel" role="listbox">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              className={`lang-dropdown__option ${language === lang.code ? "lang-dropdown__option--active" : ""}`}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
            >
              <span className="lang-dropdown__short">{lang.short}</span>
              <span className="lang-dropdown__label">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PRODUCTS = [
  { label: "Thi - Kiểm tra online", to: "/features/exam" },
  { label: "Chuyển đổi số Nhà trường", to: "/features/digital" },
  { label: "Trộn đề - Chấm phiếu offline", to: "/features/offline" },
  { label: "Ngân hàng câu hỏi", to: "/features/question-bank" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const productRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const copy = NAVBAR_COPY[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productRef.current && !productRef.current.contains(e.target)) {
        setProductOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user || !user.roles || user.roles.length === 0) return "/login";

    const firstRole = user.roles[0];
    const roleName =
      typeof firstRole === "string" ? firstRole : firstRole.roleName;

    if (roleName === "PARENT") return "/parent";
    if (roleName === "STUDENT") return "/student";
    if (roleName === "ADMIN") return "/admin";

    return "/teacher";
  };

  const links = [
    { label: copy.about, to: "/about" },
    { label: copy.guide, to: "/guide" },
  ];

  return (
    <header className={`site-navbar ${scrolled ? "site-navbar--scrolled" : ""}`}>
      <div className="container site-navbar__inner">
        <Link to="/" className="site-navbar__brand">
          <img src={logo} alt="EduBoost" />
          <div>
            <strong>EduBoost</strong>
            <span>{copy.brandSubtitle}</span>
          </div>
        </Link>

        <nav className="site-navbar__links" aria-label="Primary navigation">
          {/* Products Dropdown */}
          <div className="nav-dropdown" ref={productRef}>
            <button
              type="button"
              className={`site-navbar__link nav-dropdown__trigger ${productOpen ? "nav-dropdown__trigger--active" : ""}`}
              onClick={() => setProductOpen((v) => !v)}
              aria-expanded={productOpen}
              aria-haspopup="true"
            >
              Sản phẩm
              <ChevronDown size={15} className={`nav-dropdown__chevron ${productOpen ? "nav-dropdown__chevron--open" : ""}`} />
            </button>
            {productOpen && (
              <div className="nav-dropdown__panel" role="menu">
                {PRODUCTS.map((p) => (
                  <Link
                    key={p.label}
                    to={p.to}
                    className="nav-dropdown__item"
                    role="menuitem"
                    onClick={() => setProductOpen(false)}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {links.map((item) => (
            <Link key={item.label} to={item.to} className="site-navbar__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-navbar__actions">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Link to={getDashboardLink()} className="site-navbar__button">
              {copy.dashboard}
            </Link>
          ) : (
            <Link to="/register" className="site-navbar__button">
              {copy.start}
            </Link>
          )}
        </div>

        <button
          type="button"
          className="site-navbar__toggle"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? copy.closeMenu : copy.openMenu}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="site-navbar__mobile">
          {/* Products section in mobile */}
          <div className="site-navbar__mobile-section-label">Sản phẩm</div>
          {PRODUCTS.map((p) => (
            <Link key={p.label} to={p.to} className="site-navbar__mobile-link site-navbar__mobile-link--sub">
              {p.label}
            </Link>
          ))}
          {links.map((item) => (
            <Link key={item.label} to={item.to} className="site-navbar__mobile-link">
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher mobile />
          {isAuthenticated ? (
            <Link to={getDashboardLink()} className="site-navbar__mobile-button">
              {copy.dashboard}
            </Link>
          ) : (
            <Link to="/register" className="site-navbar__mobile-button">
              {copy.start}
            </Link>
          )}
        </div>
      )}

      <style>{`
        .site-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0.9rem 0 0;
          transition: padding 0.25s ease;
        }

        .site-navbar--scrolled {
          padding-top: 0.38rem;
        }

        .site-navbar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 76px;
          padding-top: 0.95rem;
          padding-bottom: 0.95rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(18px);
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            backdrop-filter 0.25s ease,
            min-height 0.25s ease,
            padding-top 0.25s ease,
            padding-bottom 0.25s ease,
            border-radius 0.25s ease;
        }

        .site-navbar--scrolled .site-navbar__inner {
          min-height: 64px;
          padding-top: 0.68rem;
          padding-bottom: 0.68rem;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.44);
          border-color: rgba(148, 163, 184, 0.07);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
          backdrop-filter: blur(30px) saturate(150%);
        }

        .site-navbar__brand {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          color: #0f172a;
          font-weight: 800;
          flex-shrink: 0;
        }

        .site-navbar__brand img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          transition: width 0.25s ease, height 0.25s ease;
        }

        .site-navbar--scrolled .site-navbar__brand img {
          width: 38px;
          height: 38px;
        }

        .site-navbar__brand strong {
          display: block;
          font-size: 1.08rem;
          line-height: 1.2;
        }

        .site-navbar__brand span {
          display: block;
          color: #5e768d;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .site-navbar__links,
        .site-navbar__actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .site-navbar__link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.72rem 1rem;
          border-radius: 999px;
          color: #37536b;
          font-size: 0.96rem;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.22s ease, color 0.22s ease, padding 0.22s ease, font-size 0.22s ease;
        }

        .site-navbar--scrolled .site-navbar__link {
          padding: 0.62rem 0.92rem;
          font-size: 0.92rem;
        }

        .site-navbar__link:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }

        .site-navbar__link--parent {
          color: #37536b;
          border: 1.5px solid rgba(55, 83, 107, 0.25);
          padding: 0.55rem 1rem;
        }

        .site-navbar__link--parent:hover {
          border-color: #6366f1;
          color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
        }

        .site-navbar__mobile-link--parent {
          color: #37536b;
          font-weight: 700;
          background: rgba(246, 242, 255, 0.95);
          border: 1.5px solid rgba(55, 83, 107, 0.2);
        }

        /* ── Dropdown ── */
        .nav-dropdown {
          position: relative;
        }

        .nav-dropdown__trigger--active {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }

        .nav-dropdown__chevron {
          transition: transform 0.22s ease;
          flex-shrink: 0;
        }

        .nav-dropdown__chevron--open {
          transform: rotate(180deg);
        }

        .nav-dropdown__panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 230px;
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          animation: dropdownFadeIn 0.18s ease;
          z-index: 200;
        }

        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-dropdown__item {
          display: block;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: #244259;
          font-size: 0.93rem;
          font-weight: 600;
          transition: background 0.18s ease, color 0.18s ease;
          white-space: nowrap;
        }

        .nav-dropdown__item:hover {
          background: rgba(99, 102, 241, 0.08);
          color: #6366f1;
        }

        .site-navbar__button,
        .site-navbar__mobile-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.82rem 1.3rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          font-weight: 800;
          box-shadow: 0 14px 28px rgba(15, 124, 240, 0.2);
          transition: min-height 0.22s ease, padding 0.22s ease, box-shadow 0.22s ease;
        }

        .site-navbar--scrolled .site-navbar__button {
          min-height: 44px;
          padding: 0.72rem 1.15rem;
          box-shadow: 0 10px 20px rgba(15, 124, 240, 0.15);
        }

        /* ── Language Dropdown ── */
        .lang-dropdown {
          position: relative;
        }

        .lang-dropdown__trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #37536b;
          font-size: 0.87rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            padding 0.2s ease,
            box-shadow 0.2s ease;
        }

        .site-navbar--scrolled .lang-dropdown__trigger {
          padding: 0.38rem 0.72rem;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.04);
        }

        .lang-dropdown__trigger:hover {
          background: rgba(15, 124, 240, 0.07);
          border-color: rgba(15, 124, 240, 0.25);
          color: #0f7cf0;
        }

        .lang-dropdown__chevron {
          transition: transform 0.2s ease;
          flex-shrink: 0;
          opacity: 0.7;
        }

        .lang-dropdown__chevron--open {
          transform: rotate(180deg);
        }

        .lang-dropdown__panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 155px;
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 14px;
          box-shadow: 0 12px 36px rgba(15, 23, 42, 0.12);
          padding: 0.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          animation: dropdownFadeIn 0.18s ease;
          z-index: 300;
        }

        .lang-dropdown__option {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #244259;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .lang-dropdown__option:hover {
          background: rgba(15, 124, 240, 0.07);
          color: #0f7cf0;
        }

        .lang-dropdown__option--active {
          background: rgba(15, 124, 240, 0.1);
          color: #0f7cf0;
        }

        .lang-dropdown__short {
          font-weight: 800;
          min-width: 24px;
        }

        .lang-dropdown__label {
          color: inherit;
          font-size: 0.87rem;
        }

        .lang-dropdown--mobile .lang-dropdown__panel {
          left: 0;
          right: auto;
        }

        .site-navbar__toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.92);
          color: #0f172a;
        }

        .site-navbar__mobile {
          width: min(1200px, calc(100% - 3rem));
          margin: 0.9rem auto 0;
          display: grid;
          gap: 0.6rem;
          padding: 1rem;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(22px);
        }

        .site-navbar__mobile-link {
          padding: 0.95rem 1rem;
          border-radius: 16px;
          color: #244259;
          font-weight: 700;
          background: rgba(246, 242, 255, 0.95);
        }

        .site-navbar__mobile-link--sub {
          padding-left: 1.5rem;
          font-weight: 600;
          font-size: 0.93rem;
          background: rgba(243, 238, 255, 0.9);
        }

        .site-navbar__mobile-section-label {
          padding: 0.5rem 1rem 0.25rem;
          font-size: 0.78rem;
          font-weight: 800;
          color: #5e768d;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        @media (max-width: 1080px) {
          .site-navbar__links,
          .site-navbar__actions {
            display: none;
          }

          .site-navbar__toggle {
            display: inline-flex;
          }
        }

        @media (max-width: 640px) {
          .site-navbar {
            padding-top: 0.45rem;
          }

          .site-navbar__inner {
            border-radius: 24px;
          }

          .site-navbar__brand span {
            display: none;
          }

          .site-navbar__mobile {
            width: calc(100% - 2rem);
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
