import { useEffect, useState } from "react";
import {
  BookOpen,
  Database,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Upload,
  FileText,
} from "lucide-react";
import { knowledgeService } from "../../services/knowledgeService";
import { questionBankService } from "../../services/questionBankService";
import { showErrorToast, showSuccessToast } from "../../utils/show-toast";
import MathRenderer from "../../components/common/MathRenderer";
import RichTextEditor from "../../components/common/RichTextEditor";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const GRADE_OPTIONS = [6, 7, 8, 9, 10, 11, 12];

// Keyword match theo nhóm khối
const SUBJECT_KEYWORDS_BY_GRADE = {
  middle: ["toán", "khoa học tự nhiên", "vật lý", "hóa học"], // Lớp 6-9
  high: ["toán", "vật lý", "hóa học"],   // Lớp 10-12
};

const filterSubjectsByGrade = (subjects, grade) => {
  const keywords =
    grade >= 6 && grade <= 9
      ? SUBJECT_KEYWORDS_BY_GRADE.middle
      : SUBJECT_KEYWORDS_BY_GRADE.high;
  return subjects.filter((s) => {
    const name = (s.subjectName || s.name || "").toLowerCase();
    return keywords.some((kw) => name.includes(kw));
  });
};

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "TRUE_FALSE", label: "Đúng/Sai" },
  { value: "FILL_BLANK", label: "Điền khuyết" },
];

const SOURCE_TYPES = [
  { value: "", label: "Tất cả nguồn" },
  { value: "MANUAL", label: "Nhập tay" },
  { value: "IMPORTED", label: "Import từ file" },
  { value: "AI_GENERATED", label: "AI tạo" },
];

const QuestionBankManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDownloadTemplate = () => {
    showErrorToast("Chức năng tải template đang được phát triển");
  };

  // Filters
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [gradeLevel, setGradeLevel] = useState(6);

  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");

  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState("");

  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [cognitiveLevelFilter, setCognitiveLevelFilter] = useState("");
  const [showMyQuestionsOnly, setShowMyQuestionsOnly] = useState(false);

  // Data
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [cognitiveLevels, setCognitiveLevels] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 20;

  // Stats
  const [stats, setStats] = useState(null);

  // Edit modal
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // View modal
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Delete confirm
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  // Bulk import
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState(null);
  const [useAiClassification, setUseAiClassification] = useState(true);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState(null);

  // Word import (single file)
  const [showWordImportModal, setShowWordImportModal] = useState(false);
  const [wordImportFile, setWordImportFile] = useState(null);
  const [wordImportLessonId, setWordImportLessonId] = useState("");
  const [wordImporting, setWordImporting] = useState(false);
  const [wordImportResult, setWordImportResult] = useState(null);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const data = await knowledgeService.getSubjects();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setSubjects(list);
      const filtered = filterSubjectsByGrade(list, gradeLevel);
      if (!subjectId && filtered.length > 0) setSubjectId(String(filtered[0].id));
    } catch (e) {
      setSubjects([]);
      showErrorToast("Không tải được danh sách môn học");
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Danh sách môn sau khi lọc theo gradeLevel
  const filteredSubjects = filterSubjectsByGrade(subjects, gradeLevel);

  const loadChapters = async (sid, grade) => {
    if (!sid) return;
    setLoadingChapters(true);
    try {
      const data = await knowledgeService.getChaptersBySubject(sid, grade);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setChapters(list);
      setChapterId(""); // Reset to show all
    } catch (e) {
      setChapters([]);
      setChapterId("");
    } finally {
      setLoadingChapters(false);
    }
  };

  const loadLessons = async (cid) => {
    if (!cid) {
      setLessons([]);
      setLessonId("");
      return;
    }
    setLoadingLessons(true);
    try {
      const data = await knowledgeService.getLessonsByChapter(cid);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setLessons(list);
      setLessonId(""); // Reset to show all
    } catch (e) {
      setLessons([]);
      setLessonId("");
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadCognitiveLevels = async () => {
    try {
      const data = await questionBankService.getCognitiveLevels();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setCognitiveLevels(list);
    } catch (e) {
      setCognitiveLevels([]);
    }
  };

  const loadQuestions = async (page = currentPage) => {
    setLoadingQuestions(true);
    try {
      const filters = {
        page,
        size: PAGE_SIZE,
      };
      if (lessonId) filters.lessonId = Number(lessonId);
      if (cognitiveLevelFilter)
        filters.cognitiveLevelId = Number(cognitiveLevelFilter);
      if (sourceTypeFilter) filters.sourceType = sourceTypeFilter;
      if (chapterId && !lessonId) filters.chapterId = Number(chapterId);
      if (showMyQuestionsOnly && user?.userId) filters.createdById = user.userId;

      const data = await questionBankService.getQuestions(filters);
      const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);

      setQuestions(list);
      setTotalPages(data?.totalPages ?? 1);
      setTotalElements(data?.totalElements ?? list.length);
      setCurrentPage(page);
    } catch (e) {
      setQuestions([]);
      setTotalPages(0);
      setTotalElements(0);
      showErrorToast("Không tải được danh sách câu hỏi");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await questionBankService.getStats(
        subjectId || null,
        gradeLevel || null,
      );
      setStats(data);
    } catch (e) {
      setStats(null);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadCognitiveLevels();
  }, []);

  // Khi gradeLevel thay đổi → reset subjectId về môn đầu tiên trong nhóm mới
  useEffect(() => {
    const filtered = filterSubjectsByGrade(subjects, gradeLevel);
    if (filtered.length > 0) {
      setSubjectId(String(filtered[0].id));
    } else {
      setSubjectId("");
    }
  }, [gradeLevel]);

  useEffect(() => {
    if (subjectId) loadChapters(subjectId, gradeLevel);
  }, [subjectId, gradeLevel]);

  useEffect(() => {
    if (chapterId) {
      loadLessons(chapterId);
    } else {
      setLessons([]);
      setLessonId("");
    }
  }, [chapterId]);

  useEffect(() => {
    setCurrentPage(0);
    loadQuestions(0);
  }, [lessonId, chapterId, cognitiveLevelFilter, sourceTypeFilter, showMyQuestionsOnly]);

  useEffect(() => {
    loadStats();
  }, [subjectId, gradeLevel]);

  const canEditOrDelete = (question) => {
    if (!user || !question) return false;

    // Admin có thể sửa/xóa tất cả
    if (user.roles?.[0]?.roleName === "ADMIN") return true;

    // Người tạo có thể sửa/xóa câu hỏi của mình
    // So sánh linh hoạt vì có thể là string hoặc number
    const questionCreatorId = String(question.createdById);
    const currentUserId = String(user.userId || user.id);

    console.log("Can edit/delete check:", {
      questionCreatorId,
      currentUserId,
      match: questionCreatorId === currentUserId,
      question: question.id,
    });

    return questionCreatorId === currentUserId;
  };

  const handleViewQuestion = (question) => {
    setViewingQuestion(question);
    setShowViewModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion({
      ...question,
      cognitiveLevelId:
        question.cognitiveLevelId || question.cognitiveLevel?.id,
    });
    setShowEditModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    setSavingQuestion(true);
    try {
      await questionBankService.updateQuestion(editingQuestion.id, {
        lessonId: editingQuestion.lessonId,
        questionText: editingQuestion.questionText,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        questionType: editingQuestion.questionType,
        cognitiveLevelId: editingQuestion.cognitiveLevelId,
        sourceType: editingQuestion.sourceType,
      });
      showSuccessToast("Đã cập nhật câu hỏi");
      setShowEditModal(false);
      setEditingQuestion(null);
      loadQuestions();
    } catch (e) {
      showErrorToast(
        "Cập nhật thất bại: " +
          (e?.response?.data?.message || e?.message || "Lỗi"),
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await questionBankService.deleteQuestion(id);
      showSuccessToast("Đã xóa câu hỏi");
      setDeletingQuestionId(null);
      loadQuestions();
    } catch (e) {
      showErrorToast(
        "Xóa thất bại: " + (e?.response?.data?.message || e?.message || "Lỗi"),
      );
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportFile) {
      showErrorToast("Vui lòng chọn file ZIP");
      return;
    }
    setBulkImporting(true);
    setBulkImportResult(null);
    try {
      const result = await questionBankService.bulkImport(bulkImportFile, useAiClassification);
      setBulkImportResult(result);
      if (result.successCount > 0) {
        showSuccessToast(`Đã import ${result.successCount} câu hỏi thành công!`);
        loadQuestions(0);
        loadStats();
      }
    } catch (e) {
      showErrorToast("Import thất bại: " + (e?.response?.data?.message || e?.message || "Lỗi"));
    } finally {
      setBulkImporting(false);
    }
  };

  const handleWordImport = async () => {
    if (!wordImportFile) {
      showErrorToast("Vui lòng chọn file Word (.docx)");
      return;
    }
    if (!wordImportLessonId) {
      showErrorToast("Vui lòng chọn bài học");
      return;
    }
    setWordImporting(true);
    setWordImportResult(null);
    try {
      const result = await questionBankService.importFromWord(wordImportFile, wordImportLessonId, useAiClassification);
      setWordImportResult(result);
      showSuccessToast(`Đã import ${result.length} câu hỏi từ Word!`);
      loadQuestions(0);
      loadStats();
    } catch (e) {
      showErrorToast("Import Word thất bại: " + (e?.response?.data?.message || e?.message || "Lỗi"));
    } finally {
      setWordImporting(false);
    }
  };

  return (
    <div className="question-bank-page">
      <div className="page-header">
        <h2>
          <Database size={24} /> Ngân hàng câu hỏi
        </h2>
        <p>Quản lý tất cả câu hỏi theo môn học, khối, bài học</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-row glass">
          <div className="stat-card">
            <span className="stat-value">{stats.totalQuestions || 0}</span>
            <span className="stat-label">Tổng câu hỏi</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.aiGeneratedCount || 0}</span>
            <span className="stat-label">AI tạo</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.manualCount || 0}</span>
            <span className="stat-label">Nhập tay</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.importedCount || 0}</span>
            <span className="stat-label">Import</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section glass">
        <h3>
          <Filter size={18} /> Bộ lọc
        </h3>
        <div className="filters-grid">
          <div className="field">
            <label>Khối</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Môn học</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={loadingSubjects}
            >
              <option value="">Chọn môn...</option>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.subjectName || s.name || ""}
                  </option>
                ))
              ) : (
                <option value="">-- Không có môn phù hợp --</option>
              )}
            </select>
          </div>
          <div className="field">
            <label>Chương</label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={loadingChapters || chapters.length === 0}
            >
              <option value="">Tất cả chương</option>
              {chapters.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  Chương {c.chapterNumber}: {c.chapterName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Bài học</label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              disabled={loadingLessons || lessons.length === 0}
            >
              <option value="">Tất cả bài</option>
              {lessons.map((l) => (
                <option key={l.id} value={String(l.id)}>
                  Bài {l.lessonNumber}: {l.lessonName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Nguồn</label>
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Mức độ nhận thức</label>
            <select
              value={cognitiveLevelFilter}
              onChange={(e) => setCognitiveLevelFilter(e.target.value)}
            >
              <option value="">Tất cả mức độ</option>
              {cognitiveLevels.map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.level}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={loadQuestions}>
            <RefreshCw size={16} /> Làm mới
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/teacher/create-question")}
          >
            <Plus size={16} /> Tạo câu hỏi mới
          </button>
        </div>
      </div>

      {/* My/All tabs */}
      <div className="question-tabs glass" style={{ display: 'flex', gap: '0', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden' }}>
        <button
          className={`tab ${showMyQuestionsOnly ? 'active' : ''}`}
          onClick={() => { setShowMyQuestionsOnly(true); setCurrentPage(0); }}
          style={{
            flex: 1, padding: '12px 20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
            background: showMyQuestionsOnly ? 'var(--primary, #6366f1)' : 'transparent',
            color: showMyQuestionsOnly ? '#fff' : 'inherit',
            transition: 'all 0.2s ease'
          }}
        >
          📝 Câu hỏi của tôi
        </button>
        <button
          className={`tab ${!showMyQuestionsOnly ? 'active' : ''}`}
          onClick={() => { setShowMyQuestionsOnly(false); setCurrentPage(0); }}
          style={{
            flex: 1, padding: '12px 20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
            background: !showMyQuestionsOnly ? 'var(--primary, #6366f1)' : 'transparent',
            color: !showMyQuestionsOnly ? '#fff' : 'inherit',
            transition: 'all 0.2s ease'
          }}
        >
          📚 Tất cả câu hỏi
        </button>
      </div>

      {/* Questions list */}
      <div className="questions-section glass">
        <h3>
          <BookOpen size={18} /> Danh sách câu hỏi ({totalElements})
        </h3>

        {loadingQuestions ? (
          <p className="muted">Đang tải...</p>
        ) : questions.length === 0 ? (
          <p className="muted">
            Không có câu hỏi nào. Hãy chọn bộ lọc hoặc tạo câu hỏi mới.
          </p>
        ) : (
          <div className="questions-list">
            {questions.map((q) => (
              <div key={q.id} className="question-card">
                <div className="question-header">
                  <span className="question-id">#{q.id}</span>
                  <span className="question-type-badge">
                    {QUESTION_TYPES.find((t) => t.value === q.questionType)
                      ?.label || q.questionType}
                  </span>
                  <span
                    className={`source-badge ${q.sourceType?.toLowerCase()}`}
                  >
                    {SOURCE_TYPES.find((t) => t.value === q.sourceType)
                      ?.label || q.sourceType}
                  </span>
                  {q.cognitiveLevel && (
                    <span className="cognitive-badge">
                      {typeof q.cognitiveLevel === 'string' ? q.cognitiveLevel : (q.cognitiveLevel?.level || q.cognitiveLevelName)}
                    </span>
                  )}
                </div>
                <div className="question-text">
                  <MathRenderer
                    content={
                      (q.questionText || "").substring(0, 200) +
                      (q.questionText?.length > 200 ? "..." : "")
                    }
                  />
                </div>
                <div className="question-meta">
                  <span>
                    Bài: {q.lessonName || q.lesson?.lessonName || "N/A"}
                  </span>
                  <span>
                    Tạo: {new Date(q.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="question-actions">
                  <button
                    className="icon-btn"
                    onClick={() => handleViewQuestion(q)}
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>
                  {canEditOrDelete(q) && (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => handleEditQuestion(q)}
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeletingQuestionId(q.id)}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 0}
              onClick={() => loadQuestions(currentPage - 1)}
            >
              ← Trước
            </button>
            <div className="pagination-pages">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i;
                } else if (currentPage < 4) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 7 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => loadQuestions(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => loadQuestions(currentPage + 1)}
            >
              Sau →
            </button>
            <span className="pagination-info">
              Trang {currentPage + 1}/{totalPages} · {totalElements} câu hỏi
            </span>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && viewingQuestion && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Chi tiết câu hỏi #{viewingQuestion.id}</h3>
            <div className="view-section">
              <label>Câu hỏi</label>
              <div className="view-content">
                <MathRenderer content={viewingQuestion.questionText || "—"} />
              </div>
            </div>
            <div className="view-section">
              <label>Đáp án đúng</label>
              <div className="view-content answer">
                <MathRenderer content={viewingQuestion.correctAnswer || "—"} />
              </div>
            </div>
            {viewingQuestion.explanation && (
              <div className="view-section">
                <label>Giải thích</label>
                <div className="view-content explanation">
                  <MathRenderer content={viewingQuestion.explanation} />
                </div>
              </div>
            )}
            {viewingQuestion.imageUrl && !viewingQuestion.questionText?.includes(viewingQuestion.imageUrl) && (
              <div className="view-section">
                <label>Hình ảnh câu hỏi</label>
                <div className="view-content">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/files/${viewingQuestion.imageUrl}`}
                    alt="Hình ảnh câu hỏi"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
            )}
            {viewingQuestion.answerImageUrl && (
              <div className="view-section">
                <label>Hình ảnh đáp án</label>
                <div className="view-content">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/files/${viewingQuestion.answerImageUrl}`}
                    alt="Hình ảnh đáp án"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
            )}
            <div className="view-meta">
              <span>
                <strong>Dạng:</strong>{" "}
                {
                  QUESTION_TYPES.find(
                    (t) => t.value === viewingQuestion.questionType,
                  )?.label
                }
              </span>
              <span>
                <strong>Mức độ:</strong>{" "}
                {typeof viewingQuestion.cognitiveLevel === 'string'
                  ? viewingQuestion.cognitiveLevel
                  : (viewingQuestion.cognitiveLevel?.level ||
                    viewingQuestion.cognitiveLevelName ||
                    "N/A")}
              </span>
              <span>
                <strong>Nguồn:</strong>{" "}
                {
                  SOURCE_TYPES.find(
                    (t) => t.value === viewingQuestion.sourceType,
                  )?.label
                }
              </span>
              <span>
                <strong>Bài:</strong>{" "}
                {viewingQuestion.lessonName ||
                  viewingQuestion.lesson?.lessonName}
              </span>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Đóng
              </button>
              {canEditOrDelete(viewingQuestion) && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditQuestion(viewingQuestion);
                  }}
                >
                  <Edit2 size={16} /> Sửa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingQuestion && (
        <div
          className="modal-overlay"
          onClick={() => !savingQuestion && setShowEditModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Sửa câu hỏi #{editingQuestion.id}</h3>
            <div className="field">
              <label>Câu hỏi</label>
              <RichTextEditor
                value={editingQuestion.questionText || ""}
                onChange={(value) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    questionText: value,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Đáp án đúng</label>
              <RichTextEditor
                value={editingQuestion.correctAnswer || ""}
                onChange={(value) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    correctAnswer: value,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Giải thích</label>
              <RichTextEditor
                value={editingQuestion.explanation || ""}
                onChange={(value) =>
                  setEditingQuestion({ ...editingQuestion, explanation: value })
                }
              />
            </div>
            <div className="row">
              <div className="field">
                <label>Dạng câu hỏi</label>
                <select
                  value={editingQuestion.questionType || "MULTIPLE_CHOICE"}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      questionType: e.target.value,
                    })
                  }
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Mức độ nhận thức</label>
                <select
                  value={editingQuestion.cognitiveLevelId || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      cognitiveLevelId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">Chọn mức độ...</option>
                  {cognitiveLevels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={savingQuestion}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveQuestion}
                disabled={savingQuestion}
              >
                {savingQuestion ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingQuestionId && (
        <div
          className="modal-overlay"
          onClick={() => setDeletingQuestionId(null)}
        >
          <div
            className="modal-content small"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc chắn muốn xóa câu hỏi #{deletingQuestionId}? Hành động
              này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingQuestionId(null)}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteQuestion(deletingQuestionId)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="modal-overlay" onClick={() => !bulkImporting && setShowBulkImportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3><Upload size={20} /> Import hàng loạt từ ZIP</h3>
            <p className="muted" style={{ marginBottom: '1rem' }}>
              Cấu trúc folder: <code>Lop X / Mon / Chuong N / Bai M.[docx|xlsx]</code>
            </p>
            <div className="field">
              <label>File ZIP</label>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setBulkImportFile(e.target.files[0])}
                disabled={bulkImporting}
              />
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="aiClassify"
                checked={useAiClassification}
                onChange={(e) => setUseAiClassification(e.target.checked)}
                disabled={bulkImporting}
              />
              <label htmlFor="aiClassify" style={{ cursor: 'pointer', margin: 0 }}>
                AI tự đánh mức độ nhận thức (DeepSeek)
              </label>
            </div>

            {bulkImporting && (
              <div className="bulk-progress">
                <div className="spinner" />
                <span>Đang import{useAiClassification ? ' và AI đang phân loại' : ''}... Vui lòng đợi.</span>
              </div>
            )}

            {bulkImportResult && (
              <div className="bulk-result">
                <div className="result-stats">
                  <span className="result-success">✅ {bulkImportResult.successCount} câu hỏi</span>
                  <span>{bulkImportResult.totalFiles} files</span>
                  {bulkImportResult.aiClassifiedCount > 0 && (
                    <span>🤖 AI phân loại: {bulkImportResult.aiClassifiedCount}</span>
                  )}
                </div>
                {bulkImportResult.byGrade && Object.keys(bulkImportResult.byGrade).length > 0 && (
                  <div className="result-by-grade">
                    {Object.entries(bulkImportResult.byGrade).map(([grade, count]) => (
                      <span key={grade} className="grade-badge">{grade}: {count} câu</span>
                    ))}
                  </div>
                )}
                {bulkImportResult.errors && bulkImportResult.errors.length > 0 && (
                  <details className="result-errors">
                    <summary>⚠️ {bulkImportResult.errors.length} lỗi</summary>
                    <ul>
                      {bulkImportResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowBulkImportModal(false)} disabled={bulkImporting}>
                {bulkImportResult ? 'Đóng' : 'Hủy'}
              </button>
              {!bulkImportResult && (
                <button className="btn btn-primary" onClick={handleBulkImport} disabled={bulkImporting || !bulkImportFile}>
                  {bulkImporting ? 'Đang import...' : 'Bắt đầu import'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Word Import Modal */}
      {showWordImportModal && (
        <div className="modal-overlay" onClick={() => !wordImporting && setShowWordImportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3><FileText size={20} /> Import từ Word (.docx)</h3>
            <p className="muted" style={{ marginBottom: '1rem' }}>
              Upload file Word chứa câu hỏi. Hệ thống tự nhận diện dạng câu hỏi, công thức toán (LaTeX), và hình ảnh.
            </p>
            <div className="field">
              <label>Chọn bài học</label>
              <select value={wordImportLessonId} onChange={(e) => setWordImportLessonId(e.target.value)} disabled={wordImporting}>
                <option value="">-- Chọn bài học --</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>Bài {l.lessonNumber}: {l.lessonName}</option>
                ))}
              </select>
              {lessons.length === 0 && <p className="muted" style={{ fontSize: '0.85rem' }}>Vui lòng chọn chương ở bộ lọc trước</p>}
            </div>
            <div className="field">
              <label>File Word (.docx)</label>
              <input type="file" accept=".docx" onChange={(e) => setWordImportFile(e.target.files[0])} disabled={wordImporting} />
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="aiClassifyWord" checked={useAiClassification} onChange={(e) => setUseAiClassification(e.target.checked)} disabled={wordImporting} />
              <label htmlFor="aiClassifyWord" style={{ cursor: 'pointer', margin: 0 }}>AI tự đánh mức độ nhận thức</label>
            </div>

            {wordImporting && (
              <div className="bulk-progress">
                <div className="spinner" />
                <span>Đang import và phân tích file Word... Vui lòng đợi.</span>
              </div>
            )}

            {wordImportResult && (
              <div className="bulk-result">
                <div className="result-stats">
                  <span className="result-success">✅ {wordImportResult.length} câu hỏi đã import</span>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowWordImportModal(false)} disabled={wordImporting}>
                {wordImportResult ? 'Đóng' : 'Hủy'}
              </button>
              {!wordImportResult && (
                <button className="btn btn-primary" onClick={handleWordImport} disabled={wordImporting || !wordImportFile || !wordImportLessonId}>
                  {wordImporting ? 'Đang import...' : 'Bắt đầu import'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
                .question-bank-page { max-width: 1200px; margin: 0 auto; }
                .page-header { margin-bottom: 1.5rem; }
                .page-header h2 { display: flex; gap: 10px; align-items: center; margin: 0 0 6px; font-size: 1.75rem; }
                .page-header p { margin: 0; color: var(--color-text-secondary); }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1.25rem;
                }
                .stat-card {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255,255,255,0.5);
                    border-radius: 12px;
                }
                .stat-value {
                    display: block;
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-accent-1);
                }
                .stat-label {
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                }

                .filters-section {
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .filters-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                }
                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .filter-actions {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .questions-section {
                    padding: 1.5rem;
                }
                .questions-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                }
                .questions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .question-card {
                    background: rgba(255,255,255,0.7);
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .question-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                }
                .question-id {
                    font-weight: 700;
                    color: var(--color-accent-1);
                }
                .question-type-badge,
                .source-badge,
                .cognitive-badge {
                    font-size: 0.75rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-weight: 500;
                }
                .question-type-badge {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }
                .source-badge {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-text-secondary);
                }
                .source-badge.ai_generated {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--ds-success);
                }
                .source-badge.imported {
                    background: rgba(245, 158, 11, 0.1);
                    color: var(--ds-warning);
                }
                .cognitive-badge {
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--ds-info);
                }
                .question-text {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 0.75rem;
                }
                .question-meta {
                    display: flex;
                    gap: 1.5rem;
                    font-size: 0.8rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.75rem;
                }
                .question-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .icon-btn {
                    padding: 6px 10px;
                    border: none;
                    background: rgba(0,0,0,0.05);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }
                .icon-btn.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--ds-error);
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }
                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .modal-content.small {
                    width: 400px;
                }
                .modal-content.large {
                    width: 700px;
                }
                .modal-content h3 {
                    margin: 0 0 1.5rem;
                    font-size: 1.25rem;
                }
                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }
                .view-section {
                    margin-bottom: 1.25rem;
                }
                .view-section label {
                    display: block;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.5rem;
                }
                .view-content {
                    background: rgba(0,0,0,0.02);
                    padding: 1rem;
                    border-radius: 8px;
                    line-height: 1.6;
                }
                .view-content.answer {
                    background: rgba(16, 185, 129, 0.1);
                    border-left: 3px solid var(--ds-success);
                }
                .view-content.explanation {
                    background: rgba(96, 78, 255, 0.05);
                    border-left: 3px solid var(--color-accent-1);
                    font-style: italic;
                }
                .view-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    font-size: 0.9rem;
                    padding: 1rem;
                    background: rgba(0,0,0,0.02);
                    border-radius: 8px;
                }

                .field { margin-bottom: 1rem; }
                .field label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .field select, .field input, .field textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    background: white;
                }
                .row { display: flex; gap: 1rem; }
                .row .field { flex: 1; }
                .muted { color: var(--color-text-secondary); }

                .btn {
                    padding: 0.75rem 1.25rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    color: white;
                }
                .btn-secondary {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-text-secondary);
                }
                .btn-danger {
                    background: var(--ds-error);
                    color: white;
                }
                .btn:hover { transform: translateY(-1px); }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.85rem; }

                .pagination-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(0,0,0,0.08);
                    flex-wrap: wrap;
                }
                .pagination-pages {
                    display: flex;
                    gap: 0.25rem;
                }
                .pagination-info {
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                    margin-left: 0.75rem;
                }

                .btn-accent {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                }

                .bulk-progress {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(99, 102, 241, 0.08);
                    border-radius: 8px;
                    margin: 1rem 0;
                }
                .spinner {
                    width: 20px; height: 20px;
                    border: 3px solid rgba(99, 102, 241, 0.2);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .bulk-result {
                    padding: 1rem;
                    background: rgba(34, 197, 94, 0.08);
                    border-radius: 8px;
                    margin: 1rem 0;
                }
                .result-stats {
                    display: flex; gap: 1rem; flex-wrap: wrap;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                .result-success { color: #16a34a; font-size: 1.1rem; }
                .result-by-grade {
                    display: flex; gap: 0.5rem; flex-wrap: wrap;
                    margin-top: 0.5rem;
                }
                .grade-badge {
                    background: rgba(99, 102, 241, 0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                }
                .result-errors {
                    margin-top: 0.75rem;
                    font-size: 0.85rem;
                    color: #dc2626;
                }
                .result-errors ul {
                    max-height: 150px;
                    overflow-y: auto;
                    padding-left: 1.25rem;
                    margin-top: 0.5rem;
                }
            `}</style>
    </div>
  );
};

export default QuestionBankManagement;
