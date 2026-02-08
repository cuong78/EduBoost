import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  BookOpen,
  Loader2,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  GripVertical,
} from "lucide-react";
import { adminSubjectService } from "../../services/adminSubjectService";
import { adminChapterService } from "../../services/adminChapterService";
import { adminLessonService } from "../../services/adminLessonService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import "./ChapterLessons.css";

const ChapterLessons = () => {
  const { subjectId, gradeLevel, chapterId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const fetchData = useCallback(
    async (isInitialLoad = true) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const [subjectData, chapterData, lessonsData] = await Promise.all([
          adminSubjectService.getSubjectById(subjectId),
          adminChapterService.getChapterById(chapterId),
          adminLessonService.getLessonsByChapter(chapterId),
        ]);
        setSubject(subjectData);
        setChapter(chapterData);
        setLessons(lessonsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        showErrorToast("Không thể tải dữ liệu");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [subjectId, chapterId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setModalMode("create");
    setEditingLesson({
      chapterId: parseInt(chapterId),
      lessonNumber: lessons.length + 1,
      lessonName: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (lesson) => {
    setModalMode("edit");
    setEditingLesson({
      id: lesson.id,
      chapterId: lesson.chapterId,
      lessonNumber: lesson.lessonNumber,
      lessonName: lesson.lessonName,
      description: lesson.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = (lesson) => {
    setDeleteTarget(lesson);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminLessonService.deleteLesson(deleteTarget.id);
      showSuccessToast("Xóa bài học thành công");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await fetchData(false);
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Không thể xóa bài học");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await adminLessonService.createLesson({
          chapterId: parseInt(chapterId),
          lessonNumber: editingLesson.lessonNumber,
          lessonName: editingLesson.lessonName,
          description: editingLesson.description,
        });
        showSuccessToast("Tạo bài học thành công");
      } else {
        await adminLessonService.updateLesson(editingLesson.id, {
          chapterId: editingLesson.chapterId,
          lessonNumber: editingLesson.lessonNumber,
          lessonName: editingLesson.lessonName,
          description: editingLesson.description,
        });
        showSuccessToast("Cập nhật bài học thành công");
      }
      setShowModal(false);
      setEditingLesson(null);
      await fetchData(false);
    } catch (error) {
      console.error("Error submitting lesson:", error);
      showErrorToast(
        error.response?.data?.message ||
          `Không thể ${modalMode === "create" ? "tạo" : "cập nhật"} bài học`,
      );
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newLessons = [...lessons];
    const draggedLesson = newLessons[draggedItem];
    newLessons.splice(draggedItem, 1);
    newLessons.splice(index, 0, draggedLesson);

    setLessons(newLessons);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  if (loading) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải danh sách bài học...</p>
      </div>
    );
  }

  return (
    <div className="chapter-lessons-page">
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
        <span
          onClick={() =>
            navigate(`/admin/subjects/${subjectId}/grade/${gradeLevel}`)
          }
          style={{ cursor: "pointer" }}
        >
          Khối {gradeLevel}
        </span>
        <ChevronRight size={16} />
        <span>Chương {chapter?.chapterNumber}</span>
      </nav>

      {/* Header */}
      <div className="page-header-new">
        <button
          onClick={() =>
            navigate(`/admin/subjects/${subjectId}/grade/${gradeLevel}`)
          }
          className="btn-back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="header-content">
          <div className="header-info">
            <h2>
              Chương {chapter?.chapterNumber}: {chapter?.chapterName}
            </h2>
            <p>Quản lý các bài học</p>
          </div>

          {lessons.length > 0 && (
            <div className="stat-card-compact">
              <div className="stat-icon">
                <FileText size={20} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{lessons.length}</div>
                <div className="stat-text">Bài học</div>
              </div>
            </div>
          )}
        </div>

        <button onClick={handleCreate} className="btn-add-lesson">
          <Plus size={20} />
          Thêm bài học
        </button>
      </div>

      {/* Refreshing Overlay */}
      {refreshing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Loader2
              size={24}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span>Đang tải...</span>
          </div>
        </div>
      )}

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <div className="illustration-circle">
              <FileText size={64} />
            </div>
          </div>
          <div className="empty-content">
            <h3>Chưa có bài học nào</h3>
            <p>Bắt đầu tạo bài học đầu tiên cho chương này</p>
          </div>
          <button onClick={handleCreate} className="btn-primary-action">
            <Plus size={20} />
            Thêm bài học đầu tiên
          </button>
        </div>
      ) : (
        <div className="lessons-list-page">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className={`lesson-card ${draggedItem === index ? "dragging" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle">
                <GripVertical size={20} />
              </div>

              <div className="lesson-number-badge">
                <span>Bài {lesson.lessonNumber}</span>
              </div>

              <div className="lesson-info">
                <h3>{lesson.lessonName}</h3>
                <p>{lesson.description || "Chưa có mô tả"}</p>
              </div>

              <div className="lesson-actions">
                <button
                  onClick={() => handleEdit(lesson)}
                  className="btn-icon-outline"
                  title="Chỉnh sửa"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(lesson)}
                  className="btn-icon-outline btn-icon-delete"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && editingLesson && (
        <div className="modal-overlay-md3">
          <div className="modal-dialog-md3">
            <div className="modal-header-md3">
              <h3>
                {modalMode === "create"
                  ? "Thêm bài học mới"
                  : "Chỉnh sửa bài học"}
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
                    id="lessonNumber"
                    min="1"
                    value={editingLesson.lessonNumber}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        lessonNumber: parseInt(e.target.value),
                      })
                    }
                    placeholder=" "
                    readOnly={modalMode === "create"}
                    disabled={modalMode === "create"}
                    style={
                      modalMode === "create"
                        ? {
                            cursor: "not-allowed",
                            opacity: 0.7,
                          }
                        : {}
                    }
                    required
                  />
                  <label htmlFor="lessonNumber">
                    Số thứ tự{" "}
                    {modalMode === "create" && (
                      <span
                        style={{ fontSize: "0.75rem", fontWeight: "normal" }}
                      >
                        (Tự động)
                      </span>
                    )}
                    <span className="required">*</span>
                  </label>
                </div>

                <div className="form-field-md3 form-field-large">
                  <input
                    type="text"
                    id="lessonName"
                    value={editingLesson.lessonName}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        lessonName: e.target.value,
                      })
                    }
                    placeholder=" "
                    required
                    maxLength="200"
                  />
                  <label htmlFor="lessonName">
                    Tên bài học <span className="required">*</span>
                  </label>
                </div>
              </div>

              <div className="form-field-md3">
                <textarea
                  id="description"
                  value={editingLesson.description}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
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
        <div className="modal-overlay-md3">
          <div className="modal-dialog-md3 modal-small">
            <div className="modal-header-md3 delete-header">
              <h3>Xác nhận xóa</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-close-md3"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-md3">
              <p>
                Bạn có chắc chắn muốn xóa bài học{" "}
                <strong>"{deleteTarget.lessonName}"</strong>?
              </p>
              <p className="warning-text">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="modal-actions-md3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-text-md3"
              >
                Hủy
              </button>
              <button onClick={confirmDelete} className="btn-delete-md3">
                Xóa bài học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterLessons;
