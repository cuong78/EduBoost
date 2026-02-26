import { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  Users,
  GraduationCap,
  X,
  Loader2,
  Award,
  TrendingUp,
} from "lucide-react";
import { gradeLevelService } from "../../services/gradeLevelService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const GradeLevelManagement = () => {
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    gradeName: "",
    description: "",
  });

  // Soft Pastel Color System
  const gradeColors = {
    6: { bg: "rgba(59, 130, 246, 0.1)", icon: "#3b82f6", accent: "#60a5fa" }, // Blue
    7: { bg: "rgba(139, 92, 246, 0.1)", icon: "#8b5cf6", accent: "#a78bfa" }, // Purple
    8: { bg: "rgba(236, 72, 153, 0.1)", icon: "#ec4899", accent: "#f472b6" }, // Rose
    9: { bg: "rgba(245, 158, 11, 0.1)", icon: "#f59e0b", accent: "#fbbf24" }, // Amber
    10: { bg: "rgba(16, 185, 129, 0.1)", icon: "#10b981", accent: "#34d399" }, // Emerald
    11: { bg: "rgba(6, 182, 212, 0.1)", icon: "#06b6d4", accent: "#22d3ee" }, // Cyan
    12: { bg: "rgba(239, 68, 68, 0.1)", icon: "#ef4444", accent: "#f87171" }, // Red
  };

  const getGradeColor = (gradeName) => {
    const gradeNum = parseInt(gradeName);
    return gradeColors[gradeNum] || gradeColors[10];
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await gradeLevelService.getAllGradeLevelsWithStats();
      setGradeLevels(data);
    } catch (error) {
      console.error("Error fetching grade levels:", error);
      showErrorToast("Không thể tải danh sách khối");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrade = async () => {
    if (!formData.gradeName.trim()) {
      showErrorToast("Vui lòng nhập tên khối");
      return;
    }

    try {
      await gradeLevelService.createGradeLevel(formData);
      showSuccessToast("Tạo khối thành công");
      setShowCreateModal(false);
      setFormData({ gradeName: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating grade:", error);
      showErrorToast("Không thể tạo khối");
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade.gradeName.trim()) {
      showErrorToast("Vui lòng nhập tên khối");
      return;
    }

    try {
      await gradeLevelService.updateGradeLevel(
        editingGrade.gradeLevelId,
        editingGrade
      );
      showSuccessToast("Cập nhật khối thành công");
      setShowEditModal(false);
      setEditingGrade(null);
      fetchData();
    } catch (error) {
      console.error("Error updating grade:", error);
      showErrorToast("Không thể cập nhật khối");
    }
  };

  const handleDeleteGrade = async (gradeLevelId, gradeName) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa khối "${gradeName}" không?`)
    ) {
      return;
    }

    try {
      await gradeLevelService.deleteGradeLevel(gradeLevelId);
      showSuccessToast("Xóa khối thành công");
      fetchData();
    } catch (error) {
      console.error("Error deleting grade:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể xóa khối";
      showErrorToast(errorMessage);
    }
  };

  const filteredGrades = gradeLevels.filter((grade) =>
    grade.gradeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={48} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="grade-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <GraduationCap size={32} />
              Quản lý khối
            </h1>
            <p className="page-subtitle">
              Quản lý các khối học từ lớp 6 đến lớp 12
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Tạo khối mới
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
            <div className="stat-value">{gradeLevels.length}</div>
            <div className="stat-label">Tổng số khối</div>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper secondary">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {gradeLevels.filter((g) => parseInt(g.gradeName) >= 10).length}
            </div>
            <div className="stat-label">Khối THPT</div>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper accent">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {gradeLevels.filter((g) => parseInt(g.gradeName) < 10).length}
            </div>
            <div className="stat-label">Khối THCS</div>
          </div>
        </div>
      </div>

      {/* Search and Filter - Enterprise SaaS Style */}
      <div className="search-filter-bar-saas">
        <div className="search-box-compact">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm khối..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-inline">
          <select 
            className="filter-select-compact"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">Tất cả khối</option>
            <option value="thcs">THCS (6-9)</option>
            <option value="thpt">THPT (10-12)</option>
          </select>
        </div>
      </div>

      {/* Grade Cards Grid */}
      {(() => {
        const filtered = gradeLevels.filter((grade) => {
          const matchSearch = grade.gradeName?.toLowerCase().includes(searchTerm.toLowerCase());
          const gradeNum = parseInt(grade.gradeName);
          const matchFilter =
            filterLevel === "all" ||
            (filterLevel === "thcs" && gradeNum >= 6 && gradeNum <= 9) ||
            (filterLevel === "thpt" && gradeNum >= 10 && gradeNum <= 12);
          return matchSearch && matchFilter;
        });
        
        return filtered.length === 0 ? (
        <div className="empty-state glass">
          <BookOpen size={48} />
          <p>Không tìm thấy khối nào</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Tạo khối mới
          </button>
        </div>
      ) : (
        <div className="grades-grid-pastel">
          {filtered.map((grade) => {
            const colors = getGradeColor(grade.gradeName);
            return (
              <div 
                key={grade.gradeLevelId} 
                className="grade-card-pastel"
                style={{ 
                  '--card-bg': colors.bg,
                  '--icon-color': colors.icon,
                  '--accent-color': colors.accent
                }}
              >
                <div className="grade-card-header-pastel">
                  <div className="grade-icon-duotone">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="grade-title-bold">Khối {grade.gradeName}</h3>
                  <div className="grade-actions-round">
                    <button
                      onClick={() => {
                        setEditingGrade(grade);
                        setShowEditModal(true);
                      }}
                      className="btn-icon-round"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteGrade(grade.gradeLevelId, grade.gradeName)
                      }
                      className="btn-icon-round btn-delete-round"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {grade.description && (
                  <p className="grade-description-pastel">{grade.description}</p>
                )}
                
                <div className="grade-stats-colorful">
                  <div className="stat-colorful">
                    <Users size={18} className="stat-icon-colorful" />
                    <div className="stat-info-colorful">
                      <span className="stat-number-vibrant">{grade.classCount || 0}</span>
                      <span className="stat-label-soft">Lớp học</span>
                    </div>
                  </div>
                  <div className="stat-colorful">
                    <BookOpen size={18} className="stat-icon-colorful" />
                    <div className="stat-info-colorful">
                      <span className="stat-number-vibrant">{grade.studentCount || 0}</span>
                      <span className="stat-label-soft">Học sinh</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
      })()}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo khối mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên khối *</label>
                <input
                  type="text"
                  value={formData.gradeName}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeName: e.target.value })
                  }
                  placeholder="Ví dụ: 10, 11, 12"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả về khối học..."
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button onClick={handleCreateGrade} className="btn btn-primary">
                Tạo khối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingGrade && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa khối</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên khối *</label>
                <input
                  type="text"
                  value={editingGrade.gradeName || ""}
                  onChange={(e) =>
                    setEditingGrade({
                      ...editingGrade,
                      gradeName: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: 10, 11, 12"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={editingGrade.description || ""}
                  onChange={(e) =>
                    setEditingGrade({
                      ...editingGrade,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả về khối học..."
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button onClick={handleUpdateGrade} className="btn btn-primary">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .grade-management {
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
          gap: 2rem;
          flex-wrap: wrap;
        }

        .header-text {
          flex: 1;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-subtitle {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
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

        .stat-icon-wrapper.accent {
          background: linear-gradient(135deg, #f59e0b, #d97706);
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

        /* Search and Filter - Enterprise SaaS */
        .search-filter-bar-saas {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .search-box-compact {
          position: relative;
          width: 40%;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .search-box-compact:focus-within {
          border-color: #d1d5db;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .search-box-compact svg {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .search-box-compact input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .search-box-compact input::placeholder {
          color: #9ca3af;
        }

        .filters-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-select-compact {
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 0.875rem;
          color: #1f2937;
          cursor: pointer;
          outline: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-select-compact:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .filter-select-compact:focus {
          border-color: #d1d5db;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        /* Grades Grid - Soft Pastel + Glassmorphism */
        .grades-grid-pastel {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .grade-card-pastel {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 
                      0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
        }

        .grade-card-pastel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.4) 0%, 
            rgba(255, 255, 255, 0.1) 100%);
          pointer-events: none;
        }

        .grade-card-pastel:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 
                      0 4px 16px rgba(0, 0, 0, 0.06);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .grade-card-header-pastel {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 1;
        }

        .grade-icon-duotone {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--icon-color), var(--accent-color));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .grade-title-bold {
          flex: 1;
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          letter-spacing: -0.02em;
        }

        .grade-actions-round {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .btn-icon-round {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .btn-icon-round:hover {
          background: var(--icon-color);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-delete-round:hover {
          background: #ef4444;
        }

        .grade-description-pastel {
          margin: 0 0 1.25rem 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        .grade-stats-colorful {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem 0 0 0;
          border-top: 1px solid rgba(255, 255, 255, 0.5);
          position: relative;
          z-index: 1;
        }

        .stat-colorful {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .stat-icon-colorful {
          color: var(--icon-color);
          flex-shrink: 0;
        }

        .stat-info-colorful {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-number-vibrant {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--accent-color);
          line-height: 1;
        }

        .stat-label-soft {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9375rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .btn-glass {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          color: var(--color-text);
        }

        .btn-glass:hover {
          background: white;
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .btn-danger-outline {
          background: transparent;
          border: 1px solid #ef4444;
          color: #ef4444;
        }

        .btn-danger-outline:hover {
          background: #ef4444;
          color: white;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: var(--color-text);
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        /* Glass Effect */
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Empty State */
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .empty-state svg {
          color: var(--color-text-secondary);
          opacity: 0.5;
        }

        .empty-state p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
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
          max-width: 500px;
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

        /* Responsive */
        @media (max-width: 768px) {
          .grade-management {
            padding: 1rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .grades-grid-pastel {
            grid-template-columns: 1fr;
          }

          .search-filter-bar-saas {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box-compact {
            width: 100%;
            max-width: none;
          }

          .filters-inline {
            width: 100%;
          }

          .filter-select-compact {
            width: 100%;
          }

          .grade-stats-colorful {
            flex-direction: column;
            gap: 1rem;
          }

          .stat-colorful {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
};

export default GradeLevelManagement;
