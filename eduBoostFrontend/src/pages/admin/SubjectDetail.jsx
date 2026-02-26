import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  BookOpen,
  Loader2,
  GraduationCap,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";
import { adminSubjectService } from "../../services/adminSubjectService";
import { showErrorToast } from "../../utils/show-toast";
import "./SubjectDetail.css";

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  // Danh sách các khối học (6-12)
  const gradeLevels = [
    { level: 6, name: "Khối 6", color: "#3b82f6" },
    { level: 7, name: "Khối 7", color: "#8b5cf6" },
    { level: 8, name: "Khối 8", color: "#ec4899" },
    { level: 9, name: "Khối 9", color: "#f59e0b" },
    { level: 10, name: "Khối 10", color: "#10b981" },
    { level: 11, name: "Khối 11", color: "#06b6d4" },
    { level: 12, name: "Khối 12", color: "#ef4444" },
  ];

  useEffect(() => {
    fetchSubject();
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const data = await adminSubjectService.getSubjectById(subjectId);
      setSubject(data);
    } catch (error) {
      console.error("Error fetching subject:", error);
      showErrorToast("Không thể tải thông tin môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (gradeLevel) => {
    navigate(`/admin/subjects/${subjectId}/grade/${gradeLevel}`);
  };

  if (loading) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải thông tin môn học...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="empty-state glass">
        <BookOpen size={48} />
        <p>Không tìm thấy môn học</p>
      </div>
    );
  }

  return (
    <div className="subject-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span onClick={() => navigate("/admin/subjects")} style={{ cursor: "pointer" }}>
          Môn học
        </span>
        <ChevronRight size={16} />
        <span>{subject.subjectName || subject.subjectCode}</span>
      </nav>

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate("/admin/subjects")}
            className="btn btn-glass"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
        </div>
        <div className="header-center">
          <div className="subject-icon-large">
            <BookOpen size={40} />
          </div>
          <div>
            <h2>{subject.subjectName || subject.subjectCode}</h2>
            <p>{subject.description || "Chọn khối học để xem các chương"}</p>
          </div>
        </div>
        <div className="header-right"></div>
      </div>

      {/* Subject Info Card - 2 Column Layout */}
      <div className="subject-info-section">
        <div className="subject-info-card">
          <div className="info-item">
            <span className="info-label">Mã môn học</span>
            <span className="info-value">{subject.subjectCode}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tên môn học</span>
            <span className="info-value">{subject.subjectName}</span>
          </div>
        </div>
        <div className="subject-stats-card">
          <div className="stat-item">
            <div className="stat-icon">
              <BookOpen size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Tổng khối học</span>
              <span className="stat-value">7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm khối học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả khối</option>
            <option value="6-9">THCS (6-9)</option>
            <option value="10-12">THPT (10-12)</option>
          </select>
        </div>
      </div>

      {/* Grade Levels Grid */}
      <div className="section-header">
        <h3>Danh sách khối học</h3>
        <p>Chọn khối để xem các chương học của môn {subject.subjectName}</p>
      </div>

      <div className="grade-levels-grid">
        {gradeLevels
          .filter((grade) => {
            const matchSearch = grade.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchFilter =
              filterLevel === "all" ||
              (filterLevel === "6-9" && grade.level >= 6 && grade.level <= 9) ||
              (filterLevel === "10-12" && grade.level >= 10 && grade.level <= 12);
            return matchSearch && matchFilter;
          })
          .map((grade) => (
          <div
            key={grade.level}
            className="grade-level-card glass"
            onClick={() => handleGradeClick(grade.level)}
            style={{ "--grade-color": grade.color }}
          >
            <div className="grade-card-icon">
              <GraduationCap size={32} />
            </div>
            <div className="grade-card-content">
              <h3>{grade.name}</h3>
              <p>Xem các chương học</p>
            </div>
            <div className="grade-card-arrow">
              <ChevronRight size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectDetail;
