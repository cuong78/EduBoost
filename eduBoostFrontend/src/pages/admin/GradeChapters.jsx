import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Loader2,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  AlertCircle,
  GripVertical,
  BookMarked,
  List,
  PlayCircle,
} from "lucide-react";
import { adminSubjectService } from "../../services/adminSubjectService";
import { adminChapterService } from "../../services/adminChapterService";
import { adminLessonService } from "../../services/adminLessonService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import "./GradeChapters.css";

const GradeChapters = () => {
  const { subjectId, gradeLevel } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingChapter, setEditingChapter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [chapterLessons, setChapterLessons] = useState({}); // Store lessons by chapterId
  const [loadingLessons, setLoadingLessons] = useState({});

  useEffect(() => {
    fetchData();
  }, [subjectId, gradeLevel]);

  const handleManageLessons = (chapterId) => {
    navigate(
      `/admin/subjects/${subjectId}/grade/${gradeLevel}/chapter/${chapterId}/lessons`,
    );
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newChapters = [...chapters];
    const draggedChapter = newChapters[draggedItem];
    newChapters.splice(draggedItem, 1);
    newChapters.splice(index, 0, draggedChapter);

    setChapters(newChapters);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectData, chaptersData] = await Promise.all([
        adminSubjectService.getSubjectById(subjectId),
        adminChapterService.getChaptersBySubject(
          subjectId,
          parseInt(gradeLevel),
        ),
      ]);
      setSubject(subjectData);
      setChapters(chaptersData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorToast("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setEditingChapter({
      chapterNumber: chapters.length + 1,
      chapterName: "",
      description: "",
      gradeLevel: parseInt(gradeLevel),
    });
    setShowModal(true);
  };

  const handleEdit = (chapter) => {
    setModalMode("edit");
    setEditingChapter({
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      chapterName: chapter.chapterName,
      description: chapter.description || "",
      gradeLevel: chapter.gradeLevel,
    });
    setShowModal(true);
  };

  const handleDelete = (chapter) => {
    setDeleteTarget(chapter);
    setShowDeleteModal(true);
  };

  const toggleExpandChapter = async (chapterId) => {
    const isCurrentlyExpanded = expandedChapterId === chapterId;

    if (isCurrentlyExpanded) {
      setExpandedChapterId(null);
    } else {
      setExpandedChapterId(chapterId);

      // Fetch lessons nếu chưa có
      if (!chapterLessons[chapterId]) {
        setLoadingLessons((prev) => ({ ...prev, [chapterId]: true }));
        try {
          const lessons =
            await adminLessonService.getLessonsByChapter(chapterId);
          setChapterLessons((prev) => ({ ...prev, [chapterId]: lessons }));
        } catch (error) {
          console.error("Error fetching lessons:", error);
          showErrorToast("Không thể tải danh sách bài học");
        } finally {
          setLoadingLessons((prev) => ({ ...prev, [chapterId]: false }));
        }
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminChapterService.deleteChapter(deleteTarget.id);
      showSuccessToast("Xóa chương thành công");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Không thể xóa chương");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await adminChapterService.createChapter(subjectId, {
          chapterNumber: editingChapter.chapterNumber,
          chapterName: editingChapter.chapterName,
          description: editingChapter.description,
          gradeLevel: parseInt(gradeLevel),
        });
        showSuccessToast("Tạo chương thành công");
      } else {
        await adminChapterService.updateChapter(editingChapter.id, {
          chapterNumber: editingChapter.chapterNumber,
          chapterName: editingChapter.chapterName,
          description: editingChapter.description,
          gradeLevel: editingChapter.gradeLevel,
        });
        showSuccessToast("Cập nhật chương thành công");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting chapter:", error);
      showErrorToast(
        error.response?.data?.message ||
          `Không thể ${modalMode === "create" ? "tạo" : "cập nhật"} chương`,
      );
    }
  };

  if (loading) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải danh sách chương...</p>
      </div>
    );
  }

  return (
    <div className="grade-chapters-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span
          onClick={() => navigate("/admin/subjects")}
          style={{ cursor: "pointer" }}
        >
          Môn học
        </span>
        <ChevronRight size={16} />
        <span
          onClick={() => navigate(`/admin/subjects/${subjectId}`)}
          style={{ cursor: "pointer" }}
        >
          {subject?.subjectName || subject?.subjectCode}
        </span>
        <ChevronRight size={16} />
        <span>Khối {gradeLevel}</span>
      </nav>

      {/* Header with Stat Card */}
      <div className="page-header-new">
        <button
          onClick={() => navigate(`/admin/subjects/${subjectId}`)}
          className="btn-back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="header-content">
          <div className="header-info">
            <h2>
              {subject?.subjectName || subject?.subjectCode} - Khối {gradeLevel}
            </h2>
            <p>Quản lý các chương học</p>
          </div>

          {chapters.length > 0 && (
            <div className="stat-card-compact">
              <div className="stat-icon">
                <BookOpen size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{chapters.length}</div>
                <div className="stat-text">Chương</div>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleCreate} className="btn-add-chapter">
          <Plus size={20} />
          Thêm chương
        </button>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <div className="illustration-circle">
              <BookOpen size={64} />
            </div>
          </div>
          <div className="empty-content">
            <h3>Chưa có chương nào</h3>
            <p>Bắt đầu tạo chương đầu tiên cho môn học này</p>
          </div>
          <button onClick={handleCreate} className="btn-primary-action">
            <Plus size={20} />
            Thêm chương đầu tiên
          </button>
        </div>
      ) : (
        <div className="chapters-list">
          {chapters.map((chapter, index) => {
            const isExpanded = expandedChapterId === chapter.id;
            const lessons = chapterLessons[chapter.id] || [];
            const isLoadingChapterLessons = loadingLessons[chapter.id];

            return (
              <div
                key={chapter.id}
                className={`chapter-card-expandable ${draggedItem === index ? "dragging" : ""} ${isExpanded ? "expanded" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="chapter-card-header">
                  <div className="drag-handle">
                    <GripVertical size={20} />
                  </div>

                  <div
                    className="chapter-main-content"
                    onClick={() => toggleExpandChapter(chapter.id)}
                  >
                    <div className="chapter-number-badge">
                      <span>Chương {chapter.chapterNumber}</span>
                    </div>
                    <div className="chapter-info">
                      <h3>{chapter.chapterName}</h3>
                      <p>{chapter.description || "Chưa có mô tả"}</p>
                      <div className="chapter-meta">
                        <span className="lesson-count">
                          <List size={14} />
                          {chapter.lessonCount || 0} bài học
                        </span>
                      </div>
                    </div>
                    <button className="expand-toggle">
                      <ChevronDown
                        size={20}
                        className={isExpanded ? "rotated" : ""}
                      />
                    </button>
                  </div>

                  <div className="chapter-actions-compact">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(chapter);
                      }}
                      className="btn-icon-outline"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chapter);
                      }}
                      className="btn-icon-outline btn-icon-delete"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="chapter-lessons-expanded">
                    <div className="lessons-header">
                      <h4>Danh sách bài học</h4>
                      <button
                        onClick={() => handleManageLessons(chapter.id)}
                        className="btn-manage-lessons"
                      >
                        <Plus size={16} />
                        Quản lý bài học
                      </button>
                    </div>

                    {isLoadingChapterLessons ? (
                      <div className="lessons-loading">
                        <Loader2
                          size={24}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        <p>Đang tải bài học...</p>
                      </div>
                    ) : lessons.length > 0 ? (
                      <div className="lessons-list">
                        {lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="lesson-item">
                            <div className="lesson-icon">
                              <FileText size={18} />
                            </div>
                            <div className="lesson-info">
                              <span className="lesson-name">
                                Bài {lesson.lessonNumber}: {lesson.lessonName}
                              </span>
                              {lesson.description && (
                                <span className="lesson-description">
                                  {lesson.description}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="lessons-empty">
                        <FileText size={32} />
                        <p>Chưa có bài học nào</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal - Material Design 3 */}
      {showModal && editingChapter && (
        <div className="modal-overlay-md3">
          <div className="modal-dialog-md3">
            <div className="modal-header-md3">
              <h3>
                {modalMode === "create"
                  ? "Thêm chương học mới"
                  : "Chỉnh sửa chương"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-md3"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-md3">
              <div className="form-row-md3">
                <div className="form-field-md3 form-field-small">
                  <input
                    type="number"
                    id="chapterNumber"
                    value={editingChapter.chapterNumber}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        chapterNumber: parseInt(e.target.value),
                      })
                    }
                    placeholder=" "
                    required
                    min="1"
                  />
                  <label htmlFor="chapterNumber">
                    Số thứ tự <span className="required">*</span>
                  </label>
                </div>

                <div className="form-field-md3 form-field-large">
                  <input
                    type="text"
                    id="chapterName"
                    value={editingChapter.chapterName}
                    onChange={(e) =>
                      setEditingChapter({
                        ...editingChapter,
                        chapterName: e.target.value,
                      })
                    }
                    placeholder=" "
                    required
                    maxLength="200"
                  />
                  <label htmlFor="chapterName">
                    Tên chương <span className="required">*</span>
                  </label>
                </div>
              </div>

              <div className="form-field-md3">
                <textarea
                  id="description"
                  value={editingChapter.description}
                  onChange={(e) =>
                    setEditingChapter({
                      ...editingChapter,
                      description: e.target.value,
                    })
                  }
                  placeholder=" "
                  rows="4"
                />
                <label htmlFor="description">Mô tả</label>
              </div>

              <div className="modal-actions-md3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-text-md3"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-md3">
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
                Bạn có chắc chắn muốn xóa chương{" "}
                <strong>
                  {deleteTarget.chapterNumber}. {deleteTarget.chapterName}
                </strong>
                ?
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
    </div>
  );
};

export default GradeChapters;
