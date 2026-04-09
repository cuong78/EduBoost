import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileMinus2,
  FileCheck2,
  HelpCircle,
  Lightbulb,
  Printer,
  ScanLine,
  Send,
  Shuffle,
  FilePlus,
  Workflow,
} from "lucide-react";
import { useLanguage } from "../../contexts/language-context";
import "./FeaturePage.css";

const COPY = {
  vi: {
    badge: "Tính năng",
    headerTitle: "Trộn đề – Chấm phiếu offline",
    headerText:
      "Trộn đề thi thành nhiều mã đề khác nhau, in phiếu trả lời và chấm điểm tự động bằng camera hoặc máy scan.",
    primaryCta: "Bắt đầu ngay",
    secondaryCta: "Xem hướng dẫn",
    workflowTitle: "Quy trình trộn đề và chấm phiếu offline",
    stepLabel: "Bước",
    workflow: [
      { icon: FilePlus, title: "Chọn đề thi", desc: "Lấy đề từ ngân hàng hoặc tạo mới, sẵn sàng cho bước trộn." },
      { icon: Shuffle, title: "Trộn mã đề", desc: "Hệ thống tự tạo nhiều mã đề bằng cách xáo trộn câu hỏi và đáp án." },
      { icon: Printer, title: "In đề & phiếu", desc: "In đề thi và phiếu trả lời dạng trắc nghiệm cho học sinh." },
      { icon: ScanLine, title: "Chấm tự động", desc: "Scan hoặc chụp ảnh phiếu trả lời, hệ thống chấm điểm tức thì." },
      { icon: FileCheck2, title: "Lưu & tổng hợp", desc: "Kết quả lưu tự động, tổng hợp điểm theo lớp và từng học sinh." },
    ],
    featuresTitle: "Tính năng chi tiết",
    sections: [
      {
        id: "mix",
        icon: Shuffle,
        color: "#8b5cf6",
        title: "Trộn đề tự động",
        summary: "Tạo nhiều mã đề từ một bộ câu hỏi, xáo trộn câu và đáp án để chống gian lận.",
        steps: [
          "Chọn bộ câu hỏi từ ngân hàng hoặc đề đã tạo sẵn.",
          "Cấu hình số mã đề cần tạo và mức độ xáo trộn (câu hỏi, đáp án hoặc cả hai).",
          "Tải xuống tất cả mã đề và đáp án tương ứng dưới dạng PDF.",
        ],
      },
      {
        id: "print",
        icon: Printer,
        color: "#0f7cf0",
        title: "In đề & phiếu trả lời",
        summary: "Xuất phiếu trả lời chuẩn OMR, sẵn sàng in và phát cho học sinh.",
        steps: [
          "Hệ thống tự tạo phiếu trả lời khớp với từng mã đề.",
          "Mỗi phiếu có mã QR nhận diện mã đề và số báo danh học sinh.",
          "In phiếu từ PDF hoặc xuất sang máy in khổ A4.",
        ],
      },
      {
        id: "scan",
        icon: ScanLine,
        color: "#ef4444",
        title: "Chấm điểm tự động",
        summary: "Dùng camera điện thoại hoặc máy scan để nhận diện phiếu và chấm điểm không cần nhập tay.",
        steps: [
          "Mở tính năng Chấm phiếu và chọn phiên thi tương ứng.",
          "Scan từng phiếu hoặc upload ảnh hàng loạt lên hệ thống.",
          "Điểm số được tính tức thì sau khi nhận diện thành công.",
        ],
      },
      {
        id: "result",
        icon: FileCheck2,
        color: "#10b981",
        title: "Tổng hợp kết quả",
        summary: "Toàn bộ kết quả lưu tự động, có thể xem, chỉnh sửa và xuất báo cáo.",
        steps: [
          "Xem bảng điểm toàn lớp sau khi chấm xong tất cả phiếu.",
          "Chỉnh sửa thủ công các trường hợp nhận diện không chính xác.",
          "Xuất kết quả ra Excel hoặc PDF để lưu trữ và báo cáo.",
        ],
      },
    ],
    tipsTitle: "Mẹo sử dụng tính năng hiệu quả",
    tips: [
      { title: "In phiếu chất lượng cao", desc: "Dùng máy in laser hoặc độ phân giải cao để đảm bảo vòng tô rõ nét." },
      { title: "Hướng dẫn học sinh tô đúng", desc: "Học sinh cần tô đậm và gọn trong vòng – tô nhạt sẽ khó nhận diện." },
      { title: "Dùng ánh sáng đủ khi chụp", desc: "Khi dùng camera điện thoại, chụp ở nơi đủ sáng, tránh bóng đổ." },
      { title: "Xem lại trước khi lưu", desc: "Kiểm tra kết quả nhận diện trước khi xác nhận để phát hiện bất thường." },
    ],
  },
  en: {
    badge: "Feature",
    headerTitle: "Offline Exam Mixing & Grading",
    headerText:
      "Shuffle exam questions into multiple versions, print answer sheets, and grade them automatically using a camera or scanner.",
    primaryCta: "Get started",
    secondaryCta: "View guide",
    workflowTitle: "Offline exam mixing & grading workflow",
    stepLabel: "Step",
    workflow: [
      { icon: FilePlus, title: "Select exam", desc: "Pick from your question bank or create new questions for shuffling." },
      { icon: Shuffle, title: "Mix versions", desc: "The system generates multiple exam versions by randomizing questions and answers." },
      { icon: Printer, title: "Print exams & sheets", desc: "Print the exam and OMR answer sheets for students." },
      { icon: ScanLine, title: "Auto-grade", desc: "Scan or photograph sheets; the system identifies and scores instantly." },
      { icon: FileCheck2, title: "Save & consolidate", desc: "Results are saved automatically and aggregated by class and student." },
    ],
    featuresTitle: "Feature details",
    sections: [
      {
        id: "mix",
        icon: Shuffle,
        color: "#8b5cf6",
        title: "Auto exam shuffling",
        summary: "Generate multiple exam versions from one question set by randomizing questions and choices.",
        steps: [
          "Choose a question set from the bank or use an existing exam.",
          "Configure the number of versions and shuffle level.",
          "Download all versions and their answer keys as PDFs.",
        ],
      },
      {
        id: "print",
        icon: Printer,
        color: "#0f7cf0",
        title: "Print exams & answer sheets",
        summary: "Export standard OMR answer sheets, ready to print and distribute.",
        steps: [
          "The system auto-generates answer sheets matched to each version.",
          "Each sheet includes a QR code for version and student identification.",
          "Print directly from PDF or export for an A4 printer.",
        ],
      },
      {
        id: "scan",
        icon: ScanLine,
        color: "#ef4444",
        title: "Automatic grading",
        summary: "Use a phone camera or scanner to recognize sheets and grade without manual entry.",
        steps: [
          "Open the Grading feature and select the corresponding session.",
          "Scan sheets or upload batch photos.",
          "Scores are calculated instantly after successful recognition.",
        ],
      },
      {
        id: "result",
        icon: FileCheck2,
        color: "#10b981",
        title: "Results consolidation",
        summary: "All results are saved automatically and can be reviewed, edited, and exported.",
        steps: [
          "View the full class score table after grading all sheets.",
          "Manually correct any entries where recognition was inaccurate.",
          "Export results as Excel or PDF for records or reporting.",
        ],
      },
    ],
    tipsTitle: "Tips for effective use",
    tips: [
      { title: "Use high-quality printing", desc: "Use a laser printer or high resolution to keep bubbles crisp." },
      { title: "Instruct students on filling", desc: "Bubbles must be filled darkly and within the ring for reliable recognition." },
      { title: "Ensure good lighting", desc: "When using a phone camera, shoot in well-lit conditions without shadows." },
      { title: "Review before saving", desc: "Check recognition results before confirming to catch unusual entries." },
    ],
  },
};

const OfflineExam = () => {
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
          <div className="fp-hero__icon-wrap" style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)" }}>
            <FileMinus2 size={30} color="#fff" />
          </div>
          <span className="fp-badge">{content.badge}</span>
          <h1>{content.headerTitle}</h1>
          <p>{content.headerText}</p>
          <div className="fp-hero__actions">
            <Link to="/register" className="fp-btn fp-btn--primary" style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)", boxShadow: "0 14px 28px rgba(139,92,246,0.22)" }}>
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
              <div key={item.title} className="fp-workflow-step" style={{ borderColor: "rgba(139,92,246,0.12)", background: "rgba(139,92,246,0.04)" }}>
                <div className="fp-ws-icon" style={{ background: "rgba(139,92,246,0.14)", color: "#8b5cf6" }}><Icon size={22} /></div>
                <span className="fp-ws-num" style={{ color: "#8b5cf6" }}>{content.stepLabel} {i + 1}</span>
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
          <Send size={28} color="#8b5cf6" />
          <h2>{language === "vi" ? "Sẵn sàng trộn đề và chấm phiếu tự động?" : "Ready to shuffle and auto-grade your exams?"}</h2>
          <p>{language === "vi" ? "Tiết kiệm hàng giờ chấm bài thủ công mỗi kỳ kiểm tra." : "Save hours of manual grading every exam season."}</p>
          <Link to="/register" className="fp-btn fp-btn--primary" style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)", boxShadow: "0 14px 28px rgba(139,92,246,0.22)" }}>
            {content.primaryCta} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OfflineExam;
