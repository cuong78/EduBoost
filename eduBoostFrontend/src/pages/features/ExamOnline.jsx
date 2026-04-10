import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  HelpCircle,
  Lightbulb,
  MonitorCheck,
  PenLine,
  Send,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { useLanguage } from "../../contexts/language-context";
import "./FeaturePage.css";

const COPY = {
  vi: {
    badge: "Tính năng",
    headerTitle: "Thi – Kiểm tra online",
    headerText:
      "Tổ chức bài kiểm tra trực tuyến an toàn, rõ ràng và dễ theo dõi kết quả theo thời gian thực.",
    primaryCta: "Bắt đầu ngay",
    secondaryCta: "Xem hướng dẫn",
    workflowTitle: "Quy trình tổ chức bài kiểm tra online",
    stepLabel: "Bước",
    workflow: [
      {
        icon: PenLine,
        title: "Tạo đề thi",
        desc: "Xây dựng đề từ ngân hàng câu hỏi sẵn có hoặc nhập mới, phân loại theo mức độ.",
      },
      {
        icon: Users,
        title: "Phân công lớp",
        desc: "Chọn lớp học và thời gian thi, hệ thống tự gửi thông báo đến học sinh.",
      },
      {
        icon: MonitorCheck,
        title: "Học sinh làm bài",
        desc: "Học sinh truy cập bài thi trên trình duyệt, bộ đếm giờ chạy tự động.",
      },
      {
        icon: Clock,
        title: "Theo dõi realtime",
        desc: "Giáo viên xem trạng thái từng học sinh đang làm bài, đã nộp hay chưa.",
      },
      {
        icon: ClipboardList,
        title: "Xem kết quả",
        desc: "Kết quả và thống kê hiển thị ngay sau khi học sinh nộp bài.",
      },
    ],
    featuresTitle: "Tính năng chi tiết",
    sections: [
      {
        id: "security",
        icon: ShieldCheck,
        color: "#10b981",
        title: "Bảo mật bài thi",
        summary:
          "Mỗi bài thi được bảo vệ bằng mật khẩu, giới hạn thời gian và chống thoát tab trình duyệt.",
        steps: [
          "Đặt mật khẩu cho phiên thi để chỉ học sinh được phép mới có thể vào.",
          "Cấu hình số lần cảnh báo khi học sinh rời khỏi màn hình thi.",
          "Khi hết thời gian, bài thi tự nộp kể cả học sinh chưa hoàn thành.",
        ],
      },
      {
        id: "realtime",
        icon: MonitorCheck,
        color: "#0f7cf0",
        title: "Theo dõi thời gian thực",
        summary:
          "Dashboard giám sát hiển thị ai đang làm bài, ai đã nộp và ai chưa tham gia.",
        steps: [
          "Mở màn hình giám sát trong lúc diễn ra thi – không cần tải lại trang.",
          "Xem số câu đã trả lời của từng học sinh theo thời gian thực.",
          "Gửi thông báo nhắc nhở hoặc gia hạn thêm giờ nếu cần.",
        ],
      },
      {
        id: "results",
        icon: ClipboardList,
        color: "#f59e0b",
        title: "Kết quả và thống kê",
        summary:
          "Tổng hợp điểm, tỷ lệ đúng sai theo câu và theo học sinh một cách trực quan.",
        steps: [
          "Xem điểm từng học sinh, bảng xếp hạng và phân phối điểm.",
          "Phân tích câu hỏi nào nhiều học sinh trả lời sai để điều chỉnh giảng dạy.",
          "Xuất kết quả ra file để lưu trữ hoặc báo cáo.",
        ],
      },
      {
        id: "assign",
        icon: Users,
        color: "#8b5cf6",
        title: "Phân công và thông báo",
        summary:
          "Giao bài kiểm tra cho một hoặc nhiều lớp, hệ thống tự động gửi thông báo.",
        steps: [
          "Chọn lớp, thời gian bắt đầu và thời gian kết thúc cho phiên thi.",
          "Học sinh nhận thông báo trong hệ thống và có thể vào thi đúng giờ.",
          "Giáo viên có thể mở lại bài hoặc đóng sớm nếu cần thiết.",
        ],
      },
    ],
    tipsTitle: "Mẹo tổ chức thi hiệu quả",
    tips: [
      {
        title: "Kiểm tra đề trước khi mở",
        desc: "Luôn xem trước bài thi bằng tài khoản học sinh để phát hiện lỗi hiển thị.",
      },
      {
        title: "Phổ biến quy trình cho học sinh",
        desc: "Hướng dẫn học sinh cách vào thi và lưu ý về thời gian trước ngày thi.",
      },
      {
        title: "Theo dõi trong giờ thi",
        desc: "Mở màn hình giám sát trong suốt buổi thi để can thiệp kịp thời nếu có sự cố.",
      },
      {
        title: "Phân tích kết quả sau thi",
        desc: "Dùng thống kê câu hỏi để biết phần nào học sinh cần ôn tập thêm.",
      },
    ],
  },
  en: {
    badge: "Feature",
    headerTitle: "Online Exams & Assessments",
    headerText:
      "Run secure online assessments with real-time monitoring and instant results.",
    primaryCta: "Get started",
    secondaryCta: "View guide",
    workflowTitle: "Online exam workflow",
    stepLabel: "Step",
    workflow: [
      { icon: PenLine, title: "Build exam", desc: "Create from your question bank or add new items, organized by difficulty." },
      { icon: Users, title: "Assign classes", desc: "Select classes and set the exam window; students are notified automatically." },
      { icon: MonitorCheck, title: "Students take exam", desc: "Students access the exam in their browser with an auto-running timer." },
      { icon: Clock, title: "Monitor live", desc: "Watch each student's status in real time — submitted, in progress, or absent." },
      { icon: ClipboardList, title: "View results", desc: "Scores and statistics appear as soon as students submit." },
    ],
    featuresTitle: "Feature details",
    sections: [
      {
        id: "security",
        icon: ShieldCheck,
        color: "#10b981",
        title: "Exam security",
        summary: "Each session is protected by password, time limits, and tab-switch detection.",
        steps: [
          "Set a session password so only permitted students can enter.",
          "Configure how many tab-switch warnings are allowed before auto-submission.",
          "When time runs out, the exam is submitted automatically.",
        ],
      },
      {
        id: "realtime",
        icon: MonitorCheck,
        color: "#0f7cf0",
        title: "Real-time monitoring",
        summary: "A live dashboard shows who is actively testing, who has submitted, and who is absent.",
        steps: [
          "Open the monitoring screen during the exam without refreshing.",
          "See each student's answered question count in real time.",
          "Send reminders or extend time if needed.",
        ],
      },
      {
        id: "results",
        icon: ClipboardList,
        color: "#f59e0b",
        title: "Results & analytics",
        summary: "Scores, correct/incorrect rates per question and per student — all at a glance.",
        steps: [
          "View individual scores, rankings, and score distribution.",
          "Identify which questions were most frequently answered wrong.",
          "Export results for records or reporting.",
        ],
      },
      {
        id: "assign",
        icon: Users,
        color: "#8b5cf6",
        title: "Assignment & notifications",
        summary: "Assign exams to one or more classes and let the system notify students.",
        steps: [
          "Select classes, start time, and end time for the exam window.",
          "Students receive in-app notifications and can enter on time.",
          "Teachers can reopen or close the exam early if needed.",
        ],
      },
    ],
    tipsTitle: "Tips for effective online exams",
    tips: [
      { title: "Preview before opening", desc: "Always check the exam from a student account to catch display issues." },
      { title: "Brief students beforehand", desc: "Walk students through the login and submission steps before exam day." },
      { title: "Stay on monitor during the exam", desc: "Keep the monitoring screen open throughout so you can act quickly if needed." },
      { title: "Analyze results afterward", desc: "Use per-question stats to identify which topics need more coverage." },
    ],
  },
};

const ExamOnline = () => {
  const [expandedId, setExpandedId] = useState(null);
  const { language } = useLanguage();
  const content = COPY[language];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="fp-page">
      {/* Hero */}
      <section className="fp-hero">
        <div className="container fp-hero__shell">
          <div className="fp-hero__icon-wrap">
            <MonitorCheck size={30} color="#fff" />
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

      {/* Workflow */}
      <section className="fp-section container">
        <h2 className="fp-section-title">
          <Workflow size={20} /> {content.workflowTitle}
        </h2>
        <div className="fp-workflow">
          {content.workflow.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="fp-workflow-step">
                <div className="fp-ws-icon"><Icon size={22} /></div>
                <span className="fp-ws-num">{content.stepLabel} {i + 1}</span>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accordion Features */}
      <section className="fp-section container">
        <h2 className="fp-section-title">
          <HelpCircle size={20} /> {content.featuresTitle}
        </h2>
        {content.sections.map((section) => {
          const Icon = section.icon;
          const isOpen = expandedId === section.id;
          return (
            <div key={section.id} className={`fp-accordion glass ${isOpen ? "open" : ""}`}>
              <button
                type="button"
                className="fp-accordion__header"
                onClick={() => setExpandedId(isOpen ? null : section.id)}
              >
                <div className="fp-accordion__left">
                  <div className="fp-accordion__icon" style={{ background: `${section.color}18`, color: section.color }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.summary}</p>
                  </div>
                </div>
                <span className="fp-accordion__chevron">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>
              {isOpen && (
                <div className="fp-accordion__body">
                  <ol className="fp-steps">
                    {section.steps.map((step, i) => (
                      <li key={i}>
                        <span className="fp-step-num">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Tips */}
      <section className="fp-section container">
        <h2 className="fp-section-title">
          <Lightbulb size={20} /> {content.tipsTitle}
        </h2>
        <div className="fp-tips">
          {content.tips.map((tip) => (
            <div key={tip.title} className="fp-tip-card">
              <CheckCircle size={20} color="#10b981" />
              <div>
                <strong>{tip.title}</strong>
                <p>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="fp-section container">
        <div className="fp-cta-box glass">
          <Send size={28} color="#0f7cf0" />
          <h2>{language === "vi" ? "Sẵn sàng tổ chức bài kiểm tra đầu tiên?" : "Ready to run your first online exam?"}</h2>
          <p>{language === "vi" ? "Tạo tài khoản miễn phí và bắt đầu ngay hôm nay." : "Create a free account and get started today."}</p>
          <Link to="/register" className="fp-btn fp-btn--primary">
            {content.primaryCta} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default ExamOnline;
