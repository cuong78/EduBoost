import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import logo from '../../assets/logo.png';


const CTA = () => {
  const ctaRef = useScrollReveal();

  return (
    <section className="cta-section" ref={ctaRef}>
      <div className="container">
        <div className="cta-box glass reveal">
          <h2>Sẵn sàng đổi mới phương pháp dạy?</h2>
          <p>Tham gia cùng hơn 10,000+ giáo viên tiên phong tại Việt Nam.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary">Đăng ký dùng thử miễn phí</button>
          </div>
        </div>
      </div>
      <style>{`
        .cta-section {
          padding: 4rem 0;
        }
        .cta-card {
          background: #1a1a2e;
          border-radius: 24px;
          padding: 4rem 2rem;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
          background-image: radial-gradient(circle at 100% 0%, rgba(96, 78, 255, 0.4) 0%, transparent 50%);
        }
        .cta-card h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .cta-card p {
          font-size: 1.25rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 2rem;
        }
      `}</style>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-col">
            <Link to="/" className="logo">
              <img src={logo} alt="EduBoost" height="40" />
              <span>EduBoost</span>
            </Link>
            <p>Nền tảng giáo dục AI hàng đầu Việt Nam.</p>
          </div>
          <div className="footer-links">
            <a href="#">Về chúng tôi</a>
            <a href="#">Điều khoản</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Liên hệ</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 EduBoost. All rights reserved.</p>
        </div>
      </div>
      <style>{`
        .footer {
          background: white;
          padding: 4rem 0 2rem;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .footer-col .logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-accent-dark);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .footer-links {
          display: flex;
          gap: 2rem;
        }
        .footer-bottom {
          text-align: center;
          color: var(--color-text-secondary);
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 2rem;
          }
          .footer-links {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </footer>
  );
};

export { CTA, Footer };
