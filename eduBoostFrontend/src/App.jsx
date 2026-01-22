
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import CourseList from './components/sections/CourseList';
import { CTA } from './components/layout/Footer';
import DynamicBackground from './components/ui/DynamicBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import TeacherLayout from './layouts/TeacherLayout';
import AdminLayout from './layouts/AdminLayout';

import CourseLibrary from './pages/student/CourseLibrary';
import AIChat from './pages/student/AIChat';
import Forum from './pages/student/Forum';
import CreateQuiz from './pages/teacher/CreateQuiz';
import ExamGenerator from './pages/teacher/ExamGenerator';

const Home = () => (
  <>
    <Hero />
    <Features />
    <CourseList />
    <CTA />
  </>
);

const DashboardPlaceholder = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
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
          {/* Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Authentication Pages */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Student Dashboard Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="courses" replace />} />
            <Route path="courses" element={<CourseLibrary />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="forum" element={<Forum />} />
          </Route>

          {/* Teacher Dashboard Routes */}
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPlaceholder title="Teacher Dashboard" />} />
            <Route path="users" element={<DashboardPlaceholder title="Manage Users" />} />
            <Route path="lectures" element={<DashboardPlaceholder title="Manage Lectures" />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            <Route path="exam-generator" element={<ExamGenerator />} />
            <Route path="grading" element={<DashboardPlaceholder title="AI Grading" />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPlaceholder title="Admin Dashboard" />} />
            <Route path="users" element={<DashboardPlaceholder title="User Account Management" />} />
            <Route path="settings" element={<DashboardPlaceholder title="System Settings" />} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
