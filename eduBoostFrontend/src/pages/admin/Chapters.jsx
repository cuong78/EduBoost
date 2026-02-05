import { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  BookMarked,
  Loader2,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { adminChapterService } from "../../services/adminChapterService";
import { adminSubjectService } from "../../services/adminSubjectService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingChapter, setEditingChapter] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedSubject !== "") {
      fetchChaptersBySubject(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminSubjectService.getAllSubjects();

      const subjectList = Array.isArray(data) ? data : data?.data || [];
      setSubjects(subjectList);
      if (subjectList.length > 0) {
        setSelectedSubject(subjectList[0].id);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      showErrorToast("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersBySubject = async (subjectId) => {
    try {
      setLoading(true);
      const data = await adminChapterService.getChaptersBySubject(subjectId);
      console.log("Chapters loaded for subject", subjectId, ":", data);

      const chapterList = Array.isArray(data) ? data : data?.data || [];
      setChapters(chapterList);
    } catch (error) {
      console.error("Error loading chapters:", error);
      showErrorToast("Không thể tải danh sách chương");
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredChapters = chapters.filter((chapter) =>
    chapter.chapterName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreate = () => {
    setModalMode("create");
    setEditingChapter({
      chapterName: "",
      description: "",
      chapterNumber: "",
      gradeLevel: "",
    });
    setShowModal(true);
  };

  const handleEdit = (chapter) => {
    setModalMode("edit");
    setEditingChapter({
      id: chapter.id,
      chapterName: chapter.chapterName || "",
      description: chapter.description || "",
      chapterNumber: chapter.chapterNumber || "",
      gradeLevel: chapter.gradeLevel || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (chapter) => {
    if (
      !window.confirm(`Bạn có chắc muốn xóa chương "${chapter.chapterName}"?`)
    )
      return;
    try {
      await adminChapterService.deleteChapter(chapter.id);
      showSuccessToast("Xóa chương thành công");
      fetchChaptersBySubject(selectedSubject);
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Không thể xóa chương");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        chapterName: editingChapter.chapterName,
        description: editingChapter.description,
        chapterNumber: editingChapter.chapterNumber
          ? parseInt(editingChapter.chapterNumber)
          : null,
        gradeLevel: editingChapter.gradeLevel
          ? parseInt(editingChapter.gradeLevel)
          : null,
      };

      if (modalMode === "create") {
        await adminChapterService.createChapter(selectedSubject, payload);
        showSuccessToast("Tạo chương thành công");
      } else {
        await adminChapterService.updateChapter(editingChapter.id, payload);
        showSuccessToast("Cập nhật chương thành công");
        console.error("Error submitting chapter:", error);
      }
      setShowModal(false);
      fetchChaptersBySubject(selectedSubject);
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="chapters-page">
      <nav className="breadcrumb">
        <span>Admin</span>
        <ChevronRight size={16} />
        <span>Chương học</span>
      </nav>

      <div className="page-header">
        <div>
          <h2>Quản lý Chương học</h2>
          <p>Quản lý các chương học theo môn</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary"
          disabled={selectedSubject === "all"}
        >
          <Plus size={20} />
          Thêm chương
        </button>
      </div>

      <div className="stats-grid single-stat">
        <div className="stat-card glass">
          <div className="stat-header">
            <div>
              <p className="stat-label">Tổng số chương</p>
              <h3 className="stat-value">{chapters.length}</h3>
            </div>
            <div className="stat-icon-wrapper bg-indigo">
              <BookMarked size={24} color="white" />
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-label">
              {subjects.find((s) => s.id === selectedSubject)?.subjectCode ||
                ""}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-section glass">
        <div className="filter-row">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm chương..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(Number(e.target.value))}
            className="filter-select"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subjectCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredChapters.length === 0 ? (
        <div className="empty-state glass">
          <BookMarked size={48} />
          <p>Chưa có chương học nào</p>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={20} />
            Thêm chương đầu tiên
          </button>
        </div>
      ) : (
        <div className="chapters-grid">
          {filteredChapters.map((chapter) => (
            <div key={chapter.id} className="chapter-card glass">
              <div className="chapter-header">
                <div className="chapter-order-badge">
                  Chương {chapter.chapterNumber || "?"}
                </div>
                <div className="chapter-actions">
                  <button
                    onClick={() => handleEdit(chapter)}
                    className="btn-icon"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter)}
                    className="btn-icon btn-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="chapter-name">{chapter.chapterName}</h3>
              {chapter.gradeLevel && (
                <span className="grade-badge">Khối {chapter.gradeLevel}</span>
              )}
              <p className="chapter-description">
                {chapter.description || "Chưa có mô tả"}
              </p>
              <div className="chapter-footer">
                <span className="chapter-stat">
                  Môn: {chapter.subjectCode || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>
                {modalMode === "create"
                  ? "Thêm chương mới"
                  : "Chỉnh sửa chương"}
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
                  Tên chương <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={editingChapter.chapterName}
                  onChange={(e) =>
                    setEditingChapter({
                      ...editingChapter,
                      chapterName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Số thứ tự <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={editingChapter.chapterNumber}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        chapterNumber: e.target.value,
                      })
                    }
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Khối lớp <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={editingChapter.gradeLevel}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        gradeLevel: e.target.value,
                      })
                    }
                    min="1"
                    max="12"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={editingChapter.description}
                  onChange={(e) =>
                    setEditingChapter({
                      ...editingChapter,
                      description: e.target.value,
                    })
                  }
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

      <style>{`
        .chapters-page {
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
        }
        .stats-grid {
          display: grid;
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
        .trend-label {
          color: var(--color-text-secondary);
          font-size: 0.875rm;
        }
        .filters-section {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }
        .filter-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
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
        .filter-select {
          padding: 0.875rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .chapters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .chapter-card {
          border-radius: 16px;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .chapter-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        .chapter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .chapter-order-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .chapter-actions {
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
        .chapter-name {
          font-size: 1.125rem;
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
        .chapter-description {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .chapter-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .chapter-stat {
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
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
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
        .modal-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px 20px 0 0;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }
        .modal-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .modal-form {
          padding: 2rem;
          background: white;
          border-radius: 0 0 20px 20px;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
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
        .form-group textarea {
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
        .form-group textarea:focus {
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 768px) {
          .chapters-grid {
            grid-template-columns: 1fr;
          }
          .filter-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Chapters;
