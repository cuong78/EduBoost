import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import { CTA } from "./components/layout/Footer";
import DynamicBackground from "./components/ui/DynamicBackground";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterMethod from "./pages/RegisterMethod";
import ParentLogin from "./pages/parent/ParentLogin";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserProfile from "./pages/common/UserProfile";
import ParentLayout from "./layouts/ParentLayout";
import RedirectIfAuthenticated from "./components/routes/RedirectIfAuthenticated";
import RequireRole from "./components/routes/RequireRole";

// Student Pages
import AIChat from "./pages/student/AIChat";
import Forum from "./pages/student/Forum";
import ExamList from "./pages/student/ExamList";
import TakeExam from "./pages/student/TakeExam";

// Teacher Pages

import CreateQuestion from './pages/teacher/CreateQuestion';
import UploadResource from './pages/teacher/UploadResource';
import ExamGenerator from './pages/teacher/ExamGenerator';
import QuestionBankManagement from './pages/teacher/QuestionBankManagement';
import ResourceManagement from './pages/teacher/ResourceManagement';
import ExamManagement from './pages/teacher/ExamManagement';
import ClassList from './pages/teacher/ClassList';
import ClassStudents from './pages/teacher/ClassStudents';
import CreateStudent from './pages/teacher/CreateStudent';
import StudentDetail from './pages/teacher/StudentDetail';
import StudentInvitations from './pages/teacher/StudentInvitations';
import EditStudent from './pages/teacher/EditStudent';
import LinkStudent from './pages/parent/LinkStudent';
import MyStudents from './pages/parent/MyStudents';
import ParentStudentDetail from './pages/parent/StudentDetail';
import InvitationStats from './pages/admin/InvitationStats';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AIGrading from './pages/teacher/AIGrading';

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import Settings from "./pages/admin/Settings";
import Subjects from "./pages/admin/Subjects";
import Chapters from "./pages/admin/Chapters";
import LessonResources from "./pages/admin/LessonResources";
import QuestionBank from "./pages/admin/QuestionBank";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

const Home = () => (
  <>
    <Hero />
    <Features />
    <CTA />
  </>
);

const DashboardPlaceholder = ({ title }) => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h2>{title}</h2>
    <p>This feature is coming soon...</p>
  </div>
);

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="app-container">
        {/* Global Liquid Background */}
        <div className="liquid-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <DynamicBackground />

        <Routes>
          {/* Public Pages - Redirect if already logged in */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
            </Route>
          </Route>

          {/* Authentication Pages - Redirect if already logged in */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterMethod />} />
              <Route path="/register/email" element={<Register />} />
              <Route
                path="/register/parent"
                element={<Register role="parent" />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Parent Authentication */}
              <Route path="/parent/login" element={<ParentLogin />} />
            </Route>
          </Route>

          {/* Student Dashboard Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="forum" element={<Forum />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Standalone Exam Route (Full Screen) */}
          <Route path="/student/exam/:id" element={<TakeExam />} />

          {/* Teacher Dashboard Routes */}
          <Route element={<RequireRole allow={["TEACHER"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<ClassList />} />
              <Route
                path="classes/:classId/students"
                element={<ClassStudents />}
              />
              <Route path="students/new" element={<CreateStudent />} />
              <Route path="students/:studentId" element={<StudentDetail />} />
              <Route
                path="students/:studentId/edit"
                element={<EditStudent />}
              />
              <Route
                path="students/:studentId/invitations"
                element={<StudentInvitations />}
              />
              <Route
                path="users"
                element={<DashboardPlaceholder title="Manage Users" />}
              />
              <Route path="create-question" element={<CreateQuestion />} />
              <Route path="upload-resource" element={<UploadResource />} />
              <Route path="question-bank" element={<QuestionBankManagement />} />
              <Route path="resources" element={<ResourceManagement />} />
              <Route path="exams" element={<ExamManagement />} />
              <Route path="create-exam" element={<ExamGenerator />} />
              <Route path="grading" element={<AIGrading />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Route>

          {/* Parent Dashboard Routes */}
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students" element={<MyStudents />} />
            <Route
              path="students/:studentId"
              element={<ParentStudentDetail />}
            />
            <Route path="link" element={<LinkStudent />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={<RequireRole allow={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="chapters" element={<Chapters />} />
              <Route path="lesson-resources" element={<LessonResources />} />
              <Route path="question-bank" element={<QuestionBank />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
