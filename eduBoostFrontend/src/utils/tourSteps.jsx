/**
 * Tour Steps Configuration — Teacher Role
 * Mỗi key tương ứng với 1 pathname, chứa array các step cho react-joyride.
 */

import {
  BookOpen,
  ClipboardList,
  FilePlus,
  FolderOpen,
  Library,
  PenLine,
  Send,
  Table2,
  Users,
} from "lucide-react";

// ─── Helper: tạo step nhanh ──────────────────────────────────────────────────
const s = (target, title, content, placement = "bottom", Icon = null) => ({
  target,
  content: (
    <div>
      <h4
        style={{
          margin: "0 0 6px",
          fontSize: "1rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {Icon ? (
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              color: "#4f46e5",
              flexShrink: 0,
            }}
          >
            <Icon size={14} />
          </span>
        ) : null}
        <span>{title}</span>
      </h4>
      <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>{content}</p>
    </div>
  ),
  placement,
  disableBeacon: true,
});

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR TOUR — chạy 1 lần khi lần đầu vào Teacher Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export const TEACHER_SIDEBAR_STEPS = [
  s(
    "body",
    "Bắt đầu tour EduBoost",
    "Mình sẽ hướng dẫn nhanh các khu vực quan trọng ở thanh menu bên trái để bạn dùng hệ thống dễ hơn.",
    "center"
  ),
  s(
    '[data-tour="nav-classes"]',
    "Lớp học",
    "Quản lý danh sách lớp, xem học sinh, mời học sinh vào lớp.",
    "right",
    Users
  ),
  s(
    '[data-tour="nav-create-question"]',
    "Tạo câu hỏi",
    "Tạo câu hỏi bằng nhiều cách: nhập tay, import file Word, hoặc AI tự động sinh.",
    "right",
    PenLine
  ),
  s(
    '[data-tour="nav-question-bank"]',
    "Ngân hàng câu hỏi",
    "Xem tất cả câu hỏi đã tạo, lọc theo môn/chương/bài, sửa/xóa câu hỏi.",
    "right",
    Library
  ),
  s(
    '[data-tour="nav-resources"]',
    "Quản lý tài nguyên",
    "Upload tài liệu bài học (.docx, .pdf) để AI sử dụng khi tạo câu hỏi.",
    "right",
    FolderOpen
  ),
  s(
    '[data-tour="nav-matrix"]',
    "Quản lý ma trận",
    "Tạo ma trận phân bổ câu hỏi theo mức độ nhận thức. Cần có trước khi tạo đề 1 tiết trở lên.",
    "right",
    Table2
  ),
  s(
    '[data-tour="nav-exams"]',
    "Quản lý đề thi",
    "Xem, xuất PDF, xuất bản, thống kê tất cả đề thi bạn đã tạo.",
    "right",
    ClipboardList
  ),
  s(
    '[data-tour="nav-create-exam"]',
    "Tạo đề thi",
    "Tạo đề thi mới: chọn môn, ma trận → hệ thống tự chọn câu từ ngân hàng + AI sinh thêm nếu thiếu.",
    "right",
    FilePlus
  ),
  s(
    '[data-tour="nav-feedback"]',
    "Góp ý",
    "Gửi phản hồi, báo lỗi hoặc đề xuất tính năng mới cho hệ thống.",
    "right",
    Send
  ),
  s(
    '[data-tour="nav-guide"]',
    "Hướng dẫn",
    "Bạn có thể xem lại hướng dẫn sử dụng chi tiết bất cứ lúc nào tại đây!",
    "right",
    BookOpen
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// TẠO CÂU HỎI
// ═══════════════════════════════════════════════════════════════════════════════
export const CREATE_QUESTION_STEPS = [
  s(
    '[data-tour="cq-tab-manual"]',
    "Tab: Nhập tay",
    "Nhập câu hỏi trực tiếp: điền nội dung, đáp án đúng, chọn mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)."
  ),
  s(
    '[data-tour="cq-tab-import"]',
    "Tab: Import từ file",
    "Tải lên file Word (.docx) chứa câu hỏi theo định dạng chuẩn để import hàng loạt vào ngân hàng câu hỏi."
  ),
  s(
    '[data-tour="cq-tab-ai-resource"]',
    "Tab: AI từ tài nguyên",
    "AI sẽ đọc tài liệu bài học đã upload và tự động tạo câu hỏi trắc nghiệm phù hợp."
  ),
  s(
    '[data-tour="cq-tab-ai-variation"]',
    "Tab: AI biến thể",
    "Chọn câu hỏi có sẵn trong ngân hàng → AI tạo các biến thể mới để làm phong phú bộ đề."
  ),
  s(
    '[data-tour="cq-knowledge-picker"]',
    "Bộ chọn môn học",
    "Luôn chọn đúng Khối → Môn → Chương → Bài học trước khi tạo câu hỏi. Câu hỏi sẽ được phân loại theo bài học.",
    "top"
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// NGÂN HÀNG CÂU HỎI
// ═══════════════════════════════════════════════════════════════════════════════
export const QUESTION_BANK_STEPS = [
  s(
    '[data-tour="qb-stats"]',
    "Thống kê tổng quan",
    "Xem nhanh số lượng câu hỏi: tổng, AI tạo, nhập tay, import từ file."
  ),
  s(
    '[data-tour="qb-filters"]',
    "Bộ lọc nâng cao",
    "Lọc câu hỏi theo Khối, Môn, Chương, Bài, Nguồn gốc (AI/nhập tay/import), và Mức độ nhận thức."
  ),
  s(
    '[data-tour="qb-tabs"]',
    "Câu hỏi của tôi / Tất cả",
    "Chuyển đổi giữa: xem chỉ câu bạn tạo hoặc xem tất cả câu hỏi trong hệ thống."
  ),
  s(
    '[data-tour="qb-list"]',
    "Danh sách câu hỏi",
    "Nhấn 👁️ để xem chi tiết, ✏️ để sửa, 🗑️ để xóa (chỉ câu do bạn tạo)."
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// QUẢN LÝ MA TRẬN
// ═══════════════════════════════════════════════════════════════════════════════
export const MATRIX_MANAGEMENT_STEPS = [
  s(
    '[data-tour="mm-create-btn"]',
    "Tạo ma trận mới",
    "Nhấn để tạo ma trận đề thi: chọn loại đề, môn, khối → nhập số câu theo mức nhận thức → phân bổ theo bài học."
  ),
  s(
    '[data-tour="mm-tabs"]',
    "Ma trận của tôi / Cộng đồng",
    "Chuyển đổi giữa ma trận bạn tạo và ma trận được chia sẻ từ giáo viên khác."
  ),
  s(
    '[data-tour="mm-filters"]',
    "Bộ lọc",
    "Lọc theo khối lớp, môn học, loại đề thi để tìm nhanh ma trận."
  ),
  s(
    '[data-tour="mm-list"]',
    "Danh sách ma trận",
    "Nhấn mở rộng (▼) để xem phân bổ theo mức độ. Nhấn 👁️ xem chi tiết, ✏️ sửa, 🗑️ xóa."
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// QUẢN LÝ ĐỀ THI
// ═══════════════════════════════════════════════════════════════════════════════
export const EXAM_MANAGEMENT_STEPS = [
  s(
    '[data-tour="em-create-btn"]',
    "Tạo đề mới",
    "Nhấn để bắt đầu tạo đề thi mới. Bạn sẽ được dẫn qua 3 bước: Cấu hình → Phân bổ → Preview."
  ),
  s(
    '[data-tour="em-tabs"]',
    "Đề của tôi / Cộng đồng",
    "Xem đề thi bạn tạo hoặc đề đã xuất bản bởi giáo viên khác."
  ),
  s(
    '[data-tour="em-filters"]',
    "Bộ lọc đề thi",
    "Lọc theo Môn, Khối, Loại đề, Trạng thái (Nháp → Đã dùng → Đã xuất bản)."
  ),
  s(
    '[data-tour="em-table"]',
    "Bảng đề thi",
    "Các thao tác: 👁️ Xem đề | 📊 Thống kê | ⬇️ Xuất PDF | 🌐 Xuất bản | 🗑️ Xóa."
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// TẠO ĐỀ THI (ExamGenerator)
// ═══════════════════════════════════════════════════════════════════════════════
export const CREATE_EXAM_STEPS = [
  s(
    '[data-tour="eg-config"]',
    "Bước 1: Cấu hình",
    "Nhập tên đề, chọn Môn / Khối / Loại đề. Đề 15 phút: chọn bài trực tiếp. Đề 1 tiết trở lên: chọn Ma trận."
  ),
  s(
    '[data-tour="eg-generate-btn"]',
    "Nút tạo đề",
    "Nhấn để hệ thống tự động chọn câu từ ngân hàng. Nếu thiếu, AI sẽ sinh thêm (có thể mất 30-60 giây)."
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// LỚP HỌC
// ═══════════════════════════════════════════════════════════════════════════════
export const CLASS_LIST_STEPS = [
  s(
    '[data-tour="cl-list"]',
    "Danh sách lớp",
    "Nhấn vào tên lớp để xem danh sách học sinh, quản lý lời mời."
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// TÀI NGUYÊN
// ═══════════════════════════════════════════════════════════════════════════════
export const RESOURCE_STEPS = [
  s(
    '[data-tour="rm-page"]',
    "Quản lý tài nguyên",
    "Upload tài liệu (.docx, .pdf) cho từng bài học. AI sẽ đọc tài liệu này để tạo câu hỏi chất lượng."
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
// Map pathname → steps
// ═══════════════════════════════════════════════════════════════════════════════
export const TOUR_STEPS_MAP = {
  "/teacher/classes": CLASS_LIST_STEPS,
  "/teacher/create-question": CREATE_QUESTION_STEPS,
  "/teacher/question-bank": QUESTION_BANK_STEPS,
  "/teacher/resources": RESOURCE_STEPS,
  "/teacher/matrix-templates": MATRIX_MANAGEMENT_STEPS,
  "/teacher/exams": EXAM_MANAGEMENT_STEPS,
  "/teacher/create-exam": CREATE_EXAM_STEPS,
};
