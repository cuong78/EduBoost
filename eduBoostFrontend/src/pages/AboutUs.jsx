import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  HeartHandshake,
  Rocket,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useLanguage } from "../contexts/language-context";
import "./AboutUs.css";

const ABOUT_COPY = {
  vi: {
    badge: "Về chúng tôi",
    title: "EduBoost được xây dựng bởi một nhóm yêu giáo dục và công nghệ",
    subtitle:
      "Chúng tôi tập trung vào việc giúp giáo viên, học sinh và phụ huynh có một trải nghiệm học tập số hóa rõ ràng, gọn gàng và đáng tin cậy hơn mỗi ngày.",
    primaryCta: "Bắt đầu với EduBoost",
    secondaryCta: "Xem hướng dẫn",
    stats: [
      { value: "EdTech", label: "Tư duy sản phẩm cho giáo dục" },
      { value: "AI", label: "Ứng dụng vào các bước tốn thời gian" },
      { value: "LMS", label: "Kết nối dạy, học và đánh giá" },
    ],
    sections: [
      {
        icon: HeartHandshake,
        title: "Sứ mệnh",
        description:
          "Giảm bớt những thao tác rời rạc trong dạy học và khảo thí để giáo viên có thêm thời gian cho chuyên môn và tương tác với học sinh.",
      },
      {
        icon: BrainCircuit,
        title: "Cách chúng tôi làm sản phẩm",
        description:
          "Luôn bắt đầu từ nhu cầu thật trong lớp học, sau đó mới dùng AI và tự động hóa để làm cho quy trình nhanh hơn, không phức tạp hơn.",
      },
      {
        icon: ShieldCheck,
        title: "Điều chúng tôi ưu tiên",
        description:
          "Sự rõ ràng trong luồng sử dụng, dữ liệu dễ theo dõi và trải nghiệm đủ tin cậy để dùng lâu dài trong môi trường giáo dục.",
      },
    ],
    teamTitle: "Nhóm EduBoost gồm những vai trò nào?",
    teamSubtitle:
      "Đây là một đội ngũ liên ngành, kết hợp góc nhìn sản phẩm, kỹ thuật và giáo dục để giải quyết các bài toán thật trong lớp học.",
    teamCards: [
      {
        icon: UsersRound,
        title: "Sản phẩm",
        description:
          "Thiết kế luồng sử dụng, ưu tiên bài toán đúng và giữ trải nghiệm mạch lạc cho nhiều nhóm người dùng.",
      },
      {
        icon: Rocket,
        title: "Kỹ thuật",
        description:
          "Xây dựng nền tảng web ổn định, phản hồi nhanh và đủ linh hoạt để mở rộng dần theo nhu cầu thực tế.",
      },
      {
        icon: BookOpen,
        title: "Giáo dục",
        description:
          "Đảm bảo nội dung, quy trình và cách gọi tính năng gần với ngữ cảnh sử dụng của giáo viên và nhà trường.",
      },
    ],
    closingTitle: "Chúng tôi tin rằng công nghệ giáo dục nên phục vụ sự rõ ràng",
    closingDescription:
      "Một sản phẩm tốt không chỉ có nhiều tính năng. Nó còn phải giúp người dùng bớt rối hơn, làm việc nhanh hơn và tin vào dữ liệu mình đang nhìn thấy.",
  },
  en: {
    badge: "About us",
    title: "EduBoost is built by a team that cares about education and technology",
    subtitle:
      "We focus on giving teachers, students, and parents a learning experience that feels clearer, lighter, and more trustworthy every day.",
    primaryCta: "Start with EduBoost",
    secondaryCta: "View guide",
    stats: [
      { value: "EdTech", label: "Product thinking for education" },
      { value: "AI", label: "Used where time is usually wasted" },
      { value: "LMS", label: "Connecting teaching, learning, and assessment" },
    ],
    sections: [
      {
        icon: HeartHandshake,
        title: "Mission",
        description:
          "Reduce fragmented teaching and assessment work so teachers can spend more time on instruction and student interaction.",
      },
      {
        icon: BrainCircuit,
        title: "How we build",
        description:
          "We start from real classroom needs first, then apply AI and automation only where they make the workflow faster and clearer.",
      },
      {
        icon: ShieldCheck,
        title: "What we prioritize",
        description:
          "Clear flows, readable data, and a product experience trustworthy enough for long-term educational use.",
      },
    ],
    teamTitle: "What kind of team is behind EduBoost?",
    teamSubtitle:
      "We are a cross-functional group that combines product, engineering, and education perspectives to solve real classroom problems.",
    teamCards: [
      {
        icon: UsersRound,
        title: "Product",
        description:
          "Designs the user flow, prioritizes the right problems, and keeps the experience coherent across user roles.",
      },
      {
        icon: Rocket,
        title: "Engineering",
        description:
          "Builds a stable, fast web platform that can expand gradually with real-world needs.",
      },
      {
        icon: BookOpen,
        title: "Education",
        description:
          "Keeps the language, process, and product decisions grounded in how teachers and schools actually work.",
      },
    ],
    closingTitle: "We believe educational technology should create clarity",
    closingDescription:
      "A strong product is not only feature-rich. It should reduce confusion, speed up work, and help users trust the data they see.",
  },
};

const AboutUs = () => {
  const { language } = useLanguage();
  const content = ABOUT_COPY[language];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero__shell">
          <div className="about-hero__copy">
            <span className="about-badge">
              <Sparkles size={16} />
              {content.badge}
            </span>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
            <div className="about-actions">
              <Link to="/register" className="about-btn about-btn--primary">
                {content.primaryCta}
                <ArrowRight size={18} />
              </Link>
              <Link to="/guide" className="about-btn about-btn--secondary">
                {content.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="about-stats">
            {content.stats.map((item) => (
              <div key={item.label} className="about-stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container about-grid">
          {content.sections.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="about-card">
                <div className="about-card__icon">
                  <Icon size={22} />
                </div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-section about-section--soft">
        <div className="container">
          <div className="about-heading">
            <h2>{content.teamTitle}</h2>
            <p>{content.teamSubtitle}</p>
          </div>

          <div className="about-grid about-grid--team">
            {content.teamCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className="about-card about-card--team">
                  <div className="about-card__icon">
                    <Icon size={22} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-closing">
            <h2>{content.closingTitle}</h2>
            <p>{content.closingDescription}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
