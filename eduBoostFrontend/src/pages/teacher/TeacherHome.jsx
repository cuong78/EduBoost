import { Link } from "react-router-dom";
import {
  Users,
  PenLine,
  Library,
  FolderOpen,
  Table2,
  ClipboardList,
  FilePlus,
  Send,
  Gem,
  BookOpen,
  UserCircle2,
  ArrowRight,
} from "lucide-react";
import "./TeacherHome.css";

const quickActions = [
  {
    title: "Lớp học",
    subtitle: "Quản lý lớp và học sinh",
    to: "/teacher/classes",
    icon: Users,
    tone: "blue",
  },
  {
    title: "Tạo câu hỏi",
    subtitle: "Soạn nhanh câu hỏi mới",
    to: "/teacher/create-question",
    icon: PenLine,
    tone: "violet",
  },
  {
    title: "Ngân hàng câu hỏi",
    subtitle: "Xem và chỉnh sửa câu hỏi",
    to: "/teacher/question-bank",
    icon: Library,
    tone: "teal",
  },
  {
    title: "Quản lý tài nguyên",
    subtitle: "Tài liệu và học liệu",
    to: "/teacher/resources",
    icon: FolderOpen,
    tone: "amber",
  },
  {
    title: "Quản lý ma trận",
    subtitle: "Thiết lập ma trận đề",
    to: "/teacher/matrix-templates",
    icon: Table2,
    tone: "indigo",
  },
  {
    title: "Quản lý đề thi",
    subtitle: "Danh sách đề hiện có",
    to: "/teacher/exams",
    icon: ClipboardList,
    tone: "blue",
  },
  {
    title: "Tạo đề thi",
    subtitle: "Tạo đề nhanh theo ma trận",
    to: "/teacher/create-exam",
    icon: FilePlus,
    tone: "violet",
  },
  {
    title: "Góp ý",
    subtitle: "Gửi phản hồi hệ thống",
    to: "/teacher/feedback",
    icon: Send,
    tone: "teal",
  },
  {
    title: "Gói đăng ký",
    subtitle: "Theo dõi gói hiện tại",
    to: "/teacher/subscription",
    icon: Gem,
    tone: "amber",
  },
  {
    title: "Hướng dẫn",
    subtitle: "Tài liệu sử dụng",
    to: "/teacher/guide",
    icon: BookOpen,
    tone: "indigo",
  },
  {
    title: "Hồ sơ",
    subtitle: "Thông tin tài khoản giáo viên",
    to: "/teacher/profile",
    icon: UserCircle2,
    tone: "blue",
  },
];

const TeacherHome = () => {
  return (
    <section className="teacher-home">
      <header className="teacher-home-header">
        <h1>Màn hình chính</h1>
        <p>Chọn nhanh chức năng bạn muốn sử dụng.</p>
      </header>

      <div className="teacher-home-grid">
        {quickActions.map((item) => {
          const Icon = item.icon;

          return (
            <Link to={item.to} key={item.to} className={`teacher-home-card tone-${item.tone}`}>
              <div className="teacher-home-card-icon">
                <Icon size={22} />
              </div>
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
              <span className="teacher-home-card-cta">
                Mở nhanh <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default TeacherHome;
