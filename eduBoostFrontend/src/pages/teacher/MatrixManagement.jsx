import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Edit,
  LayoutGrid,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from "lucide-react";
import { examService } from "../../services/examService";
import { knowledgeService } from "../../services/knowledgeService";
import { apiClient } from "../../services/api";
import { API } from "../../constants/api";
import { showErrorToast, showSuccessToast } from "../../utils/show-toast";

const GRADE_OPTIONS = [6, 7, 8, 9, 10, 11, 12];
const COGNITIVE_LEVELS_DEFAULT = [
  { id: null, name: "Nhận biết", code: "nb" },
  { id: null, name: "Thông hiểu", code: "th" },
  { id: null, name: "Vận dụng", code: "vd" },
  { id: null, name: "Vận dụng cao", code: "vdc" },
];

// Tên môn (keyword match không phân biệt hoa thường) theo nhóm khối
const SUBJECT_KEYWORDS_BY_GRADE = {
  // Lớp 6-9: Toán và Khoa học tự nhiên
  middle: ["toán", "khoa học tự nhiên"],
  // Lớp 10-12: Toán, Vật lý, Hóa học
  high: ["toán", "vật lý", "hóa học"],
};

/** Lọc danh sách môn theo khối lớp */
const filterSubjectsByGrade = (subjects, grade) => {
  if (!grade) return subjects;
  const gradeNum = Number(grade);
  const keywords =
    gradeNum >= 6 && gradeNum <= 9
      ? SUBJECT_KEYWORDS_BY_GRADE.middle
      : SUBJECT_KEYWORDS_BY_GRADE.high;
  return subjects.filter((s) => {
    const name = (s.subjectName || s.description || s.name || "").toLowerCase();
    return keywords.some((kw) => name.includes(kw));
  });
};

// ─── Small helper: format date ───────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "—";

// ─── MatrixManagement page ───────────────────────────────────────────────────
const MatrixManagement = () => {
  // List
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter
  const [subjects, setSubjects] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Cognitive levels from API (for creating templates)
  const [cognitiveLevels, setCognitiveLevels] = useState([]);

  // Lessons (for Part 2)
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loadedLessonsMap, setLoadedLessonsMap] = useState({});

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // ─── Form state ────────────────────────────────────────────────────────────
  const blankForm = () => ({
    templateName: "",
    examTypeId: "",
    subjectId: "",
    gradeLevel: 10,
    description: "",
    isDefault: false,
    // Part 1: { [cognitiveLevelId]: { numberOfQuestions, pointsPerQuestion } }
    details: {},
    // Part 2: { [lessonId]: { [cognitiveLevelId]: numberOfQuestions } }
    lessonDetails: {},
    // UI: selected lesson ids for Part 2
    selectedLessonIds: [],
  });
  const [form, setForm] = useState(blankForm());
  const [formChapterId, setFormChapterId] = useState("");
  const [formLessons, setFormLessons] = useState([]);
  const [saving, setSaving] = useState(false);

  // ─── Load data ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSubject) params.subjectId = filterSubject;
      if (filterGrade) params.gradeLevel = filterGrade;
      if (filterType) params.examTypeId = filterType;
      const data = await examService.getMatrixTemplates(params);
      setTemplates(Array.isArray(data) ? data : data?.data || []);
    } catch {
      showErrorToast("Không thể tải danh sách ma trận");
    } finally {
      setLoading(false);
    }
  }, [filterSubject, filterGrade, filterType]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    knowledgeService.getSubjects().then((d) =>
      setSubjects(Array.isArray(d) ? d : d?.data || [])
    );
    examService.getExamTypes().then((d) =>
      setExamTypes(Array.isArray(d) ? d : d?.data || [])
    );
    // Load cognitive levels from backend
    apiClient.get(API.COGNITIVE_LEVELS)
      .then((res) => {
        const levels = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCognitiveLevels(levels.length ? levels : COGNITIVE_LEVELS_DEFAULT.map((l) => ({ ...l })));
      })
      .catch(() => {
        setCognitiveLevels(COGNITIVE_LEVELS_DEFAULT.map((l) => ({ ...l })));
      });
  }, []);

  // Load chapters when subjectId + gradeLevel changes inside form
  useEffect(() => {
    if (!form.subjectId || !form.gradeLevel) return;
    knowledgeService
      .getChaptersBySubject(form.subjectId, form.gradeLevel)
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.data || [];
        setChapters(list);
        if (list.length) setFormChapterId(String(list[0].id));
      })
      .catch(() => setChapters([]));
  }, [form.subjectId, form.gradeLevel, showForm]);

  // Load lessons when chapter changes in form
  useEffect(() => {
    if (!formChapterId) return;
    knowledgeService
      .getLessonsByChapter(formChapterId)
      .then((d) => {
        const list = Array.isArray(d) ? d : d?.data || [];
        setFormLessons(list);
        setLoadedLessonsMap((prev) => {
          const map = { ...prev };
          list.forEach((l) => { map[l.id] = l; });
          return map;
        });
      })
      .catch(() => setFormLessons([]));
  }, [formChapterId]);

  // ─── Filtered list ─────────────────────────────────────────────────────────
  const filtered = templates.filter((t) => {
    if (searchTerm && !t.templateName?.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  // ─── Form helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTemplate(null);
    setForm(blankForm());
    setFormChapterId("");
    setFormLessons([]);
    setLoadedLessonsMap({});
    setShowForm(true);
  };

  const openEdit = async (template) => {
    setEditTemplate(template);
    // Fetch detail to get lessonDetails
    let full = template;
    try {
      full = await examService.getMatrixTemplateById(template.id);
    } catch {}

    // Build details map
    const detailsMap = {};
    (full.details || []).forEach((d) => {
      detailsMap[d.cognitiveLevelId] = {
        numberOfQuestions: d.numberOfQuestions || 0,
        pointsPerQuestion: d.pointsPerQuestion || 0,
      };
    });

    // Build lessonDetails map
    const lessonDetailsMap = {};
    const lessonIdSet = new Set();
    const mapExtracted = {};
    (full.lessonDetails || []).forEach((ld) => {
      if (!lessonDetailsMap[ld.lessonId]) lessonDetailsMap[ld.lessonId] = {};
      lessonDetailsMap[ld.lessonId][ld.cognitiveLevelId] = ld.numberOfQuestions || 0;
      lessonIdSet.add(String(ld.lessonId));
      mapExtracted[ld.lessonId] = {
        id: ld.lessonId,
        lessonNumber: ld.lessonNumber || "",
        lessonName: ld.lessonName || "",
      };
    });
    setLoadedLessonsMap((prev) => ({ ...prev, ...mapExtracted }));

    setForm({
      templateName: full.templateName || "",
      examTypeId: String(full.examTypeId || ""),
      subjectId: String(full.subjectId || ""),
      gradeLevel: full.gradeLevel || 10,
      description: full.description || "",
      isDefault: full.isDefault || false,
      details: detailsMap,
      lessonDetails: lessonDetailsMap,
      selectedLessonIds: [...lessonIdSet],
    });
    setShowForm(true);
  };

  const setDetail = (cognitiveLevelId, field, value) => {
    setForm((f) => {
      const parsedValue = value === "" ? "" : (Number(value) || 0);
      const newDetails = {
        ...f.details,
        [cognitiveLevelId]: {
          ...(f.details[cognitiveLevelId] || {}),
          [field]: parsedValue,
        },
      };

      if (field === "numberOfQuestions") {
        let totalQ = 0;
        Object.values(newDetails).forEach((d) => {
          totalQ += Number(d.numberOfQuestions) || 0;
        });

        if (totalQ > 0) {
          const pointsPerQ = 10 / totalQ;
          Object.keys(newDetails).forEach((key) => {
            newDetails[key].pointsPerQuestion = Number(pointsPerQ.toFixed(4));
          });
        } else {
          Object.keys(newDetails).forEach((key) => {
            newDetails[key].pointsPerQuestion = 0;
          });
        }
      }

      return {
        ...f,
        details: newDetails,
      };
    });
  };

  const setLessonDetail = (lessonId, cognitiveLevelId, value) => {
    setForm((f) => ({
      ...f,
      lessonDetails: {
        ...f.lessonDetails,
        [lessonId]: {
          ...(f.lessonDetails[lessonId] || {}),
          [cognitiveLevelId]: value === "" ? "" : (Number(value) || 0),
        },
      },
    }));
  };

  const toggleLesson = (lessonId) => {
    const id = String(lessonId);
    setForm((f) => {
      const cur = f.selectedLessonIds.includes(id)
        ? f.selectedLessonIds.filter((x) => x !== id)
        : [...f.selectedLessonIds, id];
      return { ...f, selectedLessonIds: cur };
    });
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.templateName.trim()) return showErrorToast("Vui lòng nhập tên ma trận");
    if (!form.examTypeId) return showErrorToast("Vui lòng chọn loại đề");
    if (!form.subjectId) return showErrorToast("Vui lòng chọn môn học");
    if (!cognitiveLevels.length) return showErrorToast("Không có dữ liệu mức độ nhận thức");

    const details = cognitiveLevels
      .filter((cl) => cl.id)
      .map((cl) => ({
        cognitiveLevelId: cl.id,
        numberOfQuestions: Number(form.details[cl.id]?.numberOfQuestions || 0),
        pointsPerQuestion: Number(form.details[cl.id]?.pointsPerQuestion || 0),
      }))
      .filter((d) => d.numberOfQuestions > 0);

    if (!details.length) return showErrorToast("Vui lòng nhập ít nhất 1 mức độ nhận thức");

    for (const d of details) {
      if (d.numberOfQuestions > 0) {
        const target = d.numberOfQuestions;
        const current = lessonTotalByCL(d.cognitiveLevelId);
        if (current !== target) {
          const clName = cognitiveLevels.find((c) => c.id === d.cognitiveLevelId)?.name || "mức độ tương ứng";
          return showErrorToast(`Chưa phân bổ đúng số câu cho phần 2 mức "${clName}". Đã phân bổ: ${current}/${target} câu.`);
        }
      }
    }

    // Build Part 2 lessonDetails
    const lessonDetails = [];
    form.selectedLessonIds.forEach((lid) => {
      cognitiveLevels
        .filter((cl) => cl.id)
        .forEach((cl) => {
          const n = Number(form.lessonDetails[lid]?.[cl.id] || 0);
          if (n >= 0) {
            lessonDetails.push({
              lessonId: Number(lid),
              cognitiveLevelId: cl.id,
              numberOfQuestions: n,
            });
          }
        });
    });

    const payload = {
      templateName: form.templateName.trim(),
      examTypeId: Number(form.examTypeId),
      subjectId: Number(form.subjectId),
      gradeLevel: Number(form.gradeLevel),
      description: form.description,
      isDefault: form.isDefault,
      details,
      lessonDetails,
    };

    setSaving(true);
    try {
      if (editTemplate) {
        await examService.updateMatrixTemplate(editTemplate.id, payload);
        showSuccessToast("Đã cập nhật ma trận");
      } else {
        await examService.createMatrixTemplate(payload);
        showSuccessToast("Đã tạo ma trận mới");
      }
      setShowForm(false);
      loadAll();
    } catch (e) {
      showErrorToast("Không thể lưu ma trận: " + (e?.response?.data?.message || e.message || ""));
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await examService.deleteMatrixTemplate(deleteTarget.id);
      showSuccessToast("Đã xóa ma trận");
      setDeleteTarget(null);
      loadAll();
    } catch {
      showErrorToast("Không thể xóa ma trận");
    }
  };

  // ─── View detail ───────────────────────────────────────────────────────────
  const handleView = async (template) => {
    try {
      const full = await examService.getMatrixTemplateById(template.id);
      setViewTemplate(full);
    } catch {
      setViewTemplate(template);
    }
  };

  // ─── Part 1 totals ─────────────────────────────────────────────────────────
  const part1Totals = () => {
    let totalQ = 0;
    let totalP = 0;
    cognitiveLevels.filter((cl) => cl.id).forEach((cl) => {
      const n = Number(form.details[cl.id]?.numberOfQuestions || 0);
      const p = Number(form.details[cl.id]?.pointsPerQuestion || 0);
      totalQ += n;
      totalP += n * p;
    });
    return { totalQ, totalP: totalP.toFixed(2) };
  };

  const { totalQ, totalP } = part1Totals();

  // ─── Part 2: lesson total per cognitive level ──────────────────────────────
  const lessonTotalByCL = (clId) =>
    form.selectedLessonIds.reduce(
      (s, lid) => s + Number(form.lessonDetails[lid]?.[clId] || 0),
      0
    );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="matrix-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><LayoutGrid size={24} /> Quản lý ma trận đề thi</h1>
          <p className="subtitle">Tạo và quản lý các ma trận phân bố câu hỏi</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tạo ma trận mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters glass">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Tìm theo tên ma trận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterGrade} onChange={(e) => {
            setFilterGrade(e.target.value);
            setFilterSubject(""); // Reset subject when grade changes
          }}>
            <option value="">Tất cả khối</option>
            {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Khối {g}</option>)}
          </select>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
            <option value="">Tất cả môn</option>
            {filterSubjectsByGrade(subjects, filterGrade).map((s) => (
              <option key={s.id} value={s.id}>{s.subjectName || s.description || s.name}</option>
            ))}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tất cả loại đề</option>
            {examTypes.filter((t) => t.requiresMatrix).map((t) => (
              <option key={t.id} value={t.id}>{t.typeName}</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={loadAll}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="matrix-list glass">
        {loading ? (
          <div className="empty-state"><RefreshCw className="spin" size={28} /><p>Đang tải...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <LayoutGrid size={48} />
            <h3>Chưa có ma trận nào</h3>
            <p>Bắt đầu bằng cách tạo ma trận đầu tiên</p>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Tạo ma trận</button>
          </div>
        ) : (
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Tên ma trận</th>
                <th>Loại đề</th>
                <th>Môn / Khối</th>
                <th>Số câu</th>
                <th>Tổng điểm</th>
                <th>Mặc định</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <>
                  <tr key={t.id}>
                    <td className="template-name">
                      <button
                        className="expand-btn"
                        onClick={() =>
                          setExpandedRows((r) => ({ ...r, [t.id]: !r[t.id] }))
                        }
                      >
                        {expandedRows[t.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {t.templateName}
                    </td>
                    <td>{t.examTypeName}</td>
                    <td>{t.subjectCode} / Khối {t.gradeLevel}</td>
                    <td className="center">{t.totalQuestions}</td>
                    <td className="center">{t.totalPoints}</td>
                    <td className="center">
                      {t.isDefault ? <span className="badge-default">Mặc định</span> : "—"}
                    </td>
                    <td>{fmtDate(t.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Xem chi tiết" onClick={() => handleView(t)}><Eye size={15} /></button>
                        <button className="btn-icon" title="Chỉnh sửa" onClick={() => openEdit(t)}><Edit size={15} /></button>
                        <button className="btn-icon danger" title="Xóa" onClick={() => setDeleteTarget(t)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[t.id] && (
                    <tr key={`${t.id}-expand`} className="expand-row">
                      <td colSpan={8}>
                        <div className="expand-content">
                          <strong>Phân bố theo mức độ:</strong>
                          <div className="level-pills">
                            {(t.details || []).map((d) => (
                              <span key={d.id} className="level-pill">
                                {d.cognitiveLevelName}: {d.numberOfQuestions} câu × {d.pointsPerQuestion}đ
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Form Modal (Create / Edit) ─────────────────────────────────────── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><LayoutGrid size={18} /> {editTemplate ? "Chỉnh sửa ma trận" : "Tạo ma trận mới"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Basic info */}
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                <div className="row3">
                  <div className="field">
                    <label>Tên ma trận *</label>
                    <input
                      value={form.templateName}
                      onChange={(e) => setForm((f) => ({ ...f, templateName: e.target.value }))}
                      placeholder="VD: Ma trận Toán 10 - 1 tiết"
                    />
                  </div>
                  <div className="field">
                    <label>Loại đề *</label>
                    <select
                      value={form.examTypeId}
                      onChange={(e) => setForm((f) => ({ ...f, examTypeId: e.target.value }))}
                    >
                      <option value="">-- Chọn loại đề --</option>
                      {examTypes
                        .filter((t) => t.requiresMatrix)
                        .map((t) => (
                          <option key={t.id} value={t.id}>{t.typeName}</option>
                        ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Khối lớp *</label>
                    <select
                      value={form.gradeLevel}
                      onChange={(e) => {
                        const newGrade = Number(e.target.value);
                        setForm((f) => ({ ...f, gradeLevel: newGrade, subjectId: "" }));
                      }}
                    >
                      {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Khối {g}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Môn học *</label>
                    <select
                      value={form.subjectId}
                      onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                    >
                      <option value="">-- Chọn môn --</option>
                      {filterSubjectsByGrade(subjects, form.gradeLevel).map((s) => (
                        <option key={s.id} value={s.id}>{s.subjectName || s.description || s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field" style={{ marginTop: "0.75rem" }}>
                  <label>Mô tả</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn về ma trận này..."
                  />
                </div>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  />
                  Đặt làm ma trận mặc định
                </label>
              </div>

              {/* Part 1 */}
              <div className="form-section">
                <h3>Phần 1: Phân bố câu hỏi theo mức độ nhận thức</h3>
                <table className="matrix-input-table">
                  <thead>
                    <tr>
                      <th>Mức độ</th>
                      <th>Số câu</th>
                      <th>Điểm/câu</th>
                      <th>Tổng điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cognitiveLevels.filter((cl) => cl.id).map((cl) => {
                      const rawN = form.details[cl.id]?.numberOfQuestions;
                      const n = rawN === undefined ? "" : rawN;
                      const p = Number(form.details[cl.id]?.pointsPerQuestion || 0);
                      return (
                        <tr key={cl.id}>
                          <td className="level-name">{cl.level || cl.name}</td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              value={n}
                              onChange={(e) => setDetail(cl.id, "numberOfQuestions", e.target.value)}
                              className="num-input"
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={Number(p.toFixed(2))}
                              onChange={(e) => setDetail(cl.id, "pointsPerQuestion", e.target.value)}
                              className="num-input muted"
                              readOnly
                              disabled
                              title="Điểm được tự động chia đều cho 10 điểm"
                            />
                          </td>
                          <td className="total-cell">{(Number(n) * p).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr className="total-row">
                      <td><strong>Tổng</strong></td>
                      <td><strong>{totalQ}</strong></td>
                      <td>—</td>
                      <td><strong>{totalP}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Part 2 */}
              <div className="form-section">
                <h3>Phần 2: Chi tiết phân bố theo Bài học × Mức độ</h3>
                <p className="muted" style={{ marginBottom: "0.75rem" }}>
                  Chọn chương và bài học, rồi nhập số câu cho từng ô trong bảng dưới.
                </p>

                {/* Chapter selector */}
                <div className="row2">
                  <div className="field">
                    <label>Chương</label>
                    <select value={formChapterId} onChange={(e) => setFormChapterId(e.target.value)}>
                      <option value="">-- Chọn chương --</option>
                      {chapters.map((c) => (
                        <option key={c.id} value={c.id}>Chương {c.chapterNumber}: {c.chapterName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lesson checkboxes */}
                {formLessons.length > 0 && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ fontWeight: 600, fontSize: "0.85rem" }}>Chọn bài học:</label>
                    <div className="lesson-checks">
                      {formLessons.map((l) => (
                        <label key={l.id} className={`lesson-check-pill ${form.selectedLessonIds.includes(String(l.id)) ? "on" : ""}`}>
                          <input
                            type="checkbox"
                            checked={form.selectedLessonIds.includes(String(l.id))}
                            onChange={() => toggleLesson(l.id)}
                          />
                          Bài {l.lessonNumber}: {l.lessonName}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Part 2 grid table */}
                {form.selectedLessonIds.length > 0 && cognitiveLevels.filter((cl) => cl.id).length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table className="matrix-input-table part2-table">
                      <thead>
                        <tr>
                          <th>Bài học</th>
                          {cognitiveLevels.filter((cl) => cl.id).map((cl) => {
                            const target = Number(form.details[cl.id]?.numberOfQuestions || 0);
                            const current = lessonTotalByCL(cl.id);
                            const isOver = current > target;
                            const isExact = current === target && target > 0;
                            
                            let colorStyle = {};
                            if (isOver) colorStyle = { color: "#dc3545" }; // red
                            else if (isExact) colorStyle = { color: "#28a745" }; // green

                            return (
                              <th key={cl.id} style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <div>{cl.level || cl.name}</div>
                                <div style={{ fontSize: "0.85em", marginTop: "4px", fontWeight: "normal", ...colorStyle }}>
                                  (Đã chia: {current}/{target}) {isExact && "✅"}
                                </div>
                              </th>
                            );
                          })}
                          <th>Tổng</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.selectedLessonIds.map((lid) => {
                          const lessonObj = loadedLessonsMap[lid] || formLessons.find((l) => String(l.id) === lid);
                          const rowTotal = cognitiveLevels
                            .filter((cl) => cl.id)
                            .reduce((s, cl) => s + Number(form.lessonDetails[lid]?.[cl.id] || 0), 0);
                          return (
                            <tr key={lid}>
                              <td className="level-name">
                                {lessonObj
                                  ? `Bài ${lessonObj.lessonNumber}: ${lessonObj.lessonName}`
                                  : `Bài ${lid}`}
                              </td>
                              {cognitiveLevels.filter((cl) => cl.id).map((cl) => {
                                const target = Number(form.details[cl.id]?.numberOfQuestions || 0);
                                const current = lessonTotalByCL(cl.id);
                                const isOver = current > target;
                                const rawVal = form.lessonDetails[lid]?.[cl.id];
                                const val = rawVal === undefined ? "" : rawVal;
                                
                                return (
                                  <td key={cl.id}>
                                    <input
                                      type="number"
                                      min={0}
                                      value={val}
                                      onChange={(e) => setLessonDetail(lid, cl.id, e.target.value)}
                                      className="num-input"
                                      placeholder="0"
                                      style={isOver ? { borderColor: "#dc3545", color: "#dc3545", outlineColor: "#dc3545", backgroundColor: "#fff5f5" } : {}}
                                    />
                                  </td>
                                );
                              })}
                              <td className="total-cell"><strong>{rowTotal}</strong></td>
                              <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <button
                                  className="btn-icon danger"
                                  onClick={() => toggleLesson(lid)}
                                  title="Gỡ bỏ bài học này khỏi ma trận"
                                  type="button"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {/* Totals per column */}
                        <tr className="total-row">
                          <td><strong>Tổng</strong></td>
                          {cognitiveLevels.filter((cl) => cl.id).map((cl) => (
                            <td key={cl.id}><strong>{lessonTotalByCL(cl.id)}</strong></td>
                          ))}
                          <td className="total-cell">
                            <strong>
                              {cognitiveLevels.filter((cl) => cl.id).reduce((s, cl) => s + lessonTotalByCL(cl.id), 0)}
                            </strong>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowForm(false)} disabled={saving}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><RefreshCw size={15} className="spin" /> Đang lưu...</> : <><Check size={15} /> Lưu ma trận</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Modal ─────────────────────────────────────────────────────── */}
      {viewTemplate && (
        <div className="modal-overlay" onClick={() => setViewTemplate(null)}>
          <div className="modal view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Eye size={18} /> {viewTemplate.templateName}</h2>
              <button className="close-btn" onClick={() => setViewTemplate(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Loại đề</label><span>{viewTemplate.examTypeName}</span></div>
                <div className="detail-item"><label>Môn học</label><span>{viewTemplate.subjectName}</span></div>
                <div className="detail-item"><label>Khối</label><span>Khối {viewTemplate.gradeLevel}</span></div>
                <div className="detail-item"><label>Tổng số câu</label><span>{viewTemplate.totalQuestions}</span></div>
                <div className="detail-item"><label>Tổng điểm</label><span>{viewTemplate.totalPoints}</span></div>
                <div className="detail-item"><label>Mặc định</label><span>{viewTemplate.isDefault ? "✓ Có" : "Không"}</span></div>
                {viewTemplate.description && (
                  <div className="detail-item full"><label>Mô tả</label><span>{viewTemplate.description}</span></div>
                )}
              </div>

              {/* Part 1 */}
              <h3 style={{ marginTop: "1.25rem" }}>Phần 1: Phân bố theo mức độ</h3>
              <table className="matrix-input-table">
                <thead>
                  <tr><th>Mức độ</th><th>Số câu</th><th>Điểm/câu</th><th>Tổng điểm</th></tr>
                </thead>
                <tbody>
                  {(viewTemplate.details || []).map((d) => (
                    <tr key={d.id}>
                      <td>{d.cognitiveLevelName}</td>
                      <td className="center">{d.numberOfQuestions}</td>
                      <td className="center">{d.pointsPerQuestion}</td>
                      <td className="center">{Number(d.totalPoints || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Part 2 */}
              {viewTemplate.lessonDetails?.length > 0 && (() => {
                // Group lessonDetails by lesson
                const byLesson = {};
                const clSet = new Map();
                viewTemplate.lessonDetails.forEach((ld) => {
                  if (!byLesson[ld.lessonId]) byLesson[ld.lessonId] = { lessonName: ld.lessonName, lessonContent: ld.lessonContent, cols: {} };
                  byLesson[ld.lessonId].cols[ld.cognitiveLevelId] = ld.numberOfQuestions;
                  clSet.set(ld.cognitiveLevelId, ld.cognitiveLevelName);
                });
                const clKeys = [...clSet.keys()];
                return (
                  <>
                    <h3 style={{ marginTop: "1.25rem" }}>Phần 2: Chi tiết theo Bài học × Mức độ</h3>
                    <div style={{ overflowX: "auto" }}>
                      <table className="matrix-input-table part2-table">
                        <thead>
                          <tr>
                            <th>Bài học</th>
                            <th>Nội dung chính</th>
                            {clKeys.map((clId) => <th key={clId}>{clSet.get(clId)}</th>)}
                            <th>Tổng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(byLesson).map(([lid, row]) => {
                            const rowTotal = clKeys.reduce((s, clId) => s + Number(row.cols[clId] || 0), 0);
                            return (
                              <tr key={lid}>
                                <td>{row.lessonName || `Bài ${lid}`}</td>
                                <td className="muted-cell">{row.lessonContent || "—"}</td>
                                {clKeys.map((clId) => <td key={clId} className="center">{row.cols[clId] ?? 0}</td>)}
                                <td className="center"><strong>{rowTotal}</strong></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewTemplate(null)}>Đóng</button>
              <button className="btn btn-primary" onClick={() => { setViewTemplate(null); openEdit(viewTemplate); }}>
                <Edit size={15} /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "2rem", textAlign: "center" }}>
              <Trash2 size={48} color="#ef4444" />
              <h3 style={{ margin: "1rem 0 0.5rem" }}>Xác nhận xóa</h3>
              <p style={{ color: "var(--color-text-secondary)" }}>
                Bạn có chắc muốn xóa ma trận <strong>"{deleteTarget.templateName}"</strong>?
                <br />Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .matrix-page { max-width: 1400px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { display: flex; align-items: center; gap: 10px; margin: 0 0 0.25rem; }
        .subtitle { color: var(--color-text-secondary); margin: 0; font-size: 0.9rem; }

        .filters { padding: 1rem; border-radius: 16px; margin-bottom: 1.25rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
        .search-box { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.6); padding: 0.6rem 1rem; border-radius: 10px; }
        .search-box input { border: none; background: none; flex: 1; outline: none; }
        .filter-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .filter-group select { padding: 0.6rem 0.9rem; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8); }

        .matrix-list { padding: 1.25rem; border-radius: 16px; }
        .matrix-table { width: 100%; border-collapse: collapse; }
        .matrix-table th { text-align: left; padding: 0.75rem 1rem; border-bottom: 2px solid rgba(0,0,0,0.08); font-size: 0.82rem; color: var(--color-text-secondary); font-weight: 700; text-transform: uppercase; }
        .matrix-table td { padding: 0.7rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .matrix-table tr:hover td { background: rgba(99,102,241,0.03); }
        .template-name { font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .expand-btn { background: none; border: none; cursor: pointer; color: var(--color-text-secondary); padding: 2px; display: flex; align-items: center; }
        .center { text-align: center; }
        .badge-default { padding: 3px 10px; border-radius: 999px; background: rgba(99,102,241,0.1); color: #6366f1; font-size: 0.75rem; font-weight: 700; }

        .expand-row td { background: rgba(99,102,241,0.03); padding: 0.5rem 1rem 0.75rem 2.5rem; }
        .expand-content { font-size: 0.9rem; }
        .level-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .level-pill { padding: 4px 12px; border-radius: 999px; background: rgba(99,102,241,0.1); color: #6366f1; font-size: 0.8rem; font-weight: 600; }

        .action-buttons { display: flex; gap: 4px; }
        .btn-icon { width: 30px; height: 30px; border-radius: 8px; border: none; background: rgba(0,0,0,0.04); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .btn-icon:hover { background: rgba(99,102,241,0.12); color: var(--color-accent-1); }
        .btn-icon.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

        .empty-state { padding: 3rem; text-align: center; color: var(--color-text-secondary); }
        .empty-state h3 { margin: 0.75rem 0 0.25rem; }
        .empty-state p { margin: 0 0 1.25rem; }

        /* Modals */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal { background: white; border-radius: 16px; width: 100%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.2); }
        .form-modal { max-width: 820px; }
        .view-modal { max-width: 800px; }
        .confirm-modal { max-width: 440px; }
        .modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .modal-header h2 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 1.1rem; }
        .close-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(0,0,0,0.05); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 1rem 1.25rem; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0; }

        /* Form */
        .form-section { margin-bottom: 1.75rem; }
        .form-section h3 { font-size: 0.95rem; font-weight: 700; color: #4338ca; margin: 0 0 1rem; background: rgba(99,102,241,0.05); padding: 0.5rem 0.75rem; border-radius: 8px; border-left: 3px solid #6366f1; }
        .row3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field label { font-size: 0.82rem; font-weight: 600; color: var(--color-text-secondary); }
        .field input, .field select, .field textarea { padding: 0.55rem 0.75rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.8); font-size: 0.9rem; }
        .field textarea { resize: vertical; }
        .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; margin-top: 0.5rem; }

        /* Part1 table */
        .matrix-input-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .matrix-input-table th { padding: 0.6rem 0.75rem; background: rgba(99,102,241,0.06); text-align: left; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); }
        .matrix-input-table td { padding: 0.55rem 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .level-name { font-weight: 600; }
        .num-input { width: 70px; padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); text-align: center; }
        .total-cell { font-weight: 700; color: #6366f1; }
        .total-row { background: rgba(99,102,241,0.04); }
        .part2-table th, .part2-table td { text-align: center; }
        .part2-table th:first-child, .part2-table td:first-child, .part2-table th:nth-child(2), .part2-table td:nth-child(2) { text-align: left; }
        .muted-cell { color: var(--color-text-secondary); font-size: 0.85rem; }

        /* Lesson picks */
        .lesson-checks { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
        .lesson-check-pill { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.1); cursor: pointer; font-size: 0.85rem; transition: all 0.15s; background: rgba(255,255,255,0.8); }
        .lesson-check-pill.on { background: rgba(99,102,241,0.1); border-color: #6366f1; color: #4338ca; font-weight: 600; }
        .lesson-check-pill input { display: none; }

        /* Detail view */
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .detail-item { display: flex; flex-direction: column; gap: 3px; }
        .detail-item.full { grid-column: span 3; }
        .detail-item label { font-size: 0.75rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; }

        .btn-danger { background: #ef4444; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn-danger:hover { background: #dc2626; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr 1fr; }
          .detail-item.full { grid-column: span 2; }
          .row3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};

export default MatrixManagement;
