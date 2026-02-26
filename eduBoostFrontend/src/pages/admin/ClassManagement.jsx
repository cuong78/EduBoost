import { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { classService } from "../../services/classService";
import { gradeLevelService } from "../../services/gradeLevelService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, gradeLevelsData, teachersData] = await Promise.all([
        classService.getAllClasses(),
        gradeLevelService.getAllGradeLevels(),
        classService.getAllAvailableTeachers()
      ]);
      setClasses(classesData);
      setGradeLevels(gradeLevelsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorToast("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lớp "${className}" không?`)) {
      return;
    }

    try {
      await classService.deleteClass(classId);
      showSuccessToast("Xóa lớp học thành công");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting class:", error);
      const errorMessage = error.response?.data?.message || "Không thể xóa lớp học";
      showErrorToast(errorMessage);
    }
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.classCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      filterGrade === "all" || classItem.gradeLevelName === filterGrade;

    return matchesSearch && matchesGrade;
  });

  const stats = {
    total: classes.length,
    byGrade: gradeLevels.map((grade) => ({
      grade: grade.gradeName,
      count: classes.filter((c) => c.gradeLevelName === grade.gradeName).length,
    })),
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={48} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="class-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <BookOpen size={32} />
              Quản lý lớp học
            </h1>
            <p className="page-subtitle">
              Quản lý thông tin các lớp học trong hệ thống
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Tạo lớp mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper primary">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng số lớp</div>
          </div>
        </div>

        {stats.byGrade.map((item) => (
          <div key={item.grade} className="stat-card glass">
            <div className="stat-icon-wrapper secondary">
              <GraduationCap size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{item.count}</div>
              <div className="stat-label">Khối {item.grade}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-section glass">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp, mã lớp, giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Khối:</label>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả khối</option>
            {gradeLevels.map((grade) => (
              <option key={grade.gradeLevelId} value={grade.gradeName}>
                Khối {grade.gradeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="empty-state glass">
          <BookOpen size={48} />
          <p>Không tìm thấy lớp học nào</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Tạo lớp mới
          </button>
        </div>
      ) : (
        <div className="classes-grid">
          {filteredClasses.map((classItem) => (
            <div key={classItem.classId} className="class-card glass">
              <div className="class-card-header">
                <div className="class-title-section">
                  <h3 className="class-name">{classItem.className}</h3>
                  <span className="class-code">{classItem.classCode}</span>
                </div>
                <span className={`grade-badge grade-${classItem.gradeLevelName}`}>
                  Khối {classItem.gradeLevelName}
                </span>
              </div>

              <div className="class-card-body">
                <div className="class-info-row">
                  <Users size={16} />
                  <span>{classItem.studentCount || 0} học sinh</span>
                </div>
                <div className="class-info-row">
                  <GraduationCap size={16} />
                  <span>
                    {classItem.teacherName || "Chưa có giáo viên chủ nhiệm"}
                  </span>
                </div>
                <div className="class-info-row">
                  <BookOpen size={16} />
                  <span>{classItem.schoolYear || "2024-2025"}</span>
                </div>
              </div>

              <div className="class-card-footer">
                <button
                  onClick={() => {
                    setEditingClass(classItem);
                    setShowEditModal(true);
                  }}
                  className="btn btn-sm btn-glass"
                >
                  <Edit2 size={16} />
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleDeleteClass(classItem.classId, classItem.className)}
                  className="btn btn-sm btn-danger-outline"
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && editingClass && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa lớp học</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên lớp *</label>
                <input
                  type="text"
                  value={editingClass.className || ""}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, className: e.target.value })
                  }
                  placeholder="Ví dụ: 10A1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mã lớp *</label>
                <input
                  type="text"
                  value={editingClass.classCode || ""}
                  disabled
                  className="form-input"
                  style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                />
                <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                  Mã lớp không thể thay đổi
                </small>
              </div>

              <div className="form-group">
                <label>Năm học</label>
                <input
                  type="text"
                  value={editingClass.schoolYear || ""}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, schoolYear: e.target.value })
                  }
                  placeholder="Ví dụ: 2024-2025"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Giáo viên chủ nhiệm</label>
                <select
                  value={editingClass.teacherId || ""}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, teacherId: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">-- Chưa phân công --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.fullName} {teacher.currentClassName ? `(Đang dạy: ${teacher.currentClassName})` : "(Chưa có lớp)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={editingClass.description || ""}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, description: e.target.value })
                  }
                  placeholder="Mô tả về lớp học..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={editingClass.status || "ACTIVE"}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, status: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    await classService.updateClass(editingClass.classId, {
                      className: editingClass.className,
                      schoolYear: editingClass.schoolYear,
                      description: editingClass.description,
                      status: editingClass.status,
                      teacherId: editingClass.teacherId || null,
                    });
                    showSuccessToast("Cập nhật lớp học thành công");
                    setShowEditModal(false);
                    fetchData();
                  } catch (error) {
                    console.error("Error updating class:", error);
                    showErrorToast("Không thể cập nhật lớp học");
                  }
                }}
                className="btn btn-primary"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .class-management {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
        .page-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .header-text {
          flex: 1;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-wrapper.primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }

        .stat-icon-wrapper.secondary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* Filters */
        .filters-section {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .search-box:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .search-box:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(99, 102, 241, 0.15);
        }

        .search-box svg {
          color: var(--color-text-secondary);
          flex-shrink: 0;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.9375rem;
          color: var(--color-text);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 600;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 0.625rem 1rem;
          padding-right: 2.5rem;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          background: white;
          color: var(--color-text);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 16px;
        }

        .filter-select:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 2px 8px rgba(99, 102, 241, 0.15);
        }

        /* Classes Grid */
        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .class-card {
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s;
        }

        .class-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .class-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .class-title-section {
          flex: 1;
        }

        .class-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }

        .class-code {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .grade-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .grade-badge[class*="grade-"] {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
          color: #4f46e5;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .class-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 0;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }

        .class-info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .class-info-row svg {
          flex-shrink: 0;
          color: var(--color-primary);
        }

        .class-card-footer {
          display: flex;
          gap: 0.75rem;
        }

        .btn-sm {
          flex: 1;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
        }

        .btn-danger-outline {
          background: transparent;
          color: #dc2626;
          border: 2px solid rgba(239, 68, 68, 0.3);
        }

        .btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #dc2626;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 16px;
        }

        .empty-state svg {
          color: var(--color-text-secondary);
          margin: 0 auto 1rem;
        }

        .empty-state p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
          margin: 1rem 0 1.5rem;
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--color-primary);
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .class-management {
            padding: 1rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: 100%;
          }

          .classes-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #f3f4f6;
          color: var(--color-text);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          color: var(--color-text);
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: var(--color-text);
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default ClassManagement;
