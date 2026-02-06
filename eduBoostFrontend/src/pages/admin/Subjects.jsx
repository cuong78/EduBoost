import { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  Loader2,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { adminSubjectService } from "../../services/adminSubjectService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminSubjectService.getAllSubjects();
      console.log("Subjects data received:", data);

      // Kiểm tra nếu data là array thì dùng trực tiếp, nếu là object có property data thì lấy data
      const subjectList = Array.isArray(data) ? data : data?.data || [];
      setSubjects(subjectList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách môn học";
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreate = () => {
    setModalMode("create");
    setEditingSubject({
      subjectCode: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (subject) => {
    setModalMode("edit");
    setEditingSubject({
      id: subject.id,
      subjectCode: subject.subjectCode || "",
      description: subject.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = (subject) => {
    setDeleteTarget(subject);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminSubjectService.deleteSubject(deleteTarget.id);
      showSuccessToast("Xóa môn học thành công");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchSubjects();
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Không thể xóa môn học");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await adminSubjectService.createSubject({
          subjectCode: editingSubject.subjectCode,
          description: editingSubject.description,
        });
        showSuccessToast("Tạo môn học thành công");
      } else {
        await adminSubjectService.updateSubject(editingSubject.id, {
          subjectCode: editingSubject.subjectCode,
          description: editingSubject.description,
        });
        showSuccessToast("Cập nhật môn học thành công");
      }
      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error submitting subject:", error);
      showErrorToast(
        error.response?.data?.message ||
          `Không thể ${modalMode === "create" ? "tạo" : "cập nhật"} môn học`,
      );
    }
  };

  if (loading) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải danh sách môn học...</p>
      </div>
    );
  }

  return (
    <div className="subjects-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span>Admin</span>
        <ChevronRight size={16} />
        <span>Môn học</span>
      </nav>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Môn học</h2>
          <p>Quản lý danh sách các môn học trong hệ thống</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={20} />
          Thêm môn học
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid single-stat">
        <div className="stat-card glass">
          <div className="stat-header">
            <div>
              <p className="stat-label">Tổng số môn học</p>
              <h3 className="stat-value">{subjects.length}</h3>
            </div>
            <div className="stat-icon-wrapper bg-indigo">
              <BookOpen size={24} color="white" />
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-label">Đang hoạt động trong hệ thống</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="filters-section glass">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="empty-state glass">
          <BookOpen size={48} />
          <p>Không tìm thấy môn học nào</p>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={20} />
            Thêm môn học đầu tiên
          </button>
        </div>
      ) : (
        <div className="subjects-grid">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="subject-card glass">
              <div className="subject-card-header">
                <div className="subject-icon">
                  <BookOpen size={32} />
                </div>
                <div className="subject-actions">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="btn-icon"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject)}
                    className="btn-icon btn-danger"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="subject-card-body">
                <h3 className="subject-name">{subject.subjectCode}</h3>
                <p className="subject-description">
                  {subject.description || "Chưa có mô tả"}
                </p>
              </div>
              <div className="subject-card-footer">
                <span className="subject-stat">Mã: {subject.subjectCode}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && editingSubject && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>
                {modalMode === "create"
                  ? "Thêm môn học mới"
                  : "Chỉnh sửa môn học"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>
                  Mã môn học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editingSubject.subjectCode}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      subjectCode: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: MATH10, ENG11"
                  required
                  maxLength="20"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={editingSubject.description}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả về môn học..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-glass"
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === "create" ? "Tạo mới" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content glass modal-small">
            <div className="modal-header modal-header-danger">
              <div className="modal-header-icon">
                <AlertCircle size={24} />
              </div>
              <h3>Xác nhận xóa</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa môn học{" "}
                <strong>{deleteTarget.subjectCode}</strong>?
              </p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-glass"
              >
                Hủy
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .subjects-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .breadcrumb span:last-child {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stats-grid.single-stat {
          grid-template-columns: 1fr;
          max-width: 400px;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 16px;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-indigo {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .stat-trend {
          font-size: 0.875rem;
        }

        .trend-label {
          color: var(--color-text-secondary);
        }

        .filters-section {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-secondary);
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.95rem;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .subject-card {
          border-radius: 16px;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .subject-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .subject-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .subject-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .subject-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-accent-1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: rgba(99, 102, 241, 0.2);
        }

        .btn-icon.btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .btn-icon.btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .subject-card-body {
          margin-bottom: 1rem;
        }

        .subject-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
        }

        .grade-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-accent-1);
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .subject-description {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .subject-card-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .subject-stat {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

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
          margin-bottom: 1.5rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur (4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 20px;
        }

        .modal-content.modal-small {
          max-width: 450px;
        }

        .modal-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px 20px 0 0;
        }

        .modal-header-danger {
          background: linear-gradient(135deg, #ef4444, #f87171);
        }

        .modal-header-icon {
          margin-right: 1rem;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          flex: 1;
        }

        .modal-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-form {
          padding: 2rem;
          background: white;
          border-radius: 0 0 20px 20px;
        }

        .modal-body {
          padding: 2rem;
          background: white;
        }

        .modal-body p {
          margin-bottom: 1rem;
          color: var(--color-text-primary);
        }

        .warning-text {
          color: #dc2626;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: white;
          border-radius: 0 0 20px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .modal-actions .btn {
          flex: 1;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.95rem;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .form-actions .btn {
          flex: 1;
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444, #f87171);
          color: white;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .subjects-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Subjects;
