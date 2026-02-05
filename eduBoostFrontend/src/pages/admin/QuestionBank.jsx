import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  HelpCircle,
  Loader2,
  ChevronRight,
  Filter,
  Edit2,
  Trash2,
  Download,
  Upload,
  FileText,
  X,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { questionBankService } from "../../services/questionBankService";
import { adminSubjectService } from "../../services/adminSubjectService";
import { adminChapterService } from "../../services/adminChapterService";
import { adminLessonService } from "../../services/adminLessonService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const QuestionBank = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [cognitiveLevels, setCognitiveLevels] = useState([]);

  // Filter data
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedCognitiveLevel, setSelectedCognitiveLevel] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    lessonId: "",
    cognitiveLevelId: "",
    questionText: "",
    questionImageUrl: "",
    answerA: "",
    answerB: "",
    answerC: "",
    answerD: "",
    correctAnswer: "",
    explanation: "",
    sourceType: "MANUAL",
  });

  // Import data
  const [importFile, setImportFile] = useState(null);
  const [importLessonId, setImportLessonId] = useState("");
  const [importPreview, setImportPreview] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters();
    } else {
      setChapters([]);
      setSelectedChapter("");
      setLessons([]);
      setSelectedLesson("");
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedChapter) {
      fetchLessons();
    } else {
      setLessons([]);
      setSelectedLesson("");
    }
  }, [selectedChapter]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedLesson, selectedCognitiveLevel, selectedSourceType]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [subjectsData, cogLevelsData, statsData] = await Promise.all([
        adminSubjectService.getAllSubjects(),
        questionBankService.getCognitiveLevels(),
        questionBankService.getStats(),
      ]);
      setSubjects(subjectsData);
      setCognitiveLevels(cogLevelsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showErrorToast("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const data =
        await adminChapterService.getChaptersBySubject(selectedSubject);
      setChapters(data);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const data =
        await adminLessonService.getLessonsByChapter(selectedChapter);
      setLessons(data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const filters = {};
      if (selectedLesson) filters.lessonId = selectedLesson;
      if (selectedCognitiveLevel)
        filters.cognitiveLevelId = selectedCognitiveLevel;
      if (selectedSourceType) filters.sourceType = selectedSourceType;

      const data = await questionBankService.getQuestions(filters);
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      showErrorToast("Không thể tải danh sách câu hỏi");
    }
  };

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      lessonId: selectedLesson || "",
      cognitiveLevelId: "",
      questionText: "",
      questionImageUrl: "",
      answerA: "",
      answerB: "",
      answerC: "",
      answerD: "",
      correctAnswer: "",
      explanation: "",
      sourceType: "MANUAL",
    });
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      lessonId: question.lessonId,
      cognitiveLevelId: question.cognitiveLevelId,
      questionText: question.questionText,
      questionImageUrl: question.questionImageUrl || "",
      answerA: question.answerA,
      answerB: question.answerB,
      answerC: question.answerC,
      answerD: question.answerD,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      sourceType: question.sourceType,
    });
    setShowModal(true);
  };

  const handleDeleteQuestion = (question) => {
    setDeleteTarget(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await questionBankService.deleteQuestion(deleteTarget.id);
      showSuccessToast("Đã xóa câu hỏi");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchQuestions();
      if (stats) {
        const newStats = await questionBankService.getStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      showErrorToast("Không thể xóa câu hỏi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lessonId || !formData.cognitiveLevelId) {
      showErrorToast("Vui lòng chọn bài học và mức độ nhận thức");
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        await questionBankService.updateQuestion(editingQuestion.id, formData);
        showSuccessToast("Đã cập nhật câu hỏi");
      } else {
        await questionBankService.createQuestion(formData);
        showSuccessToast("Đã thêm câu hỏi mới");
      }
      setShowModal(false);
      fetchQuestions();
      const newStats = await questionBankService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error saving question:", error);
      showErrorToast("Không thể lưu câu hỏi");
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = () => {
    setImportFile(null);
    setImportLessonId(selectedLesson || "");
    setImportPreview(null);
    setShowImportModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);

    if (importLessonId) {
      try {
        setImporting(true);
        const preview = await questionBankService.importFromExcel(
          file,
          importLessonId,
        );
        setImportPreview(preview);
      } catch (error) {
        console.error("Error previewing import:", error);
        showErrorToast("Không thể đọc file Excel");
        setImportFile(null);
      } finally {
        setImporting(false);
      }
    }
  };

  const confirmImport = async () => {
    if (!importPreview || !importPreview.questions) return;

    try {
      setImporting(true);
      await questionBankService.createQuestionsBatch(importPreview.questions);
      showSuccessToast(`Đã import ${importPreview.questions.length} câu hỏi`);
      setShowImportModal(false);
      fetchQuestions();
      const newStats = await questionBankService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error importing questions:", error);
      showErrorToast("Không thể import câu hỏi");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await questionBankService.downloadTemplate();
      showSuccessToast("Đã tải template");
    } catch (error) {
      console.error("Error downloading template:", error);
      showErrorToast("Không thể tải template");
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="question-bank-page">
        <div className="empty-state glass">
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-bank-page">
      <nav className="breadcrumb">
        <span>Admin</span>
        <ChevronRight size={16} />
        <span>Ngân hàng câu hỏi</span>
      </nav>

      <div className="page-header">
        <div>
          <h2>Ngân hàng Câu hỏi</h2>
          <p>Quản lý kho câu hỏi cho các bài kiểm tra</p>
        </div>
        <div className="btn-group">
          <button onClick={handleDownloadTemplate} className="btn btn-glass">
            <Download size={20} />
            Template Excel
          </button>
          <button onClick={handleImportExcel} className="btn btn-glass">
            <Upload size={20} />
            Import Excel
          </button>
          <button onClick={handleCreateQuestion} className="btn btn-primary">
            <Plus size={20} />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-grid-3">
          <div className="stat-card glass">
            <div className="stat-header">
              <div>
                <p className="stat-label">Tổng câu hỏi</p>
                <h3 className="stat-value">{stats.totalQuestions || 0}</h3>
              </div>
              <div className="stat-icon-wrapper bg-indigo">
                <HelpCircle size={24} color="white" />
              </div>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-header">
              <div>
                <p className="stat-label">Đã xác thực</p>
                <h3 className="stat-value">{stats.verifiedQuestions || 0}</h3>
              </div>
              <div className="stat-icon-wrapper bg-green">
                <CheckCircle size={24} color="white" />
              </div>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-header">
              <div>
                <p className="stat-label">Chờ xác thực</p>
                <h3 className="stat-value">{stats.unverifiedQuestions || 0}</h3>
              </div>
              <div className="stat-icon-wrapper bg-orange">
                <AlertCircle size={24} color="white" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters-section glass">
        <div className="filter-row-5">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            className="filter-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.subjectCode}>
                {subject.subjectCode}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            disabled={!selectedSubject}
          >
            <option value="">Tất cả chương</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Chương {chapter.chapterNumber}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            disabled={!selectedChapter}
          >
            <option value="">Tất cả bài học</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                Bài {lesson.lessonNumber}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={selectedCognitiveLevel}
            onChange={(e) => setSelectedCognitiveLevel(e.target.value)}
          >
            <option value="">Tất cả mức độ</option>
            {cognitiveLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.levelName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="empty-state glass">
          <FileText size={48} />
          <p>Chưa có câu hỏi nào</p>
          <div className="empty-actions">
            <button onClick={handleCreateQuestion} className="btn btn-primary">
              <Plus size={20} />
              Tạo câu hỏi đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="questions-list glass">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="question-item">
              <div className="question-main">
                <div className="question-badges">
                  <span className="question-badge badge-primary">
                    {q.cognitiveLevelName || "N/A"}
                  </span>
                  <span
                    className={`question-badge badge-${q.sourceType?.toLowerCase() || "manual"}`}
                  >
                    {q.sourceType === "MANUAL"
                      ? "Thủ công"
                      : q.sourceType === "EXCEL_IMPORT"
                        ? "Excel"
                        : "AI"}
                  </span>
                  {q.isVerified && (
                    <span className="question-badge badge-verified">
                      <CheckCircle size={14} />
                      Đã xác thực
                    </span>
                  )}
                </div>
                <div className="question-content">
                  <p className="question-text">{q.questionText}</p>
                  <div className="question-answers">
                    <div className="answer-item">
                      <span
                        className={`answer-label ${q.correctAnswer === "A" ? "correct" : ""}`}
                      >
                        A
                      </span>
                      <span>{q.answerA}</span>
                    </div>
                    <div className="answer-item">
                      <span
                        className={`answer-label ${q.correctAnswer === "B" ? "correct" : ""}`}
                      >
                        B
                      </span>
                      <span>{q.answerB}</span>
                    </div>
                    <div className="answer-item">
                      <span
                        className={`answer-label ${q.correctAnswer === "C" ? "correct" : ""}`}
                      >
                        C
                      </span>
                      <span>{q.answerC}</span>
                    </div>
                    <div className="answer-item">
                      <span
                        className={`answer-label ${q.correctAnswer === "D" ? "correct" : ""}`}
                      >
                        D
                      </span>
                      <span>{q.answerD}</span>
                    </div>
                  </div>
                  <div className="question-meta">
                    <span>Bài: {q.lessonName || "N/A"}</span>
                    {q.explanation && <span>• Có giải thích</span>}
                  </div>
                </div>
              </div>
              <div className="question-actions">
                <button
                  onClick={() => handleEditQuestion(q)}
                  className="btn-icon btn-edit"
                  title="Sửa"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q)}
                  className="btn-icon btn-delete"
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Question Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass modal-large">
            <div className="modal-header">
              <h3>{editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    Bài học <span className="required">*</span>
                  </label>
                  <select
                    value={formData.lessonId}
                    onChange={(e) =>
                      setFormData({ ...formData, lessonId: e.target.value })
                    }
                    required
                  >
                    <option value="">Chọn bài học</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        Bài {lesson.lessonNumber}: {lesson.lessonName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Mức độ nhận thức <span className="required">*</span>
                  </label>
                  <select
                    value={formData.cognitiveLevelId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cognitiveLevelId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Chọn mức độ</option>
                    {cognitiveLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.levelName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Câu hỏi <span className="required">*</span>
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  placeholder="Nhập nội dung câu hỏi"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>URL hình ảnh (nếu có)</label>
                <input
                  type="text"
                  value={formData.questionImageUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionImageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div className="answers-grid">
                <div className="form-group">
                  <label>
                    Đáp án A <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.answerA}
                    onChange={(e) =>
                      setFormData({ ...formData, answerA: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Đáp án B <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.answerB}
                    onChange={(e) =>
                      setFormData({ ...formData, answerB: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Đáp án C <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.answerC}
                    onChange={(e) =>
                      setFormData({ ...formData, answerC: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Đáp án D <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.answerD}
                    onChange={(e) =>
                      setFormData({ ...formData, answerD: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Đáp án đúng <span className="required">*</span>
                </label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn đáp án đúng</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="form-group">
                <label>Giải thích (tùy chọn)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  placeholder="Giải thích cho đáp án đúng"
                  rows={3}
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={20}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingQuestion ? "Cập nhật" : "Tạo mới"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>Import câu hỏi từ Excel</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>
                  Bài học <span className="required">*</span>
                </label>
                <select
                  value={importLessonId}
                  onChange={(e) => setImportLessonId(e.target.value)}
                  disabled={!!importPreview}
                >
                  <option value="">Chọn bài học</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      Bài {lesson.lessonNumber}: {lesson.lessonName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  File Excel <span className="required">*</span>
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={!importLessonId || importing}
                />
                <p className="form-hint">
                  Chưa có file mẫu?{" "}
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="link-button"
                  >
                    Tải template tại đây
                  </button>
                </p>
              </div>

              {importing && (
                <div className="import-loading">
                  <Loader2
                    size={32}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <p>Đang đọc file...</p>
                </div>
              )}

              {importPreview && (
                <div className="import-preview">
                  <h4>
                    Xem trước: {importPreview.questions?.length || 0} câu hỏi
                  </h4>
                  <div className="preview-list">
                    {importPreview.questions?.slice(0, 3).map((q, index) => (
                      <div key={index} className="preview-item">
                        <strong>Câu {index + 1}:</strong> {q.questionText}
                      </div>
                    ))}
                    {importPreview.questions?.length > 3 && (
                      <p className="preview-more">
                        ... và {importPreview.questions.length - 3} câu hỏi khác
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn btn-glass"
              >
                Hủy
              </button>
              <button
                onClick={confirmImport}
                className="btn btn-primary"
                disabled={!importPreview || importing}
              >
                {importing ? (
                  <>
                    <Loader2
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Import {importPreview?.questions?.length || 0} câu hỏi
                  </>
                )}
              </button>
            </div>
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
                Bạn có chắc chắn muốn xóa câu hỏi:{" "}
                <strong>
                  {deleteTarget.questionText?.substring(0, 50)}...
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

      <style>{`
        .question-bank-page {
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
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: var(--color-text-secondary);
        }
        .btn-group {
          display: flex;
          gap: 0.75rem;
        }
        .stats-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          padding: 1.5rem;
          border-radius: 16px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
        .bg-green {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .bg-orange {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        .filters-section {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }
        .filter-row-5 {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
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
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
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
          background: white;
          cursor: pointer;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .filter-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 16px;
        }
        .empty-state svg {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }
        .empty-state p {
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
        }
        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .questions-list {
          border-radius: 16px;
          padding: 1.5rem;
        }
        .question-item {
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: background 0.2s;
        }
        .question-item:hover {
          background: rgba(99, 102, 241, 0.02);
        }
        .question-item:last-child {
          border-bottom: none;
        }
        .question-main {
          flex: 1;
        }
        .question-badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .question-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .badge-primary {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }
        .badge-manual {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }
        .badge-excel_import {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }
        .badge-verified {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .question-content {
          flex: 1;
        }
        .question-text {
          font-weight: 600;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .question-answers {
          display: grid;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .answer-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }
        .answer-label {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          background: rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }
        .answer-label.correct {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .question-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .question-actions {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }
        .btn-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-edit {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }
        .btn-edit:hover {
          background: #6366f1;
          color: white;
        }
        .btn-delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .btn-delete:hover {
          background: #ef4444;
          color: white;
        }
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
        }
        .modal-content {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          background: white;
        }
        .modal-content.modal-small {
          max-width: 400px;
        }
        .modal-content.modal-large {
          max-width: 800px;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-radius: 16px 16px 0 0;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .modal-header-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .modal-header-icon {
          display: inline-flex;
          margin-right: 0.5rem;
        }
        .modal-close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
        }
        .modal-close-btn:hover {
          opacity: 0.8;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .modal-body p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .warning-text {
          color: #ef4444;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .modal-form {
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.875rem;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .answers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .required {
          color: #ef4444;
        }
        .form-hint {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          margin-top: 0.5rem;
        }
        .link-button {
          background: none;
          border: none;
          color: #6366f1;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          font: inherit;
        }
        .link-button:hover {
          color: #4f46e5;
        }
        .import-loading {
          text-align: center;
          padding: 2rem;
        }
        .import-loading p {
          margin-top: 1rem;
          color: var(--color-text-secondary);
        }
        .import-preview {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(99, 102, 241, 0.05);
          border-radius: 12px;
        }
        .import-preview h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #6366f1;
        }
        .preview-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .preview-item {
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
        }
        .preview-more {
          text-align: center;
          color: var(--color-text-secondary);
          font-style: italic;
          margin-top: 0.5rem;
        }
        .form-actions,
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 768px) {
          .filter-row-5 {
            grid-template-columns: 1fr;
          }
          .stats-grid-3 {
            grid-template-columns: 1fr;
          }
          .btn-group {
            flex-direction: column;
          }
          .question-item {
            flex-direction: column;
          }
          .form-row-2,
          .answers-grid {
            grid-template-columns: 1fr;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default QuestionBank;
