import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Send,
  ShieldCheck,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useLanguage } from "../../contexts/language-context";
import "./FeaturePage.css";

const COPY = {
  vi: {
    badge: "Tính năng",
    headerTitle: "Chuyển đổi số Nhà trường",
    headerText:
      "Đưa toàn bộ quy trình dạy học, kiểm tra và quản lý lên một nền tảng số thống nhất, dễ tra cứu và đáng tin cậy.",
    primaryCta: "Bắt đầu ngay",
    secondaryCta: "Xem hướng dẫn",
    workflowTitle: "Lộ trình chuyển đổi số trong trường học",
    stepLabel: "Giai đoạn",
    workflow: [
      { icon: Building2, title: "Thiết lập nhà trường", desc: "Tạo cơ cấu trường, khối lớp, môn học và phân quyền giáo viên." },
      { icon: Users, title: "Quản lý lớp & học sinh", desc: "Đưa danh sách lớp và học sinh lên hệ thống, liên kết với phụ huynh." },
      { icon: Zap, title: "Số hóa kiểm tra", desc: "Chuyển bài kiểm tra từ giấy sang online, lưu kết quả tự động." },
      { icon: BarChart3, title: "Theo dõi dữ liệu", desc: "Xem báo cáo tiến độ, kết quả học tập theo lớp, môn và giai đoạn." },
      { icon: ShieldCheck, title: "Vận hành ổn định", desc: "Dữ liệu được lưu trữ bảo mật và có thể truy xuất bất kỳ lúc nào." },
    ],
    featuresTitle: "Tính năng chi tiết",
    sections: [
      {
        id: "structure",
        icon: Building2,
        color: "#0f7cf0",
        title: "Cơ cấu trường học",
        summary: "Thiết lập khối lớp, môn học và phân quyền giáo viên theo đúng cơ cấu thực tế của trường.",
        steps: [
          "Admin tạo khối lớp, môn học và chương trình học phù hợp với nhà trường.",
          "Phân quyền giáo viên dạy môn nào, lớp nào để quản lý nội dung riêng biệt.",
          "Học sinh và phụ huynh được liên kết chính xác theo từng lớp.",
        ],
      },
      {
        id: "class",
        icon: Users,
        color: "#10b981",
        title: "Quản lý lớp học",
        summary: "Tổ chức và theo dõi danh sách lớp, học sinh và trạng thái tham gia theo thời gian thực.",
        steps: [
          "Tạo lớp học và thêm học sinh bằng import file hoặc nhập tay.",
          "Xem danh sách thành viên, trạng thái hoạt động và lịch sử bài kiểm tra.",
          "Mời học sinh bằng mã lớp hoặc link chia sẻ tiện lợi.",
        ],
      },
      {
        id: "reporting",
        icon: BarChart3,
        color: "#f59e0b",
        title: "Báo cáo & thống kê",
        summary: "Dashboard trực quan cho ban giám hiệu và giáo viên xem tiến độ học sinh.",
        steps: [
          "Xem tổng quan kết quả theo lớp, môn học và kỳ học.",
          "So sánh tiến độ giữa các lớp hoặc giữa các kỳ học khác nhau.",
          "Xuất báo cáo PDF hoặc Excel cho hội đồng sư phạm.",
        ],
      },
      {
        id: "parent",
        icon: ShieldCheck,
        color: "#8b5cf6",
        title: "Kết nối phụ huynh",
        summary: "Phụ huynh theo dõi kết quả học tập của con thông qua tài khoản riêng, minh bạch và kịp thời.",
        steps: [
          "Phụ huynh đăng ký tài khoản và liên kết với con bằng mã mời.",
          "Xem kết quả bài kiểm tra, điểm số và nhận xét của giáo viên.",
          "Nhận thông báo khi con nộp bài hoặc có kết quả mới.",
        ],
      },
    ],
    tipsTitle: "Mẹo triển khai chuyển đổi số hiệu quả",
    tips: [
      { title: "Bắt đầu từ cơ cấu", desc: "Thiết lập khối lớp và môn học đúng trước khi đưa dữ liệu học sinh lên." },
      { title: "Import danh sách nhanh", desc: "Dùng file Excel mẫu để upload danh sách học sinh hàng trăm người trong vài phút." },
      { title: "Đào tạo giáo viên song song", desc: "Hướng dẫn giáo viên song song với quá trình thiết lập để tránh gián đoạn." },
      { title: "Theo dõi dữ liệu ngay từ đầu", desc: "Xem báo cáo ngay từ bài kiểm tra đầu tiên để làm quen với dashboard." },
    ],
  },
  en: {
    badge: "Feature",
    headerTitle: "School Digitization",
    headerText:
      "Move your entire teaching, testing, and management process onto a unified digital platform that is easy to search and dependable.",
    primaryCta: "Get started",
    secondaryCta: "View guide",
    workflowTitle: "School digitization roadmap",
    stepLabel: "Phase",
    workflow: [
      { icon: Building2, title: "School setup", desc: "Create school structure, grade levels, subjects, and assign teacher permissions." },
      { icon: Users, title: "Manage classes & students", desc: "Upload class lists and link students with their parents." },
      { icon: Zap, title: "Digitize assessments", desc: "Move paper exams online and store results automatically." },
      { icon: BarChart3, title: "Track data", desc: "View progress and results by class, subject, and term." },
      { icon: ShieldCheck, title: "Stable operations", desc: "Data is stored securely and accessible at any time." },
    ],
    featuresTitle: "Feature details",
    sections: [
      {
        id: "structure",
        icon: Building2,
        color: "#0f7cf0",
        title: "School structure",
        summary: "Set up grade levels, subjects, and teacher permissions to mirror your school's real organization.",
        steps: [
          "Admins create grade levels, subjects, and curricula to match your school.",
          "Assign teachers to specific subjects and classes for separated management.",
          "Students and parents are linked accurately to their respective classes.",
        ],
      },
      {
        id: "class",
        icon: Users,
        color: "#10b981",
        title: "Class management",
        summary: "Organize and track class rosters, student profiles, and participation status in real time.",
        steps: [
          "Create classes and add students via file import or manual entry.",
          "View member lists, activity status, and exam history.",
          "Invite students with a class code or shareable link.",
        ],
      },
      {
        id: "reporting",
        icon: BarChart3,
        color: "#f59e0b",
        title: "Reports & analytics",
        summary: "Visual dashboards for principals and teachers to review student progress.",
        steps: [
          "See overall results by class, subject, and term.",
          "Compare progress across classes or different semesters.",
          "Export reports as PDF or Excel for faculty review.",
        ],
      },
      {
        id: "parent",
        icon: ShieldCheck,
        color: "#8b5cf6",
        title: "Parent connection",
        summary: "Parents monitor their child's results through a dedicated account — transparent and timely.",
        steps: [
          "Parents register and link to their child using an invitation code.",
          "View exam scores, grades, and teacher comments.",
          "Receive notifications when results are posted.",
        ],
      },
    ],
    tipsTitle: "Tips for effective school digitization",
    tips: [
      { title: "Start with structure", desc: "Set up grade levels and subjects before uploading student data." },
      { title: "Use bulk import", desc: "Use the Excel template to upload hundreds of students in minutes." },
      { title: "Train teachers in parallel", desc: "Guide teachers during setup to avoid disruptions later." },
      { title: "Track data from day one", desc: "Review reports after the first exam to get familiar with the dashboard." },
    ],
  },
};

const DigitalSchool = () => {
  const [expandedId, setExpandedId] = useState(null);
  const { language } = useLanguage();
  const content = COPY[language];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="fp-page">
      <section className="fp-hero">
        <div className="container fp-hero__shell">
          <div className="fp-hero__icon-wrap" style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}>
            <Building2 size={30} color="#fff" />
          </div>
          <span className="fp-badge">{content.badge}</span>
          <h1>{content.headerTitle}</h1>
          <p>{content.headerText}</p>
          <div className="fp-hero__actions">
            <Link to="/register" className="fp-btn fp-btn--primary">
              {content.primaryCta} <ArrowRight size={18} />
            </Link>
            <Link to="/guide" className="fp-btn fp-btn--secondary">
              {content.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="fp-section container">
        <h2 className="fp-section-title"><Workflow size={20} /> {content.workflowTitle}</h2>
        <div className="fp-workflow">
          {content.workflow.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="fp-workflow-step" style={{ borderColor: "rgba(16,185,129,0.12)", background: "rgba(16,185,129,0.04)" }}>
                <div className="fp-ws-icon" style={{ background: "rgba(16,185,129,0.14)", color: "#10b981" }}><Icon size={22} /></div>
                <span className="fp-ws-num" style={{ color: "#10b981" }}>{content.stepLabel} {i + 1}</span>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="fp-section container">
        <h2 className="fp-section-title"><HelpCircle size={20} /> {content.featuresTitle}</h2>
        {content.sections.map((section) => {
          const Icon = section.icon;
          const isOpen = expandedId === section.id;
          return (
            <div key={section.id} className={`fp-accordion glass ${isOpen ? "open" : ""}`}>
              <button type="button" className="fp-accordion__header" onClick={() => setExpandedId(isOpen ? null : section.id)}>
                <div className="fp-accordion__left">
                  <div className="fp-accordion__icon" style={{ background: `${section.color}18`, color: section.color }}><Icon size={20} /></div>
                  <div><h3>{section.title}</h3><p>{section.summary}</p></div>
                </div>
                <span className="fp-accordion__chevron">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
              </button>
              {isOpen && (
                <div className="fp-accordion__body">
                  <ol className="fp-steps">
                    {section.steps.map((step, i) => (
                      <li key={i}><span className="fp-step-num" style={{ background: section.color }}>{i + 1}</span><span>{step}</span></li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="fp-section container">
        <h2 className="fp-section-title"><Lightbulb size={20} /> {content.tipsTitle}</h2>
        <div className="fp-tips">
          {content.tips.map((tip) => (
            <div key={tip.title} className="fp-tip-card">
              <CheckCircle size={20} color="#10b981" />
              <div><strong>{tip.title}</strong><p>{tip.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="fp-section container">
        <div className="fp-cta-box glass">
          <Send size={28} color="#10b981" />
          <h2>{language === "vi" ? "Sẵn sàng số hóa trường học của bạn?" : "Ready to digitize your school?"}</h2>
          <p>{language === "vi" ? "Liên hệ với chúng tôi để được tư vấn triển khai phù hợp." : "Contact us for a deployment consultation tailored to your school."}</p>
          <Link to="/register" className="fp-btn fp-btn--primary" style={{ background: "linear-gradient(135deg,#10b981,#34d399)", boxShadow: "0 14px 28px rgba(16,185,129,0.22)" }}>
            {content.primaryCta} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DigitalSchool;
