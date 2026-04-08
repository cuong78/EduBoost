import { useState } from "react";
import {
  BookOpen,
  Users,
  PenLine,
  Library,
  FolderOpen,
  Table2,
  ClipboardList,
  FilePlus,
  Send,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

/* ─── Data hướng dẫn ──────────────────────────────────────────────────────────── */
const GUIDE_SECTIONS = [
  {
    id: "classes",
    icon: Users,
    title: "Lớp học",
    path: "/teacher/classes",
    color: "#10b981",
    summary: "Quản lý danh sách lớp, xem học sinh, mời và tạo tài khoản học sinh.",
    steps: [
      "Nhấn **Lớp học** trên thanh bên để xem tất cả lớp của bạn.",
      "Nhấn vào **tên lớp** để xem danh sách học sinh trong lớp.",
      "Nút **Thêm học sinh** cho phép tạo tài khoản hoặc gửi lời mời.",
      "Theo dõi trạng thái lời mời (đã chấp nhận / chờ xử lý).",
    ],
  },
  {
    id: "create-question",
    icon: PenLine,
    title: "Tạo câu hỏi",
    path: "/teacher/create-question",
    color: "#6366f1",
    summary: "Tạo câu hỏi bằng 4 phương thức: nhập tay, import Word, AI từ tài nguyên, AI biến thể.",
    steps: [
      "**Tab Nhập tay**: Điền nội dung câu hỏi, đáp án đúng, giải thích, chọn mức độ nhận thức.",
      "**Tab Import từ file**: Upload file Word (.docx) — hệ thống tự parse và lưu câu hỏi.",
      "**Tab AI từ tài nguyên**: Chọn tài liệu bài học đã upload → AI tự động sinh câu hỏi trắc nghiệm.",
      "**Tab AI biến thể**: Chọn câu hỏi có sẵn → AI tạo các biến thể mới (thay số, đổi ngữ cảnh).",
      "Luôn chọn **Khối → Môn → Chương → Bài** trước khi tạo câu hỏi.",
      "Nhấn **Xem trước & Lưu** để review trước khi lưu vào ngân hàng.",
    ],
  },
  {
    id: "question-bank",
    icon: Library,
    title: "Ngân hàng câu hỏi",
    path: "/teacher/question-bank",
    color: "#f59e0b",
    summary: "Quản lý tất cả câu hỏi: lọc, xem chi tiết, sửa, xóa.",
    steps: [
      "**Thống kê** hiển thị tổng số câu, phân theo AI / nhập tay / import.",
      "**Bộ lọc**: Khối, Môn, Chương, Bài, Nguồn gốc, Mức nhận thức.",
      "Tab **Câu hỏi của tôi** — chỉ xem câu bạn tạo. **Tất cả** — xem toàn hệ thống.",
      "Xem chi tiết, Sửa nội dung, Xóa (chỉ câu do bạn tạo) qua các nút thao tác.",
    ],
  },
  {
    id: "resources",
    icon: FolderOpen,
    title: "Quản lý tài nguyên",
    path: "/teacher/resources",
    color: "#8b5cf6",
    summary: "Upload tài liệu bài học để AI sử dụng khi tạo câu hỏi tự động.",
    steps: [
      "Chọn **Khối → Môn → Chương → Bài** để xác định vị trí upload.",
      "Nhấn **Tải lên** và chọn file (.docx, .pdf).",
      "Tài liệu sẽ được AI phân tích khi bạn dùng chức năng 'AI từ tài nguyên'.",
    ],
  },
  {
    id: "matrix",
    icon: Table2,
    title: "Quản lý ma trận đề thi",
    path: "/teacher/matrix-templates",
    color: "#ec4899",
    summary: "Tạo ma trận phân bổ câu hỏi theo mức độ nhận thức và bài học. Bắt buộc cho đề 1 tiết trở lên.",
    steps: [
      "Nhấn **Tạo ma trận mới** → chọn Loại đề, Môn, Khối.",
      "**Phần 1**: Nhập số câu cho từng mức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao). Điểm tự chia đều = 10đ.",
      "**Phần 2**: Chọn Chương → Bài → phân bổ số câu theo từng bài cho mỗi mức.",
      "Tổng theo cột ở Phần 2 phải **khớp** với số câu ở Phần 1.",
      "Tab **Cộng đồng**: Xem và sử dụng ma trận của giáo viên khác.",
    ],
  },
  {
    id: "exam-management",
    icon: ClipboardList,
    title: "Quản lý đề thi",
    path: "/teacher/exams",
    color: "#0ea5e9",
    summary: "Xem, xuất PDF, xuất bản, xem thống kê tất cả đề thi đã tạo.",
    steps: [
      "Tab **Đề của tôi**: Danh sách đề với trạng thái Nháp → Đã dùng → Đã xuất bản.",
      "Tab **Cộng đồng**: Đề thi đã xuất bản bởi giáo viên khác.",
      "Bộ lọc: Môn, Khối, Loại đề, Trạng thái.",
      "**Xem đề** — mở trong trình xem đầy đủ.",
      "**Thống kê** — phân bố theo mức nhận thức và bài học.",
      "**Xuất PDF** — 2 lựa chọn: Đề thi (không đáp án) hoặc Đáp án (kèm đáp án đúng).",
      "**Xuất bản** — công bố cho giáo viên khác xem.",
      "**Xóa** — chỉ khi ở trạng thái Nháp hoặc Đã dùng.",
    ],
  },
  {
    id: "create-exam",
    icon: FilePlus,
    title: "Tạo đề thi",
    path: "/teacher/create-exam",
    color: "#ef4444",
    summary: "Tạo đề thi 3 bước: Cấu hình → Phân bổ → Preview & Chỉnh sửa.",
    steps: [
      "**Bước 1 — Cấu hình**: Nhập tên đề, chọn Môn/Khối/Loại đề.",
      "Đề **15 phút**: chọn Chương → Bài trực tiếp.",
      "Đề **1 tiết / Giữa kỳ / Cuối kỳ**: chọn Ma trận (đã tạo sẵn ở Quản lý ma trận).",
      "**Bước 2 — Phân bổ** (chỉ đề 15 phút): Phân bổ số câu theo bài và mức nhận thức.",
      "Nhấn **Tạo đề thi** → Hệ thống lấy câu từ ngân hàng + AI sinh thêm nếu thiếu (30–60 giây).",
      "**Bước 3 — Preview**: Xem toàn bộ đề thi với các thao tác:",
      "  • Sửa câu — chỉnh nội dung, đáp án, đáp án nhiễu.",
      "  • AI tạo lại — xóa câu hiện tại và yêu cầu AI sinh câu mới.",
      "  • Thay từ ngân hàng — chọn câu khác từ ngân hàng câu hỏi.",
      "  • Kéo thả — sắp xếp lại thứ tự câu hỏi.",
      "  • Trộn đề — tạo nhiều phiên bản đề bằng xáo trộn.",
      "  • Xuất PDF — xuất đề / đáp án thành file PDF.",
      "  • Công bố — xuất bản đề cho giáo viên/học sinh xem.",
    ],
  },
  {
    id: "feedback",
    icon: Send,
    title: "Góp ý",
    path: "/teacher/feedback",
    color: "#14b8a6",
    summary: "Gửi phản hồi, báo lỗi, đề xuất tính năng mới cho hệ thống.",
    steps: [
      "Nhập nội dung góp ý và nhấn **Gửi**.",
      "Admin sẽ nhận và xử lý phản hồi của bạn.",
    ],
  },
];

const GUIDE_CATEGORIES = [
  {
    id: "classroom",
    icon: Users,
    title: "Quản lý lớp học",
    desc: "Thiết lập lớp, quản lý học sinh và tài khoản học sinh.",
    items: ["Lớp học"],
  },
  {
    id: "content",
    icon: FolderOpen,
    title: "Nội dung học tập",
    desc: "Chuẩn bị tài nguyên và xây dựng ngân hàng câu hỏi.",
    items: ["Quản lý tài nguyên", "Tạo câu hỏi", "Ngân hàng câu hỏi"],
  },
  {
    id: "assessment",
    icon: FilePlus,
    title: "Đề thi & Đánh giá",
    desc: "Thiết kế ma trận, tạo đề, theo dõi và xuất bản đề thi.",
    items: ["Quản lý ma trận đề thi", "Tạo đề thi", "Quản lý đề thi"],
  },
  {
    id: "support",
    icon: ShieldCheck,
    title: "Hỗ trợ & Phản hồi",
    desc: "Gửi phản hồi, báo lỗi và theo dõi hỗ trợ từ hệ thống.",
    items: ["Góp ý"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════ */
const TeacherGuide = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="guide-page">
      {/* Header */}
      <div className="guide-header">
        <div className="guide-header-icon">
          <BookOpen size={28} color="#fff" />
        </div>
        <div>
          <h1>Hướng dẫn sử dụng</h1>
          <p>Tất cả những gì bạn cần biết để sử dụng EduBoost một cách hiệu quả.</p>
        </div>
      </div>

      {/* Category Overview */}
      <div className="guide-categories glass">
        <h2>
          <BookOpen size={20} /> Danh mục hướng dẫn
        </h2>
        <div className="guide-category-grid">
          {GUIDE_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="guide-category-card">
                <div className="gcc-icon-wrap">
                  <CategoryIcon size={22} />
                </div>
                <strong>{category.title}</strong>
                <p>{category.desc}</p>
                <div className="gcc-tags">
                  {category.items.map((item) => (
                    <span key={item} className="gcc-tag">{item}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Sections */}
      <div className="guide-sections">
        <h2>
          <HelpCircle size={20} /> Hướng dẫn chi tiết từng chức năng
        </h2>

        {GUIDE_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isOpen = expandedId === section.id;

          return (
            <div
              key={section.id}
              className={`guide-section glass ${isOpen ? "open" : ""}`}
            >
              <button
                className="guide-section-header"
                onClick={() => toggle(section.id)}
              >
                <div className="gsh-left">
                  <div
                    className="gsh-icon"
                    style={{ background: `${section.color}15`, color: section.color }}
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
                  <ol className="guide-steps">
                    {section.steps.map((step, i) => (
                      <li key={i}>
                        <span className="gs-num">{i + 1}</span>
                        <span
                          className="gs-text"
                          dangerouslySetInnerHTML={{
                            __html: step
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/• /g, "&nbsp;&nbsp;• "),
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                  <div className="guide-section-cta">
                    <a href={section.path} className="guide-link">
                      <ArrowRight size={16} />
                      Đi tới {section.title}
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="guide-tips glass">
        <h2>
          <Lightbulb size={20} /> Mẹo sử dụng hiệu quả
        </h2>
        <div className="tips-grid">
          <div className="tip-card">
            <CheckCircle size={20} color="#10b981" />
            <div>
              <strong>Upload tài liệu trước</strong>
              <p>Có tài liệu bài học → AI tạo câu hỏi chất lượng hơn.</p>
            </div>
          </div>
          <div className="tip-card">
            <CheckCircle size={20} color="#10b981" />
            <div>
              <strong>Dùng AI biến thể</strong>
              <p>Từ 10 câu gốc, AI tạo ra 30–50 biến thể → ngân hàng đề phong phú.</p>
            </div>
          </div>
          <div className="tip-card">
            <CheckCircle size={20} color="#10b981" />
            <div>
              <strong>Tạo ma trận chuẩn</strong>
              <p>Ma trận tốt = đề thi cân bằng giữa các mức nhận thức.</p>
            </div>
          </div>
          <div className="tip-card">
            <CheckCircle size={20} color="#10b981" />
            <div>
              <strong>Review trước khi xuất</strong>
              <p>Luôn xem lại và chỉnh sửa câu hỏi AI sinh trước khi xuất PDF.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .guide-page {
          padding: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
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
          font-weight: 800;
          margin: 0 0 4px;
          color: var(--color-text-primary, #1e293b);
        }
        .guide-header p {
          margin: 0;
          color: var(--color-text-secondary, #64748b);
          font-size: 1rem;
        }

        /* Category overview */
        .guide-categories {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }
        .guide-categories h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 1.25rem;
          color: var(--color-text-primary, #1e293b);
        }

        .guide-category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }

        .guide-category-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 16px 12px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99, 102, 241, 0.08);
          position: relative;
          transition: all 0.2s;
        }
        .guide-category-card:hover {
          background: rgba(99, 102, 241, 0.08);
          transform: translateY(-2px);
        }
        .gcc-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08));
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          color: #6366f1;
        }

        .guide-category-card strong {
          font-size: 0.9rem;
          color: var(--color-text-primary, #1e293b);
          display: block;
          margin-bottom: 4px;
        }

        .guide-category-card p {
          font-size: 0.78rem;
          color: var(--color-text-secondary, #64748b);
          margin: 0 0 8px;
          line-height: 1.4;
        }

        .gcc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .gcc-tag {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #4f46e5;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.16);
        }

        /* Sections */
        .guide-sections {
          margin-bottom: 2rem;
        }
        .guide-sections > h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 1rem;
          color: var(--color-text-primary, #1e293b);
        }

        .guide-section {
          border-radius: 14px;
          margin-bottom: 10px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .guide-section.open {
          box-shadow: 0 8px 25px rgba(0,0,0,0.06);
        }

        .guide-section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          gap: 12px;
          transition: background 0.2s;
        }
        .guide-section-header:hover {
          background: rgba(0,0,0,0.02);
        }

        .gsh-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }
        .gsh-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gsh-left h3 {
          margin: 0 0 2px;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary, #1e293b);
        }
        .gsh-left p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--color-text-secondary, #64748b);
          line-height: 1.4;
        }
        .gsh-toggle {
          color: var(--color-text-secondary, #94a3b8);
          flex-shrink: 0;
        }

        .guide-section-body {
          padding: 0 20px 20px;
          animation: fadeSlideDown 0.3s ease;
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .guide-steps {
          list-style: none;
          padding: 0;
          margin: 0 0 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .guide-steps li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.03);
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--color-text-primary, #334155);
        }
        .gs-num {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: #6366f1;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.72rem;
          font-weight: 700;
          margin-top: 1px;
        }
        .gs-text {
          flex: 1;
        }

        .guide-section-cta {
          padding-top: 4px;
        }
        .guide-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        .guide-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
        }

        /* Tips */
        .guide-tips {
          padding: 1.5rem;
          border-radius: 16px;
        }
        .guide-tips h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 1rem;
          color: var(--color-text-primary, #1e293b);
        }
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .tip-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.04);
          border: 1px solid rgba(16, 185, 129, 0.1);
        }
        .tip-card svg {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .tip-card strong {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-text-primary, #1e293b);
          margin-bottom: 3px;
        }
        .tip-card p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--color-text-secondary, #64748b);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .guide-page { padding: 1rem; }
          .guide-header h1 { font-size: 1.4rem; }
          .guide-category-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default TeacherGuide;
