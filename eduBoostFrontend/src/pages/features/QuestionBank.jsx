import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Filter,
  HelpCircle,
  Layers,
  Lightbulb,
  PenLine,
  Send,
  Tag,
  Workflow,
} from "lucide-react";
import { useLanguage } from "../../contexts/language-context";
import "./FeaturePage.css";

const COPY = {
  vi: {
    badge: "Tính năng",
    headerTitle: "Ngân hàng câu hỏi",
    headerText:
      "Xây dựng kho câu hỏi có tổ chức theo môn học, khối lớp và mức độ nhận thức để tái sử dụng dễ dàng cho nhiều kỳ thi.",
    primaryCta: "Bắt đầu ngay",
    secondaryCta: "Xem hướng dẫn",
    workflowTitle: "Quy trình xây dựng và sử dụng ngân hàng câu hỏi",
    stepLabel: "Bước",
    workflow: [
      { icon: PenLine, title: "Tạo câu hỏi", desc: "Nhập câu hỏi thủ công, import file hoặc hỗ trợ AI soạn nháp." },
      { icon: Tag, title: "Phân loại", desc: "Gắn nhãn môn, khối, chương, bài và mức độ nhận thức cho từng câu." },
      { icon: Layers, title: "Tổ chức theo bộ", desc: "Nhóm câu hỏi theo chủ đề hoặc mục tiêu học tập cụ thể." },
      { icon: Filter, title: "Tìm kiếm & lọc", desc: "Tra cứu nhanh theo nhiều tiêu chí để chọn câu hỏi phù hợp." },
      { icon: Database, title: "Tái sử dụng", desc: "Lấy câu hỏi từ ngân hàng đưa vào đề thi bất kỳ lúc nào." },
    ],
    featuresTitle: "Tính năng chi tiết",
    sections: [
      {
        id: "create",
        icon: PenLine,
        color: "#0f7cf0",
        title: "Tạo và quản lý câu hỏi",
        summary: "Tạo câu hỏi trắc nghiệm nhiều lựa chọn, đúng/sai hoặc điền đáp án với đầy đủ giải thích.",
        steps: [
          "Chọn loại câu hỏi: trắc nghiệm, đúng/sai hoặc điền vào chỗ trống.",
          "Nhập nội dung câu hỏi, đáp án và giải thích chi tiết.",
          "Gắn nhãn mức độ nhận thức theo thang Bloom: nhớ, hiểu, vận dụng...",
        ],
      },
      {
        id: "classify",
        icon: Tag,
        color: "#f59e0b",
        title: "Phân loại theo cấu trúc chương trình",
        summary: "Tổ chức câu hỏi theo cấu trúc môn học, khối lớp, chương và bài học cụ thể.",
        steps: [
          "Liên kết từng câu hỏi với môn học, khối lớp và chương trình học cụ thể.",
          "Gắn tag để tóm tắt nội dung và tìm kiếm nhanh hơn.",
          "Xem thống kê phân phối câu hỏi theo mức độ và theo bài học.",
        ],
      },
      {
        id: "search",
        icon: Filter,
        color: "#10b981",
        title: "Tìm kiếm và lọc nâng cao",
        summary: "Lọc câu hỏi theo nhiều tiêu chí kết hợp để tìm đúng câu hỏi cần dùng trong vài giây.",
        steps: [
          "Lọc theo môn học, khối lớp, chương, bài và mức độ nhận thức.",
          "Tìm kiếm toàn văn trong nội dung câu hỏi và đáp án.",
          "Lưu bộ lọc thường dùng để tái sử dụng trong các lần sau.",
        ],
      },
      {
        id: "reuse",
        icon: Database,
        color: "#8b5cf6",
        title: "Tái sử dụng trong đề thi",
        summary: "Chọn câu hỏi trực tiếp từ ngân hàng khi tạo đề thi, không cần nhập lại.",
        steps: [
          "Khi tạo đề thi, mở ngân hàng câu hỏi và lọc theo nhu cầu.",
          "Chọn từng câu hoặc chọn theo số lượng ngẫu nhiên theo tiêu chí.",
          "Câu hỏi được thêm vào đề ngay lập tức, sẵn sàng xem trước và hoàn thiện.",
        ],
      },
    ],
    tipsTitle: "Mẹo xây dựng ngân hàng câu hỏi chất lượng",
    tips: [
      { title: "Phân loại ngay từ đầu", desc: "Gắn đầy đủ nhãn khi tạo câu hỏi để về sau không mất công phân loại lại." },
      { title: "Thêm giải thích chi tiết", desc: "Câu hỏi có giải thích rõ ràng giúp học sinh học từ sai lầm và giáo viên đánh giá đúng hơn." },
      { title: "Xây dựng đủ các mức độ", desc: "Đảm bảo có câu hỏi ở nhiều mức độ nhận thức để tạo đề cân bằng." },
      { title: "Dọn dẹp định kỳ", desc: "Xoá hoặc cập nhật câu hỏi lỗi thời để giữ ngân hàng luôn chính xác và đáng tin cậy." },
    ],
  },
  en: {
    badge: "Feature",
    headerTitle: "Question Bank",
    headerText:
      "Build a structured library of questions organized by subject, grade, and cognitive level — easy to reuse across multiple exams.",
    primaryCta: "Get started",
    secondaryCta: "View guide",
    workflowTitle: "Question bank build & use workflow",
    stepLabel: "Step",
    workflow: [
      { icon: PenLine, title: "Create questions", desc: "Enter manually, import files, or use AI-assisted drafting." },
      { icon: Tag, title: "Classify", desc: "Tag each question with subject, grade, chapter, lesson, and difficulty." },
      { icon: Layers, title: "Organize into sets", desc: "Group questions by topic or specific learning objective." },
      { icon: Filter, title: "Search & filter", desc: "Find the right questions in seconds using multi-criteria filters." },
      { icon: Database, title: "Reuse", desc: "Pull questions from the bank directly into any exam." },
    ],
    featuresTitle: "Feature details",
    sections: [
      {
        id: "create",
        icon: PenLine,
        color: "#0f7cf0",
        title: "Create & manage questions",
        summary: "Create multiple-choice, true/false, or fill-in-the-blank questions with full explanations.",
        steps: [
          "Select the question type: multiple choice, true/false, or fill-in-the-blank.",
          "Enter the question body, answer choices, and a detailed explanation.",
          "Tag the cognitive level using Bloom's taxonomy: recall, comprehension, application...",
        ],
      },
      {
        id: "classify",
        icon: Tag,
        color: "#f59e0b",
        title: "Classify by curriculum structure",
        summary: "Organize questions by subject, grade level, chapter, and specific lesson.",
        steps: [
          "Link each question to its subject, grade level, and lesson.",
          "Add tags to summarize content and enable faster searching.",
          "View distribution statistics by difficulty and by lesson.",
        ],
      },
      {
        id: "search",
        icon: Filter,
        color: "#10b981",
        title: "Advanced search & filtering",
        summary: "Filter questions by multiple combined criteria to find exactly what you need in seconds.",
        steps: [
          "Filter by subject, grade, chapter, lesson, and cognitive level.",
          "Full-text search across question content and answer choices.",
          "Save frequently used filter presets for future sessions.",
        ],
      },
      {
        id: "reuse",
        icon: Database,
        color: "#8b5cf6",
        title: "Reuse in exams",
        summary: "Select questions directly from the bank when building an exam — no re-entry needed.",
        steps: [
          "When building an exam, open the question bank and apply your filters.",
          "Select individual questions or pick a random set by criteria.",
          "Questions are added to the exam instantly, ready to preview and finalize.",
        ],
      },
    ],
    tipsTitle: "Tips for a quality question bank",
    tips: [
      { title: "Classify from the start", desc: "Tag questions fully when creating them to avoid reclassification work later." },
      { title: "Add detailed explanations", desc: "Clear explanations help students learn from mistakes and give teachers better insight." },
      { title: "Cover all difficulty levels", desc: "Make sure you have questions at multiple cognitive levels to build balanced exams." },
      { title: "Clean up regularly", desc: "Delete or update outdated questions to keep the bank accurate and trustworthy." },
    ],
  },
};

const QuestionBank = () => {
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
          <div className="fp-hero__icon-wrap" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            <Database size={30} color="#fff" />
          </div>
          <span className="fp-badge">{content.badge}</span>
          <h1>{content.headerTitle}</h1>
          <p>{content.headerText}</p>
          <div className="fp-hero__actions">
            <Link to="/register" className="fp-btn fp-btn--primary" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", boxShadow: "0 14px 28px rgba(245,158,11,0.22)" }}>
              {content.primaryCta} <ArrowRight size={18} />
            </Link>
            <Link to="/guide" className="fp-btn fp-btn--secondary">{content.secondaryCta}</Link>
          </div>
        </div>
      </section>

      <section className="fp-section container">
        <h2 className="fp-section-title"><Workflow size={20} /> {content.workflowTitle}</h2>
        <div className="fp-workflow">
          {content.workflow.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="fp-workflow-step" style={{ borderColor: "rgba(245,158,11,0.14)", background: "rgba(245,158,11,0.04)" }}>
                <div className="fp-ws-icon" style={{ background: "rgba(245,158,11,0.14)", color: "#f59e0b" }}><Icon size={22} /></div>
                <span className="fp-ws-num" style={{ color: "#f59e0b" }}>{content.stepLabel} {i + 1}</span>
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
          <Send size={28} color="#f59e0b" />
          <h2>{language === "vi" ? "Sẵn sàng xây dựng ngân hàng câu hỏi?" : "Ready to build your question bank?"}</h2>
          <p>{language === "vi" ? "Tạo kho câu hỏi có tổ chức để tái sử dụng lâu dài." : "Build a structured library you can reuse for years."}</p>
          <Link to="/register" className="fp-btn fp-btn--primary" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", boxShadow: "0 14px 28px rgba(245,158,11,0.22)" }}>
            {content.primaryCta} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default QuestionBank;
