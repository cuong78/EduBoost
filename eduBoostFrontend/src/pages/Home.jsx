import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  BookCopy,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ScanLine,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";
import { useLanguage } from "../contexts/language-context";
import "./Home.css";

const COPY = {
  vi: {
    heroBadge: "EduBoost cho giáo dục Việt Nam",
    heroSubBadge: "Khảo thí, kho nội dung và LMS trong một nền tảng",
    heroTitle: "Nền tảng kiểm tra, đánh giá và học tập thông minh cho giáo viên hiện đại",
    heroText:
      "Một không gian số hóa giúp giáo viên tạo đề, quản lý lớp, giao bài và theo dõi tiến độ học tập liền mạch hơn mỗi ngày.",
    primaryCta: "Bắt đầu miễn phí",
    secondaryCta: "Xem báo giá",
    checklist: [
      "Tạo đề nhanh từ tài liệu và ngân hàng câu hỏi",
      "Giao bài, chấm điểm và báo cáo trên một dashboard",
      "Kết nối giáo viên, học sinh và phụ huynh cùng một luồng",
    ],
    pillars: [
      {
        icon: FileText,
        title: "Khảo thí",
        description: "Tạo đề, giao bài, thu bài và theo dõi trạng thái trên một luồng liền mạch.",
      },
      {
        icon: BookCopy,
        title: "Kho nội dung",
        description: "Xây ngân hàng câu hỏi và tài nguyên để tái sử dụng lâu dài.",
      },
      {
        icon: LayoutDashboard,
        title: "Phân tích",
        description: "Đọc tiến độ, điểm số và các tín hiệu cần hỗ trợ bằng dashboard trực quan.",
      },
    ],
    mockSidebar: [
      "Dashboard lớp học",
      "Ngân hàng câu hỏi",
      "Bài tập và kiểm tra",
      "Phản hồi phụ huynh",
    ],
    mockSummary: [
      { label: "Lớp đang theo dõi", value: "12 lớp hoạt động" },
      { label: "Tiến độ tuần này", value: "84% hoàn thành" },
    ],
    audiencesHeading: {
      eyebrow: "Phù hợp cho nhiều mô hình",
      title: "EduBoost được thiết kế cho nhiều bối cảnh giảng dạy và vận hành",
      description:
        "Từ giáo viên cá nhân đến trường học và trung tâm đào tạo, nền tảng tập trung vào nhu cầu thực tế thay vì chỉ liệt kê tính năng.",
    },
    audiences: [
      {
        icon: GraduationCap,
        title: "Giáo viên cá nhân",
        description: "Giao bài, chấm điểm và theo dõi tiến độ trong một workflow gọn và rõ ràng.",
        bullets: [
          "Tạo bài kiểm tra nhanh từ tài liệu và ngân hàng câu hỏi",
          "Theo dõi điểm số theo từng lớp và từng học sinh",
        ],
      },
      {
        icon: School,
        title: "Trường học",
        description: "Phù hợp cho kiểm tra định kỳ, thi tập trung và quản lý dữ liệu học tập.",
        bullets: [
          "Phân quyền rõ ràng cho giáo viên, học sinh và phụ huynh",
          "Tổng hợp dữ liệu phục vụ báo cáo và theo dõi năng lực",
        ],
      },
      {
        icon: UsersRound,
        title: "Trung tâm đào tạo",
        description: "Chuẩn hóa quy trình khảo thí, luyện đề và theo dõi kết quả trên quy mô lớn.",
        bullets: [
          "Quản lý nhiều lớp, nhiều ca học trên cùng một nền tảng",
          "So sánh kết quả theo lớp, kỹ năng và giai đoạn học",
        ],
      },
    ],
    productsHeading: {
      eyebrow: "Sản phẩm cốt lõi",
      title: "Ba khối chức năng lớn được trình bày theo đúng thứ tự người dùng quan tâm",
      description:
        "Khảo thí, ngân hàng câu hỏi và quản lý học tập được tách rõ để người xem hiểu nhanh giá trị cốt lõi của sản phẩm.",
    },
    products: [
      {
        eyebrow: "Thi - kiểm tra",
        title: "Kiểm tra online và offline trên cùng một luồng làm việc",
        description:
          "Tạo đề, giao bài, nhận bài và phân tích kết quả mà không phải nhảy qua nhiều công cụ khác nhau.",
        tags: ["DOCX", "PDF", "XLSX"],
        bullets: [
          "Giao bài theo lớp, nhóm hoặc từng học sinh",
          "Hỗ trợ chấm phiếu và đối soát kết quả trong cùng dashboard",
        ],
      },
      {
        eyebrow: "Ngân hàng câu hỏi",
        title: "Số hóa kho câu hỏi để tái sử dụng và chuẩn hóa lâu dài",
        description:
          "Tổ chức câu hỏi theo chủ đề, độ khó và cấu trúc đề để ra đề nhanh mà vẫn giữ chất lượng.",
        tags: ["Phân loại", "Mức độ", "Chủ đề"],
        bullets: [
          "Gắn thẻ câu hỏi theo chủ đề, độ khó và dạng đề",
          "Lọc câu trùng và tận dụng lại cho nhiều kỳ kiểm tra",
        ],
      },
      {
        eyebrow: "LMS và tiến độ",
        title: "Quản lý học tập, bài tập và phản hồi trong một không gian chung",
        description:
          "Kết nối bài giảng, bài tập, kiểm tra và phản hồi để giáo viên nhìn rõ tiến độ của từng học sinh.",
        tags: ["Khóa học", "Bài tập", "Dashboard"],
        bullets: [
          "Theo dõi mức độ hoàn thành, điểm số và nhóm cần hỗ trợ thêm",
          "Giữ phụ huynh và học sinh cùng nhìn thấy hành trình học tập",
        ],
      },
    ],
    whyHeading: {
      eyebrow: "Vì sao chọn EduBoost",
      title: "Những điểm mạnh dễ hiểu, dễ quét và đủ thuyết phục",
      description:
        "Trang chủ nhấn mạnh cảm giác tin cậy, quy mô và sự rõ ràng trong luồng sử dụng.",
    },
    reasons: [
      {
        icon: ShieldCheck,
        title: "Quy trình rõ ràng",
        description: "Mọi bước từ tạo đề đến báo cáo đều nằm trong một flow dễ bám theo.",
      },
      {
        icon: ScanLine,
        title: "Linh hoạt online và offline",
        description: "Kết hợp nhiều hình thức kiểm tra mà không cần chia nhỏ dữ liệu.",
      },
      {
        icon: Bot,
        title: "AI hỗ trợ thao tác nặng",
        description: "Dành AI cho các bước tốn thời gian như gợi ý, tổng hợp và trợ lý học tập.",
      },
      {
        icon: UsersRound,
        title: "Phù hợp nhiều vai trò",
        description: "Giáo viên, học sinh và phụ huynh đều có điểm chạm phù hợp với nhu cầu thực tế.",
      },
    ],
    stackHeading: {
      eyebrow: "Định dạng và luồng làm việc",
      title: "Sẵn sàng cho các kiểu tài liệu và tích hợp quen thuộc",
      description:
        "EduBoost phục vụ các định dạng và luồng thật mà giáo viên và nhà trường thường dùng mỗi ngày.",
    },
    stack: [
      "DOCX",
      "PDF",
      "XLSX",
      "Đề trắc nghiệm",
      "Tự luận",
      "Google đăng nhập",
      "Email xác thực",
      "VietQR",
    ],
    cta: {
      eyebrow: "Sẵn sàng triển khai",
      title: "Bắt đầu làm mới trải nghiệm dạy, học và đánh giá với EduBoost",
      description:
        "EduBoost mang đến một trải nghiệm EdTech rõ ràng hơn, tin cậy hơn và sẵn sàng mở rộng cùng giáo viên, học sinh và phụ huynh.",
      primary: "Đăng ký giáo viên",
      secondary: "Đăng nhập hệ thống",
      tertiary: "Cổng phụ huynh",
    },
  },
  en: {
    heroBadge: "EduBoost for modern education",
    heroSubBadge: "Assessment, content management, and LMS in one platform",
    heroTitle: "A smart assessment and learning platform for modern teachers",
    heroText:
      "A digital workspace that helps teachers build exams, manage classes, assign work, and track learning progress in a more connected flow.",
    primaryCta: "Start free",
    secondaryCta: "View pricing",
    checklist: [
      "Create assessments faster from documents and question banks",
      "Assign work, grade, and review reports in one dashboard",
      "Connect teachers, students, and parents in one workflow",
    ],
    pillars: [
      {
        icon: FileText,
        title: "Assessment",
        description: "Create exams, assign work, collect submissions, and track status in one flow.",
      },
      {
        icon: BookCopy,
        title: "Content library",
        description: "Build reusable question banks and learning resources for the long term.",
      },
      {
        icon: LayoutDashboard,
        title: "Analytics",
        description: "Read progress, scores, and support signals through clear dashboards.",
      },
    ],
    mockSidebar: ["Class dashboard", "Question bank", "Assignments and tests", "Parent feedback"],
    mockSummary: [
      { label: "Active classes", value: "12 active groups" },
      { label: "Weekly progress", value: "84% completed" },
    ],
    audiencesHeading: {
      eyebrow: "Designed for multiple models",
      title: "EduBoost fits different teaching and operational contexts",
      description:
        "From independent teachers to schools and training centers, the platform focuses on practical needs instead of isolated features.",
    },
    audiences: [
      {
        icon: GraduationCap,
        title: "Independent teachers",
        description: "Assign work, grade, and track progress through a workflow that stays practical every day.",
        bullets: [
          "Create tests quickly from materials and question banks",
          "Track results by class and by student",
        ],
      },
      {
        icon: School,
        title: "Schools",
        description: "Suitable for recurring assessments, centralized exams, and shared learning data.",
        bullets: [
          "Clear permissions for teachers, students, and parents",
          "Aggregate data for reporting and competency tracking",
        ],
      },
      {
        icon: UsersRound,
        title: "Training centers",
        description: "Standardize assessment, mock testing, and result tracking at larger scale.",
        bullets: [
          "Manage multiple classes and schedules on one platform",
          "Compare results by class, skill, and learning phase",
        ],
      },
    ],
    productsHeading: {
      eyebrow: "Core product areas",
      title: "Three major product blocks presented in the order users care about most",
      description:
        "Assessment, question banks, and learning management are separated clearly so visitors understand the product value faster.",
    },
    products: [
      {
        eyebrow: "Assessment",
        title: "Online and offline testing in a single workflow",
        description:
          "Create exams, assign them, receive submissions, and analyze outcomes without jumping across multiple tools.",
        tags: ["DOCX", "PDF", "XLSX"],
        bullets: [
          "Assign work by class, group, or individual learner",
          "Support paper grading and result reconciliation inside one dashboard",
        ],
      },
      {
        eyebrow: "Question bank",
        title: "Digitize question banks for long-term reuse and standardization",
        description:
          "Organize questions by topic, difficulty, and structure so teachers can build better tests faster.",
        tags: ["Classification", "Difficulty", "Topics"],
        bullets: [
          "Tag questions by topic, difficulty, and test type",
          "Filter duplicates and reuse items across many assessments",
        ],
      },
      {
        eyebrow: "LMS and progress",
        title: "Manage learning content, assignments, and feedback in one shared space",
        description:
          "Connect lessons, homework, assessments, and feedback so teachers can see learner progress more clearly.",
        tags: ["Courses", "Assignments", "Dashboard"],
        bullets: [
          "Track completion, scores, and learners who need more support",
          "Keep parents and students aligned on the same learning journey",
        ],
      },
    ],
    whyHeading: {
      eyebrow: "Why EduBoost",
      title: "Clear, scannable, and trustworthy value points",
      description:
        "The homepage emphasizes trust, scale, and clarity in the product flow.",
    },
    reasons: [
      {
        icon: ShieldCheck,
        title: "Clear workflow",
        description: "Every step from exam creation to reporting lives in one understandable flow.",
      },
      {
        icon: ScanLine,
        title: "Flexible online and offline",
        description: "Combine multiple assessment modes without splitting data.",
      },
      {
        icon: Bot,
        title: "AI for heavy tasks",
        description: "Use AI where time is usually wasted, such as assistance and summarization.",
      },
      {
        icon: UsersRound,
        title: "Built for multiple roles",
        description: "Teachers, students, and parents all get an experience that fits their needs.",
      },
    ],
    stackHeading: {
      eyebrow: "Formats and workflows",
      title: "Ready for familiar content types and integrations",
      description:
        "EduBoost supports the document formats and operational flows schools and teachers use every day.",
    },
    stack: [
      "DOCX",
      "PDF",
      "XLSX",
      "Multiple choice",
      "Written exams",
      "Google sign-in",
      "Email verification",
      "VietQR",
    ],
    cta: {
      eyebrow: "Ready to launch",
      title: "Refresh teaching, learning, and assessment with EduBoost",
      description:
        "EduBoost delivers a clearer, more trustworthy EdTech experience that can grow with teachers, students, and parents.",
      primary: "Register as teacher",
      secondary: "Sign in",
      tertiary: "Parent portal",
    },
  },
};

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="landing-section-heading">
      <span className="landing-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

const Home = () => {
  const { language } = useLanguage();
  const copy = COPY[language];
  const audienceRef = useScrollReveal();
  const productsRef = useScrollReveal();
  const whyRef = useScrollReveal();
  const stackRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div className="landing-home">
      <section className="landing-hero">
        <div className="container landing-hero__grid reveal is-visible">
          <div className="landing-hero__content">
            <div className="landing-badges">
              <span className="landing-badge">
                <Sparkles size={16} />
                {copy.heroBadge}
              </span>
              <span className="landing-badge landing-badge--muted">
                {copy.heroSubBadge}
              </span>
            </div>

            <h1>{copy.heroTitle}</h1>
            <p className="landing-hero__subtitle">{copy.heroText}</p>

            <div className="landing-hero__actions">
              <Link to="/register" className="landing-btn landing-btn--primary">
                {copy.primaryCta}
                <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="landing-btn landing-btn--secondary">
                {copy.secondaryCta}
              </Link>
            </div>

            <ul className="landing-checklist">
              {copy.checklist.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="hero-pillars">
              {copy.pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="hero-pillars__item">
                    <div className="hero-pillars__icon">
                      <Icon size={20} />
                    </div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="hero-glow hero-glow--one"></div>
            <div className="hero-glow hero-glow--two"></div>

            <div className="hero-dashboard">
              <div className="hero-dashboard__top">
                <span className="hero-window-dot"></span>
                <span className="hero-window-dot"></span>
                <span className="hero-window-dot"></span>
              </div>
              <div className="hero-dashboard__content">
                <div className="hero-dashboard__sidebar">
                  {copy.mockSidebar.map((item, index) => (
                    <div
                      key={item}
                      className={`hero-nav-item ${index === 0 ? "hero-nav-item--active" : ""}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="hero-dashboard__main">
                  <div className="hero-summary-row">
                    {copy.mockSummary.map((item, index) => (
                      <div
                        key={item.label}
                        className={`hero-summary-card ${index === 1 ? "hero-summary-card--accent" : ""}`}
                      >
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="hero-analytics">
                    <div className="hero-analytics__chart">
                      <div style={{ height: "42%" }}></div>
                      <div style={{ height: "64%" }}></div>
                      <div style={{ height: "58%" }}></div>
                      <div style={{ height: "82%" }}></div>
                      <div style={{ height: "74%" }}></div>
                    </div>
                    <div className="hero-analytics__notes">
                      <div className="hero-note">
                        <span>{language === "vi" ? "AI nhắc việc" : "AI reminders"}</span>
                        <strong>
                          {language === "vi"
                            ? "15 học sinh cần hỗ trợ thêm"
                            : "15 students need extra support"}
                        </strong>
                      </div>
                      <div className="hero-note">
                        <span>{language === "vi" ? "Quy trình chấm bài" : "Grading workflow"}</span>
                        <strong>
                          {language === "vi"
                            ? "Online và OCR trong một luồng"
                            : "Online and OCR in one flow"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="hero-file-strip">
                    <span>
                      <FileText size={16} />
                      DOCX
                    </span>
                    <span>
                      <FileText size={16} />
                      XLSX
                    </span>
                    <span>
                      <BookCopy size={16} />
                      {language === "vi" ? "Kho câu hỏi" : "Question bank"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card--top">
              <Bot size={18} />
              <div>
                <strong>{language === "vi" ? "AI trợ lý giáo viên" : "AI teacher assistant"}</strong>
                <span>
                  {language === "vi"
                    ? "Gợi ý nội dung, theo dõi tiến độ và hỗ trợ học tập"
                    : "Suggests content, tracks progress, and supports learning"}
                </span>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card--bottom">
              <ScanLine size={18} />
              <div>
                <strong>{language === "vi" ? "OCR và đối soát" : "OCR and reconciliation"}</strong>
                <span>
                  {language === "vi"
                    ? "Liên thông kiểm tra online, bài nộp và chấm phiếu"
                    : "Connects online tests, submissions, and sheet grading"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="audiences" className="landing-section landing-section--soft">
        <div className="container reveal" ref={audienceRef}>
          <SectionHeading {...copy.audiencesHeading} />
          <div className="audience-grid">
            {copy.audiences.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="audience-card">
                  <div className="audience-card__icon">
                    <Icon size={24} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul>
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>
                        <ChevronRight size={16} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="products" className="landing-section landing-section--products">
        <div className="container reveal" ref={productsRef}>
          <SectionHeading {...copy.productsHeading} />
          <div className="product-stack">
            {copy.products.map((section, index) => (
              <article
                key={section.title}
                className={`product-card ${index % 2 === 1 ? "product-card--reverse" : ""}`}
              >
                <div className="product-card__content">
                  <span className="landing-kicker">{section.eyebrow}</span>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                  <div className="product-tags">
                    {section.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <ul className="product-bullets">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>
                        <CheckCircle2 size={18} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="product-visual">
                  <div className="mock-window mock-window--lms">
                    <div className="mock-window__bar">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="mock-window__lms">
                      <div className="mock-stat-card">
                        <span>{language === "vi" ? "Trạng thái" : "Status"}</span>
                        <strong>{section.title}</strong>
                      </div>
                      <div className="mock-grid mock-grid--two">
                        {section.tags.slice(0, 2).map((tag) => (
                          <div key={tag} className="mock-stat-card mock-stat-card--light">
                            <span>{language === "vi" ? "Điểm nhấn" : "Highlight"}</span>
                            <strong>{tag}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-eduboost" className="landing-section landing-section--deep">
        <div className="container reveal" ref={whyRef}>
          <SectionHeading {...copy.whyHeading} />
          <div className="reason-grid">
            {copy.reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <article key={reason.title} className="reason-card">
                  <div className="reason-card__icon">
                    <Icon size={22} />
                  </div>
                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="partners" className="landing-section">
        <div className="container reveal" ref={stackRef}>
          <SectionHeading {...copy.stackHeading} />
          <div className="stack-grid">
            {copy.stack.map((chip) => (
              <div key={chip} className="stack-chip">
                {chip}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--cta">
        <div className="container reveal" ref={ctaRef}>
          <div className="landing-cta">
            <div className="landing-cta__copy">
              <span className="landing-kicker">{copy.cta.eyebrow}</span>
              <h2>{copy.cta.title}</h2>
              <p>{copy.cta.description}</p>
            </div>
            <div className="landing-cta__actions">
              <Link to="/register" className="landing-btn landing-btn--primary">
                {copy.cta.primary}
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="landing-btn landing-btn--secondary">
                {copy.cta.secondary}
              </Link>
              <Link to="/parent/login" className="landing-btn landing-btn--ghost">
                {copy.cta.tertiary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
