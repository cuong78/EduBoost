import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/language-context";
import logo from "../../assets/logo.png";

const CTA = () => null;

const FOOTER_COPY = {
  vi: {
    brandTitle: "EduBoost",
    brandSubtitle: "Nền tảng khảo thí, LMS và AI cho giáo dục Việt Nam",
    description:
      "EduBoost giúp số hóa quy trình khảo thí, xây dựng kho nội dung và theo dõi tiến độ học tập trong một trải nghiệm nhất quán, dễ dùng cho giáo viên, học sinh và phụ huynh.",
    columns: [
      {
        title: "Khám phá",
        links: [
          { label: "Trang chủ", to: "/" },
          { label: "Về chúng tôi", to: "/about" },
          { label: "Hướng dẫn", to: "/guide" },
          { label: "Báo giá", to: "/pricing" },
        ],
      },
      {
        title: "Người dùng",
        links: [
          { label: "Giáo viên", to: "/register" },
          { label: "Phụ huynh", to: "/parent/login" },
          { label: "Đăng nhập", to: "/login" },
          { label: "Bảng điều khiển", to: "/login" },
        ],
      },
      {
        title: "Điểm mạnh",
        links: [
          { label: "Khảo thí thông minh", to: "/" },
          { label: "Ngân hàng câu hỏi", to: "/" },
          { label: "Theo dõi tiến độ", to: "/" },
          { label: "Học tập linh hoạt", to: "/" },
        ],
      },
    ],
    badges: ["AI workflow", "OCR-ready", "Role-based access", "Responsive web"],
    bottomLeft: "© 2026 EduBoost. All rights reserved.",
    bottomLinks: [
      { label: "Về chúng tôi", to: "/about" },
      { label: "Hướng dẫn", to: "/guide" },
      { label: "Đăng ký", to: "/register" },
    ],
  },
  en: {
    brandTitle: "EduBoost",
    brandSubtitle: "Assessment, LMS, and AI platform for education",
    description:
      "EduBoost helps schools and teachers digitize assessment, build reusable learning content, and track progress in one consistent experience for teachers, students, and parents.",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "Home", to: "/" },
          { label: "About us", to: "/about" },
          { label: "Guide", to: "/guide" },
          { label: "Pricing", to: "/pricing" },
        ],
      },
      {
        title: "Users",
        links: [
          { label: "Teachers", to: "/register" },
          { label: "Parents", to: "/parent/login" },
          { label: "Sign in", to: "/login" },
          { label: "Dashboard", to: "/login" },
        ],
      },
      {
        title: "Strengths",
        links: [
          { label: "Smart assessment", to: "/" },
          { label: "Question bank", to: "/" },
          { label: "Progress tracking", to: "/" },
          { label: "Flexible learning", to: "/" },
        ],
      },
    ],
    badges: ["AI workflow", "OCR-ready", "Role-based access", "Responsive web"],
    bottomLeft: "© 2026 EduBoost. All rights reserved.",
    bottomLinks: [
      { label: "About us", to: "/about" },
      { label: "Guide", to: "/guide" },
      { label: "Register", to: "/register" },
    ],
  },
};

const Footer = () => {
  const { language } = useLanguage();
  const copy = FOOTER_COPY[language];

  return (
    <footer className="site-footer">
      <div className="container site-footer__shell">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo">
              <img src={logo} alt="EduBoost" />
              <div>
                <strong>{copy.brandTitle}</strong>
                <span>{copy.brandSubtitle}</span>
              </div>
            </Link>
            <p>{copy.description}</p>
            <div className="site-footer__badges">
              {copy.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className="site-footer__columns">
            {copy.columns.map((column) => (
              <div key={column.title} className="site-footer__column">
                <h3>{column.title}</h3>
                <div className="site-footer__links">
                  {column.links.map((link) => (
                    <Link key={link.label} to={link.to}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>{copy.bottomLeft}</p>
          <div className="site-footer__bottom-links">
            {copy.bottomLinks.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          padding: 2rem 0 2.5rem;
        }

        .site-footer__shell {
          padding: 2.25rem;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.16);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(16px);
        }

        .site-footer__top {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 2rem;
        }

        .site-footer__logo {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .site-footer__logo img {
          width: 52px;
          height: 52px;
          object-fit: contain;
        }

        .site-footer__logo strong {
          display: block;
          font-size: 1.15rem;
          color: #0f172a;
        }

        .site-footer__logo span {
          display: block;
          color: #5e768d;
          font-size: 0.9rem;
          font-weight: 600;
          max-width: 32ch;
        }

        .site-footer__brand p {
          max-width: 58ch;
          color: #547086;
          line-height: 1.8;
        }

        .site-footer__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }

        .site-footer__badges span {
          padding: 0.7rem 0.95rem;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .site-footer__columns {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .site-footer__column {
          padding: 1.1rem;
          border-radius: 24px;
          background: rgba(246, 242, 255, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }

        .site-footer__column h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #0f172a;
        }

        .site-footer__links {
          display: grid;
          gap: 0.7rem;
        }

        .site-footer__links a,
        .site-footer__bottom-links a {
          color: #46627a;
          font-weight: 600;
        }

        .site-footer__links a:hover,
        .site-footer__bottom-links a:hover {
          color: #6366f1;
        }

        .site-footer__bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.4rem;
          border-top: 1px solid rgba(148, 163, 184, 0.16);
          color: #6b7f92;
          font-size: 0.92rem;
        }

        .site-footer__bottom-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        @media (max-width: 1080px) {
          .site-footer__top,
          .site-footer__columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .site-footer__shell {
            padding: 1.4rem;
            border-radius: 28px;
          }

          .site-footer__bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
};

export { CTA, Footer };
