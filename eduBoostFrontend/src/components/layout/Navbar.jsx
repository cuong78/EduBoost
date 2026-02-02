import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Users } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showParentMenu, setShowParentMenu] = useState(false);
  const parentMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (parentMenuRef.current && !parentMenuRef.current.contains(event.target)) {
        setShowParentMenu(false);
      }
    };

    if (showParentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showParentMenu]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="logo">
          <img src={logo} alt="EduBoost Logo" height="40" />
          <span>EduBoost</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Trang chủ</Link>
          <a href="#quiz" className="nav-link">Quiz AI</a>
          <div className="parent-menu-wrapper" ref={parentMenuRef}>
            <button 
              className="nav-link parent-menu-trigger"
              onClick={() => setShowParentMenu(!showParentMenu)}
              onMouseEnter={() => setShowParentMenu(true)}
            >
              <Users size={16} style={{ marginRight: '0.5rem' }} />
              Phụ huynh
              <ChevronDown size={14} style={{ marginLeft: '0.5rem', transition: 'transform 0.3s', transform: showParentMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {showParentMenu && (
              <div className="parent-dropdown" onMouseLeave={() => setShowParentMenu(false)}>
                <Link to="/parent/login" className="dropdown-item" onClick={() => setShowParentMenu(false)}>
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
          <Link to="/register" className="nav-link">Đăng ký</Link>
          <Link to="/login" className="nav-link">Đăng nhập</Link>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 95%;
          max-width: 1100px;
          height: 72px;
          z-index: 1000;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 1rem;
        }

        /* Default state (semi-transparent pill) */
        .navbar {
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }

        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .navbar-content {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0 1rem;
          position: relative; /* Anchor for absolute centering */
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-accent-dark);
          text-decoration: none;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 2; /* Ensure logo is clickable above absolute center */
        }

        .logo img {
            height: 40px;
            width: auto;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .nav-link {
          font-weight: 600;
          color: var(--color-text-secondary);
          transition: all 0.3s ease;
          font-size: 0.95rem;
          text-decoration: none;
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          position: relative;
        }

        .nav-link:hover {
          color: var(--color-accent-dark);
          background: rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .parent-menu-wrapper {
          position: relative;
        }

        .parent-menu-trigger {
          display: flex;
          align-items: center;
          cursor: pointer;
          border: none;
          background: none;
          font-family: inherit;
        }

        .parent-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          padding: 0.5rem;
          min-width: 160px;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .dropdown-item {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--color-text-primary);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .dropdown-item:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-accent-1);
        }

        @media (max-width: 968px) {
          .navbar {
            top: 0;
            left: 0;
            transform: none;
            width: 100%;
            border-radius: 0;
            max-width: none;
            border-left: none;
            border-right: none;
            border-top: none;
            justify-content: center;
          }
          
          .navbar-content {
             justify-content: center;
          }

          .nav-links {
            display: none;
          }
          
          .logo {
             margin: 0;
          }

          .parent-dropdown {
            left: auto;
            right: 0;
            transform: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
