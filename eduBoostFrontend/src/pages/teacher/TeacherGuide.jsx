import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FilePlus,
  FolderOpen,
  HelpCircle,
  Library,
  Lightbulb,
  PenLine,
  ShieldCheck,
  Table2,
  Users,
} from "lucide-react";
import { useLanguage } from "../../contexts/language-context";

const GUIDE_COPY = {
  vi: {
    headerTitle: "Hướng dẫn sử dụng",
    headerText: "Tất cả những gì bạn cần biết để sử dụng EduBoost hiệu quả hơn.",
    categoriesTitle: "Danh mục hướng dẫn",
    featuresTitle: "Hướng dẫn chi tiết từng chức năng",
    tipsTitle: "Mẹo sử dụng hiệu quả",
    goTo: "Đi tới",
    categories: [
      {
        icon: Users,
        title: "Quản lý lớp học",
        desc: "Thiết lập lớp và quản lý học sinh trong lớp.",
        items: ["Lớp học"],
      },
      {
        icon: FolderOpen,
        title: "Nội dung học tập",
        desc: "Chuẩn bị tài nguyên và phát triển ngân hàng câu hỏi.",
        items: ["Quản lý tài nguyên", "Tạo câu hỏi", "Ngân hàng câu hỏi"],
      },
      {
        icon: ClipboardList,
        title: "Đề thi & Đánh giá",
        desc: "Tạo đề, quản lý ma trận và theo dõi đề thi đã tạo.",
        items: ["Quản lý ma trận", "Tạo đề thi", "Quản lý đề thi"],
      },
      {
        icon: ShieldCheck,
        title: "Hỗ trợ",
        desc: "Gửi phản hồi và nhận hỗ trợ trong quá trình sử dụng.",
        items: ["Góp ý"],
      },
      {
        icon: BarChart3,
        title: "Thống kê & Giám sát",
        desc: "Theo dõi bài thi, giám sát thi realtime và xem bảng điểm.",
        items: ["Thống kê"],
      },
    ],
    sections: [
      {
        id: "classes",
        icon: Users,
        title: "Lớp học",
        path: "/teacher/classes",
        color: "#10b981",
        summary: "Quản lý lớp, xem học sinh, mời học sinh và theo dõi trạng thái tham gia.",
        steps: [
          "Mở mục Lớp học để xem toàn bộ lớp bạn đang quản lý.",
          "Chọn từng lớp để xem danh sách học sinh và thông tin liên quan.",
          "Dùng chức năng thêm hoặc mời học sinh để mở rộng danh sách lớp.",
        ],
      },
      {
        id: "create-question",
        icon: PenLine,
        title: "Tạo câu hỏi",
        path: "/teacher/create-question",
        color: "#6366f1",
        summary: "Tạo câu hỏi mới bằng nhập tay, import tài liệu hoặc workflow có hỗ trợ AI.",
        steps: [
          "Chọn khối, môn, chương và bài trước khi bắt đầu tạo câu hỏi.",
          "Nhập nội dung, đáp án, giải thích và mức độ nhận thức của câu hỏi.",
          "Xem trước rồi lưu vào ngân hàng để tái sử dụng cho nhiều đề thi.",
        ],
      },
      {
        id: "question-bank",
        icon: Library,
        title: "Ngân hàng câu hỏi",
        path: "/teacher/question-bank",
        color: "#f59e0b",
        summary: "Lọc, xem chi tiết, chỉnh sửa và quản lý toàn bộ kho câu hỏi của bạn.",
        steps: [
          "Dùng bộ lọc theo khối, môn, bài học và mức độ để tra cứu nhanh.",
          "Xem chi tiết từng câu hỏi trước khi thêm vào đề hoặc chỉnh sửa.",
          "Tận dụng kho câu hỏi để ra đề nhanh và giữ chất lượng ổn định.",
        ],
      },
      {
        id: "resources",
        icon: FolderOpen,
        title: "Quản lý tài nguyên",
        path: "/teacher/resources",
        color: "#8b5cf6",
        summary: "Lưu trữ tài liệu học tập để sử dụng lại cho AI và quy trình tạo nội dung.",
        steps: [
          "Chọn đúng khối, môn, chương và bài trước khi tải lên tài liệu.",
          "Upload file tài liệu và kiểm tra trạng thái xử lý sau khi tải lên.",
          "Tái sử dụng tài nguyên này khi xây câu hỏi hoặc nội dung học tập.",
        ],
      },
      {
        id: "create-exam",
        icon: FilePlus,
        title: "Tạo đề thi",
        path: "/teacher/create-exam",
        color: "#ef4444",
        summary: "Cấu hình đề, xem trước nội dung và hoàn thiện đề thi trước khi dùng.",
        steps: [
          "Nhập tên đề, chọn môn, khối và loại đề thi phù hợp.",
          "Phân bổ câu hỏi hoặc chọn ma trận nếu bạn đang tạo đề có cấu trúc cụ thể.",
          "Xem trước đề thi, chỉnh sửa câu hỏi cần thiết rồi mới xuất bản hoặc xuất PDF.",
        ],
      },
      {
        id: "assignments",
        icon: BarChart3,
        title: "Thống kê",
        path: "/teacher/assignments",
        color: "#0ea5e9",
        summary: "Xem bài thi đã giao, giám sát realtime và quản lý bảng điểm toàn lớp.",
        steps: [
          "Vào tab Bài đã giao để thấy toàn bộ bài thi đã giao và trạng thái hiện tại.",
          "Nhấn Xem kết quả để mở bảng điểm của từng bài thi cho tất cả học sinh.",
          "Nhấn Giám sát để vào trang xem realtime: ai đang làm bài, ai nộp rồi, vi phạm nào xảy ra.",
          "Vào tab Quản lý điểm, chọn lớp để xem bảng điểm ngang — cuộn phải nếu có nhiều cột đề thi.",
        ],
      },
    ],
    tips: [
      {
        title: "Upload tài liệu trước",
        desc: "Có tài liệu tốt từ đầu sẽ giúp workflow tạo nội dung nhanh và nhất quán hơn.",
      },
      {
        title: "Giữ ngân hàng câu hỏi sạch",
        desc: "Phân loại rõ theo chủ đề và độ khó để ra đề về sau nhanh hơn rất nhiều.",
      },
      {
        title: "Xem trước trước khi dùng",
        desc: "Luôn review nội dung AI hoặc nội dung import trước khi đưa vào đề thi thật.",
      },
      {
        title: "Theo dõi dữ liệu đều đặn",
        desc: "Dashboard có giá trị nhất khi bạn xem tiến độ, bài nộp và kết quả theo chu kỳ.",
      },
    ],
  },
  en: {
    headerTitle: "Teacher guide",
    headerText: "Everything you need to use EduBoost more effectively.",
    categoriesTitle: "Guide categories",
    featuresTitle: "Detailed feature guide",
    tipsTitle: "Helpful usage tips",
    goTo: "Go to",
    categories: [
      {
        icon: Users,
        title: "Classroom management",
        desc: "Set up classes and manage students.",
        items: ["Classes"],
      },
      {
        icon: FolderOpen,
        title: "Learning content",
        desc: "Prepare resources and build your question bank.",
        items: ["Resource management", "Create questions", "Question bank"],
      },
      {
        icon: ClipboardList,
        title: "Exams & assessment",
        desc: "Create exams, use matrices, and review created exams.",
        items: ["Matrix management", "Create exams", "Exam management"],
      },
      {
        icon: ShieldCheck,
        title: "Support",
        desc: "Send feedback and get support while using EduBoost.",
        items: ["Feedback"],
      },
    ],
    sections: [
      {
        id: "classes",
        icon: Users,
        title: "Classes",
        path: "/teacher/classes",
        color: "#10b981",
        summary: "Manage classes, view students, invite learners, and track participation.",
        steps: [
          "Open the Classes area to see every class you manage.",
          "Select a class to review students and related information.",
          "Use add or invite actions to expand the class roster.",
        ],
      },
      {
        id: "create-question",
        icon: PenLine,
        title: "Create questions",
        path: "/teacher/create-question",
        color: "#6366f1",
        summary: "Create new questions manually, from imported files, or through AI-assisted workflows.",
        steps: [
          "Choose grade, subject, chapter, and lesson before starting.",
          "Enter the content, answer, explanation, and cognitive level.",
          "Preview the result before saving it to the question bank.",
        ],
      },
      {
        id: "question-bank",
        icon: Library,
        title: "Question bank",
        path: "/teacher/question-bank",
        color: "#f59e0b",
        summary: "Filter, inspect, edit, and manage your full question library.",
        steps: [
          "Use filters by grade, subject, lesson, and difficulty for quick lookup.",
          "Inspect each question carefully before adding it to an exam or editing it.",
          "Reuse the bank to build assessments faster while keeping quality stable.",
        ],
      },
      {
        id: "resources",
        icon: FolderOpen,
        title: "Resource management",
        path: "/teacher/resources",
        color: "#8b5cf6",
        summary: "Store teaching materials for reuse in AI and content-creation workflows.",
        steps: [
          "Choose the correct grade, subject, chapter, and lesson before upload.",
          "Upload your files and review processing status afterward.",
          "Reuse these resources when building questions or learning content.",
        ],
      },
      {
        id: "create-exam",
        icon: FilePlus,
        title: "Create exams",
        path: "/teacher/create-exam",
        color: "#ef4444",
        summary: "Configure the exam, preview its content, and finalize it before use.",
        steps: [
          "Enter the exam name and select subject, grade, and exam type.",
          "Distribute questions or choose a matrix when a structured exam is needed.",
          "Preview the exam, revise any question you need, then publish or export it.",
        ],
      },
    ],
    tips: [
      {
        title: "Upload materials first",
        desc: "Strong source materials make the content workflow faster and more consistent.",
      },
      {
        title: "Keep the question bank clean",
        desc: "Clear classification by topic and difficulty saves a lot of time later.",
      },
      {
        title: "Always preview first",
        desc: "Review imported or AI-generated content before turning it into a real exam.",
      },
      {
        title: "Check data regularly",
        desc: "The dashboard is most valuable when you review progress and outcomes consistently.",
      },
    ],
  },
};

const TeacherGuide = () => {
  const [expandedId, setExpandedId] = useState(null);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const content = GUIDE_COPY[language];

  /** Navigate to the target page and clear its tour key so the tour auto-starts */
  const goWithTour = (path) => {
    // The GuidedTour component stores "seen" under eduboost_tour_<key>
    // Key is constructed from the pathname in each page component.
    // We clear any known variant:
    const slug = path.replace(/^\/teacher\//, "").replace(/\//g, "-");
    localStorage.removeItem(`eduboost_tour_${slug}`);
    localStorage.removeItem(`eduboost_tour_teacher_${slug}`);
    navigate(path);
  };

  return (
    <div className="guide-page">
      <div className="guide-header">
        <div className="guide-header-icon">
          <BookOpen size={28} color="#fff" />
        </div>
        <div>
          <h1>{content.headerTitle}</h1>
          <p>{content.headerText}</p>
        </div>
      </div>

      <div className="guide-categories glass">
        <h2>
          <BookOpen size={20} /> {content.categoriesTitle}
        </h2>
        <div className="guide-category-grid">
          {content.categories.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="guide-category-card">
                <div className="gcc-icon-wrap">
                  <Icon size={22} />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
                <div className="gcc-tags">
                  {item.items.map((name) => (
                    <span key={name} className="gcc-tag">{name}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="guide-sections">
        <h2>
          <HelpCircle size={20} /> {content.featuresTitle}
        </h2>

        {content.sections.map((section) => {
          const Icon = section.icon;
          const isOpen = expandedId === section.id;

          return (
            <div
              key={section.id}
              className={`guide-section glass ${isOpen ? "open" : ""}`}
            >
              <button
                type="button"
                className="guide-section-header"
                onClick={() => setExpandedId(isOpen ? null : section.id)}
              >
                <div className="gsh-left">
                  <div
                    className="gsh-icon"
                    style={{
                      background: `${section.color}15`,
                      color: section.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.summary}</p>
                  </div>
                </div>
                <div className="gsh-toggle">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className="guide-section-body">
                  <ul className="guide-steps">
                    {section.steps.map((step, index) => (
                      <li key={step}>
                        <span className="gs-dot">•</span>
                        <span className="gs-text">{step}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="guide-section-cta">
                    <button
                      type="button"
                      className="guide-link"
                      onClick={() => goWithTour(section.path)}
                    >
                      <ArrowRight size={16} />
                      Đi tới {section.title} &amp; xem hướng dẫn
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="guide-tips glass">
        <h2>
          <Lightbulb size={20} /> {content.tipsTitle}
        </h2>
        <div className="tips-grid">
          {content.tips.map((tip) => (
            <div key={tip.title} className="tip-card">
              <CheckCircle size={20} color="#10b981" />
              <div>
                <strong>{tip.title}</strong>
                <p>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .guide-page {
          padding: 1.5rem;
          max-width: 980px;
          margin: 0 auto;
        }

        .guide-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .guide-header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
          flex-shrink: 0;
        }

        .guide-header h1 {
          font-size: 1.8rem;
          margin: 0 0 4px;
        }

        .guide-header p {
          margin: 0;
          color: var(--color-text-secondary, #64748b);
        }

        .guide-categories,
        .guide-tips {
          padding: 1.5rem;
          border-radius: 18px;
          margin-bottom: 2rem;
        }

        .guide-categories h2,
        .guide-sections > h2,
        .guide-tips h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          margin: 0 0 1rem;
        }

        .guide-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 0.9rem;
        }

        .guide-category-card {
          padding: 1rem;
          border-radius: 16px;
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99, 102, 241, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .gcc-icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.2rem;
        }

        .guide-category-card strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .guide-category-card p {
          margin: 0;
          color: var(--color-text-secondary, #64748b);
          font-size: 0.86rem;
          line-height: 1.6;
        }

        .gcc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .gcc-tag {
          font-size: 0.74rem;
          font-weight: 700;
          color: #4f46e5;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.16);
          border-radius: 999px;
          padding: 0.16rem 0.55rem;
        }

        .guide-section {
          border-radius: 16px;
          margin-bottom: 0.8rem;
          overflow: hidden;
        }

        .guide-section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.2rem;
          background: transparent;
          border: none;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
        }

        .gsh-left {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex: 1;
        }

        .gsh-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gsh-left h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }

        .gsh-left p {
          margin: 0;
          color: var(--color-text-secondary, #64748b);
          font-size: 0.88rem;
          line-height: 1.6;
        }

        .gsh-toggle {
          color: #94a3b8;
        }

        .guide-section-body {
          padding: 0 1.2rem 1.2rem;
        }

        .guide-steps {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem;
          display: grid;
          gap: 0.7rem;
        }

        .guide-steps li {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.04);
        }

        .gs-dot {
          color: #6366f1;
          display: flex;
          flex-shrink: 0;
          font-size: 1.1rem;
          font-weight: 800;
          line-height: 1;
          margin-top: 0.15rem;
        }

        .gs-text {
          color: var(--color-text-primary, #334155);
          line-height: 1.65;
          font-size: 0.9rem;
        }

        .guide-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.8rem;
        }

        .tip-card {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 1rem;
          border-radius: 14px;
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.08);
        }

        .tip-card strong {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.92rem;
        }

        .tip-card p {
          margin: 0;
          color: var(--color-text-secondary, #64748b);
          line-height: 1.6;
          font-size: 0.86rem;
        }

        @media (max-width: 768px) {
          .guide-page {
            padding: 1rem;
          }

          .guide-header {
            align-items: flex-start;
          }

          .guide-header h1 {
            font-size: 1.45rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherGuide;
