import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Plus, Search, Eye, Trash2, Copy, Download,
  FileText, BarChart2, RefreshCw,
  ChevronLeft, ChevronRight, X, CheckCircle,
  Clock, Globe, PenTool, AlertTriangle, BookOpen,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { examService } from "../../services/examService";
import { knowledgeService } from "../../services/knowledgeService";
import { showErrorToast, showSuccessToast } from "../../utils/show-toast";
import { exportHtmlToPdf } from "../../utils/pdfExport";
import MathRenderer from "../../components/common/MathRenderer";
import "./ExamManagement.css";

/* ─────────────────────────── constants ─────────────────────────── */
const EXAM_STATUS = {
  DRAFT:     { label: "Nháp",       color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)", icon: <Clock     size={13}/> },
  USED:      { label: "Đã dùng",    color: "var(--ds-warning)", bg: "var(--ds-warning-bg)", icon: <CheckCircle size={13}/> },
  PUBLISHED: { label: "Đã xuất bản",color: "var(--ds-info)", bg: "#dbeafe", icon: <Globe    size={13}/> },
};
const GRADE_OPTIONS = [6,7,8,9,10,11,12];

const StatusBadge = ({ status }) => {
  const cfg = EXAM_STATUS[status] || EXAM_STATUS.DRAFT;
  return (
    <span className="em-badge" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon}&nbsp;{cfg.label}
    </span>
  );
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
const fmtPoints = (n) => n != null ? Number(n).toFixed(1) : "—";

/* ═══════════════════════════════════════════════════════════════ */
const ExamManagement = () => {
  const navigate = useNavigate();

  /* list state */
  const [exams,       setExams]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [totalPages,  setTotalPages]  = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  /* filter - mine */
  const [subjects,      setSubjects]      = useState([]);
  const [examTypes,     setExamTypes]     = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterGrade,   setFilterGrade]   = useState("");
  const [filterType,    setFilterType]    = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [searchTerm,    setSearchTerm]    = useState("");

  /* tabs */
  const [activeTab, setActiveTab] = useState("mine");

  /* community */
  const [communityExams,   setCommunityExams]   = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [cfSubject,  setCfSubject]  = useState("");
  const [cfGrade,    setCfGrade]    = useState("");
  const [cfType,     setCfType]     = useState("");
  const [cfSearch,   setCfSearch]   = useState("");

  /* modals */
  const [selectedExam,      setSelectedExam]     = useState(null);
  const [detailExam,        setDetailExam]       = useState(null);
  const [loadingDetail,     setLoadingDetail]    = useState(false);
  const [showDetail,        setShowDetail]       = useState(false);
  const [showStats,         setShowStats]        = useState(false);
  const [examStats,         setExamStats]        = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExam,      setDeletingExam]     = useState(null);
  const [commDetail,        setCommDetail]       = useState(null);
  const [commDetailLoading, setCommDetailLoading] = useState(false);
  const [showCommDetail,    setShowCommDetail]   = useState(false);

  /* action */
  const [actionLoading, setActionLoading] = useState({});
  const [exportMenuId,  setExportMenuId]  = useState(null);
  const exportRef = useRef(null);
  
  /* pdf export */
  const [exportingExam, setExportingExam] = useState(null);
  const [exportFormat,   setExportFormat]   = useState(null);
  const exportContainerRef = useRef(null);

  /* close export dropdown on outside click */
  useEffect(() => {
    const h = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportMenuId(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* initial */
  useEffect(() => {
    knowledgeService.getSubjects().then(d => setSubjects(Array.isArray(d) ? d : d?.data ?? [])).catch(() => {});
    examService.getExamTypes().then(d => setExamTypes(Array.isArray(d) ? d : d?.data ?? [])).catch(() => {});
  }, []);

  /* load my exams */
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage, size: 12,
        ...(filterSubject && { subjectId: filterSubject }),
        ...(filterGrade   && { gradeLevel: filterGrade }),
        ...(filterType    && { examTypeId: filterType }),
        ...(filterStatus  && { status: filterStatus }),
      };
      const res = await examService.getExams(params);
      setExams(res.content ?? res ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      showErrorToast("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterSubject, filterGrade, filterType, filterStatus]);

  useEffect(() => { loadExams(); }, [loadExams]);

  /* load community (published by all) */
  const loadCommunityExams = useCallback(async () => {
    setCommunityLoading(true);
    try {
      const params = {
        ...(cfSubject && { subjectId: cfSubject }),
        ...(cfGrade   && { gradeLevel: cfGrade }),
        ...(cfType    && { examTypeId: cfType }),
      };
      const data = await examService.getPublishedExams(params);
      setCommunityExams(Array.isArray(data) ? data : data?.content ?? []);
    } catch {
      showErrorToast("Không thể tải đề thi cộng đồng");
    } finally {
      setCommunityLoading(false);
    }
  }, [cfSubject, cfGrade, cfType]);

  useEffect(() => {
    if (activeTab === "community") loadCommunityExams();
  }, [activeTab, loadCommunityExams]);

  const resetAndFilter = (setter, val) => { setter(val); setCurrentPage(0); };

  const filtered = useMemo(() => {
    if (!searchTerm) return exams;
    const t = searchTerm.toLowerCase();
    return exams.filter(e => e.examTitle?.toLowerCase().includes(t) || e.examCode?.toLowerCase().includes(t));
  }, [exams, searchTerm]);

  /* ════════ ACTIONS ════════ */
  const setActionFor = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  const openDetail = async (exam) => {
    setSelectedExam(exam);
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      setDetailExam(await examService.getExamById(exam.id));
    } catch {
      showErrorToast("Không thể tải chi tiết"); setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openStats = async (exam) => {
    setSelectedExam(exam);
    try {
      setExamStats(await examService.getExamStatistics(exam.id));
      setShowStats(true);
    } catch {
      showErrorToast("Không thể tải thống kê");
    }
  };

  const openCommDetail = async (exam) => {
    setShowCommDetail(true);
    setCommDetailLoading(true);
    try {
      setCommDetail(await examService.getExamById(exam.id));
    } catch {
      showErrorToast("Không thể tải chi tiết"); setShowCommDetail(false);
    } finally {
      setCommDetailLoading(false);
    }
  };



  const handlePublish = async (exam) => {
    setActionFor(exam.id, "publish");
    try {
      await examService.changeExamStatus(exam.id, { newStatus: "PUBLISHED" });
      showSuccessToast("Đã xuất bản — giáo viên khác có thể xem");
      loadExams();
    } catch (e) { showErrorToast(e?.response?.data?.message || "Không thể xuất bản"); }
    finally { setActionFor(exam.id, null); }
  };

  const handleUnpublish = async (exam) => {
    setActionFor(exam.id, "unpublish");
    try {
      await examService.changeExamStatus(exam.id, { newStatus: "USED" });
      showSuccessToast("Đã ngừng xuất bản — đề thi chuyển sang trạng thái Đã dùng");
      loadExams();
    } catch (e) { showErrorToast(e?.response?.data?.message || "Không thể ngừng xuất bản"); }
    finally { setActionFor(exam.id, null); }
  };

  const confirmDelete = async () => {
    if (!deletingExam) return;
    setActionFor(deletingExam.id, "delete");
    try {
      await examService.deleteExam(deletingExam.id);
      showSuccessToast("Đã xóa đề thi");
      setShowDeleteConfirm(false); setDeletingExam(null);
      loadExams();
    } catch (e) { showErrorToast(e?.response?.data?.message || "Không thể xóa"); }
    finally { setActionFor(deletingExam?.id, null); }
  };

  const handleExport = async (exam, format) => {
    setExportMenuId(null);
    setActionFor(exam.id, "export");
    try {
      const fullExam = await examService.getExamById(exam.id);
      setExportFormat(format);
      setExportingExam(fullExam);
      
      setTimeout(async () => {
        try {
          if (window.MathJax) await window.MathJax.typesetPromise();
          const filename = format === "answer-key" ? `${fullExam.examCode}-dap-an.pdf` : `${fullExam.examCode}.pdf`;
          await exportHtmlToPdf(exportContainerRef.current, filename);
          if (exam.status === "DRAFT") {
            await examService.changeExamStatus(fullExam.id, { newStatus: "USED" });
            loadExams();
          }
          showSuccessToast("Đã xuất PDF");
        } catch (e) {
          showErrorToast("Xuất PDF thất bại");
        } finally {
          setExportingExam(null);
          setActionFor(exam.id, null);
        }
      }, 500);
    } catch (e) { 
      showErrorToast(e?.response?.data?.message || "Lỗi tải chi tiết đề thi"); 
      setActionFor(exam.id, null);
    }
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="em-page">

      {/* Header */}
      <div className="em-header">
        <div>
          <h1 className="em-title"><FileText size={22}/> Quản lý đề thi</h1>
          <p className="em-sub">Xem, chỉnh sửa, xuất bản và xuất đề thi của bạn</p>
        </div>
        <button className="em-btn em-btn-primary" onClick={() => navigate("/teacher/create-exam")} data-tour="em-create-btn">
          <Plus size={16}/> Tạo đề mới
        </button>
      </div>

      {/* Tabs */}
      <div className="em-tabs" data-tour="em-tabs">
        <button className={`em-tab ${activeTab === "mine" ? "em-tab--active" : ""}`} onClick={() => setActiveTab("mine")}>
          <FileText size={15}/> Đề của tôi
        </button>
        <button className={`em-tab ${activeTab === "community" ? "em-tab--active" : ""}`} onClick={() => setActiveTab("community")}>
          <Globe size={15}/> Cộng đồng <span className="em-tab-hint">Đề đã xuất bản</span>
        </button>
      </div>

      {/* ══════════ COMMUNITY TAB ══════════ */}
      {activeTab === "community" && (
        <div>
          <div className="em-filters">
            <div className="em-search">
              <Search size={16}/>
              <input placeholder="Tìm đề thi cộng đồng..." value={cfSearch} onChange={e => setCfSearch(e.target.value)}/>
            </div>
            <div className="em-filter-row">
              <select value={cfSubject} onChange={e => setCfSubject(e.target.value)}>
                <option value="">Tất cả môn</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectCode} — {s.subjectName || s.name}</option>)}
              </select>
              <select value={cfGrade} onChange={e => setCfGrade(e.target.value)}>
                <option value="">Tất cả khối</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>Khối {g}</option>)}
              </select>
              <select value={cfType} onChange={e => setCfType(e.target.value)}>
                <option value="">Loại đề</option>
                {examTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
              </select>
              <button className="em-btn em-btn-ghost" onClick={loadCommunityExams}><RefreshCw size={15}/></button>
            </div>
          </div>

          <div className="em-card">
            {communityLoading ? (
              <div className="em-loading"><RefreshCw className="spin" size={22}/><span>Đang tải...</span></div>
            ) : (() => {
              const list = communityExams.filter(e => {
                if (!cfSearch) return true;
                const t = cfSearch.toLowerCase();
                return e.examTitle?.toLowerCase().includes(t) || e.examCode?.toLowerCase().includes(t);
              });
              if (list.length === 0) return (
                <div className="em-empty">
                  <Globe size={48} opacity={0.25}/>
                  <h3>Chưa có đề thi cộng đồng</h3>
                  <p>Khi giáo viên xuất bản đề thi, chúng sẽ xuất hiện tại đây</p>
                </div>
              );
              return (
                <div className="em-community-grid">
                  {list.map(exam => (
                    <div key={exam.id} className="em-comm-card">
                      <div className="em-comm-card-top">
                        <div className="em-comm-code">{exam.examCode}</div>
                        <StatusBadge status={exam.status}/>
                      </div>
                      <h3 className="em-comm-title">{exam.examTitle}</h3>
                      <p className="em-comm-meta">{exam.subjectName || exam.subjectCode} / Khối {exam.gradeLevel} &bull; {exam.examTypeName}</p>
                      <p className="em-comm-meta"><strong>GV:</strong> {exam.createdByName || "—"} &bull; {exam.totalQuestions} câu &bull; {fmtPoints(exam.totalPoints)} đ</p>
                      {exam.matrixTemplateName && (
                        <div className="em-comm-matrix"><LayoutGrid size={12}/> {exam.matrixTemplateName}</div>
                      )}
                      <div className="em-comm-actions">
                        <button className="em-btn em-btn-secondary" style={{ flex: 1 }} onClick={() => navigate(`/teacher/create-exam?examId=${exam.id}&mode=view`)}>
                          <Eye size={14}/> Xem đề
                        </button>
                      </div>
                      <div className="em-comm-date">Xuất bản: {fmtDate(exam.publishedAt || exam.createdAt)}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══════════ MINE TAB ══════════ */}
      {activeTab === "mine" && (
        <div>
          <div className="em-filters" data-tour="em-filters">
            <div className="em-search">
              <Search size={16}/>
              <input placeholder="Tìm theo tên / mã đề..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>
            <div className="em-filter-row">
              <select value={filterSubject} onChange={e => resetAndFilter(setFilterSubject, e.target.value)}>
                <option value="">Tất cả môn</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectCode} — {s.subjectName || s.name}</option>)}
              </select>
              <select value={filterGrade} onChange={e => resetAndFilter(setFilterGrade, e.target.value)}>
                <option value="">Tất cả khối</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>Khối {g}</option>)}
              </select>
              <select value={filterType} onChange={e => resetAndFilter(setFilterType, e.target.value)}>
                <option value="">Loại đề</option>
                {examTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
              </select>
              <select value={filterStatus} onChange={e => resetAndFilter(setFilterStatus, e.target.value)}>
                <option value="">Trạng thái</option>
                {Object.entries(EXAM_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="em-btn em-btn-ghost" onClick={loadExams}><RefreshCw size={15}/></button>
            </div>
          </div>

          <div className="em-card">
            {loading ? (
              <div className="em-loading"><RefreshCw className="spin" size={22}/><span>Đang tải...</span></div>
            ) : filtered.length === 0 ? (
              <div className="em-empty">
                <BookOpen size={48} opacity={0.3}/>
                <h3>Chưa có đề thi nào</h3>
                <p>Tạo đề thi đầu tiên để bắt đầu</p>
                <button className="em-btn em-btn-primary" onClick={() => navigate("/teacher/create-exam")}>
                  <Plus size={15}/> Tạo đề mới
                </button>
              </div>
            ) : (
              <table className="em-table" data-tour="em-table">
                <thead>
                  <tr>
                    <th>Mã đề</th><th>Tên đề thi</th><th>Môn / Khối</th>
                    <th>Loại</th><th className="center">Câu</th><th className="center">Điểm</th>
                    <th>Trạng thái</th><th>Ngày tạo</th><th className="center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(exam => {
                    const busy = !!actionLoading[exam.id];
                    return (
                      <tr key={exam.id} className={busy ? "em-row-busy" : ""}>
                        <td className="em-code">{exam.examCode}</td>
                        <td className="em-name">
                          <span>{exam.examTitle}</span>
                          {exam.matrixTemplateName && <span className="em-matrix-chip"> {exam.matrixTemplateName}</span>}
                          {exam.variantCount > 0 && <span style={{ marginLeft: 6, padding: "2px 8px", borderRadius: 999, background: "rgba(59,130,246,0.1)", color: "var(--ds-info)", fontSize: "0.75rem", fontWeight: 700 }}>{exam.variantCount} đề trộn</span>}
                        </td>
                        <td>{exam.subjectCode} / Khối {exam.gradeLevel}</td>
                        <td>{exam.examTypeName || exam.examTypeCode}</td>
                        <td className="center">{exam.totalQuestions}</td>
                        <td className="center">{fmtPoints(exam.totalPoints)}</td>
                        <td><StatusBadge status={exam.status}/></td>
                        <td className="em-date">{fmtDate(exam.createdAt)}</td>
                        <td>
                          <div className="em-actions">
                            <button className="em-icon-btn" title="Xem đề" onClick={() => navigate(`/teacher/create-exam?examId=${exam.id}&mode=view`)}><Eye size={15}/></button>
                            <button className="em-icon-btn" title="Thống kê" onClick={() => openStats(exam)}><BarChart2 size={15}/></button>
                            <div className="em-export-wrapper" ref={exportMenuId === exam.id ? exportRef : null}>
                              <button className="em-icon-btn" title="Xuất PDF" disabled={busy}
                                onClick={() => setExportMenuId(exportMenuId === exam.id ? null : exam.id)}>
                                <Download size={15}/>
                              </button>
                              {exportMenuId === exam.id && (
                                <div className="em-export-menu">
                                  <button onClick={() => handleExport(exam, "pdf")}>
                                    <Download size={14} color="var(--ds-primary)"/>
                                    <span><strong>Đề thi</strong><small>Không kèm đáp án</small></span>
                                  </button>
                                  <button onClick={() => handleExport(exam, "answer-key")}>
                                    <FileText size={14} color="var(--ds-success)"/>
                                    <span><strong>Đáp án &amp; đề</strong><small>Kèm đáp án đúng</small></span>
                                  </button>
                                </div>
                              )}
                            </div>
                            {(exam.status === "DRAFT" || exam.status === "USED") && (
                              <button className="em-icon-btn em-icon-btn--publish" title="Xuất bản" disabled={busy} onClick={() => handlePublish(exam)}>
                                <Globe size={15}/>
                              </button>
                            )}
                            {exam.status === "PUBLISHED" && (
                              <button className="em-icon-btn" title="Ngừng xuất bản" disabled={busy} onClick={() => handleUnpublish(exam)}>
                                <Clock size={15}/>
                              </button>
                            )}

                            {(exam.status === "DRAFT" || exam.status === "USED") && (
                              <button className="em-icon-btn em-icon-btn--danger" title="Xóa" disabled={busy}
                                onClick={() => { setDeletingExam(exam); setShowDeleteConfirm(true); }}>
                                <Trash2 size={15}/>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && totalPages > 1 && (
              <div className="em-pagination">
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></button>
                <span>Trang {currentPage + 1} / {totalPages}</span>
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        </div>
      )}



      {/* ════════ STATISTICS MODAL ════════ */}
      {showStats && examStats && (
        <div className="em-overlay" onClick={() => setShowStats(false)}>
          <div className="em-modal" onClick={e => e.stopPropagation()}>
            <div className="em-modal-header">
              <div>
                <h2> Thống kê — {selectedExam?.examTitle}</h2>
                <p className="em-modal-meta">{selectedExam?.examCode}</p>
              </div>
              <button className="em-close" onClick={() => setShowStats(false)}><X size={20}/></button>
            </div>
            <div className="em-modal-body">
              <div className="em-stats-grid">
                {[["Tổng số câu", examStats.totalQuestions],["Từ ngân hàng", examStats.fromQuestionBank],
                  ["AI sinh", examStats.aiGenerated],["Đã chỉnh sửa", examStats.teacherEdited]].map(([label, val]) => (
                  <div key={label} className="em-stat-card">
                    <span className="em-stat-val">{val ?? 0}</span>
                    <span className="em-stat-label">{label}</span>
                  </div>
                ))}
              </div>
              {examStats.byCognitiveLevel?.length > 0 && (
                <>
                  <h3 className="em-section-title">Phân bố theo mức độ nhận thức</h3>
                  <div className="em-bar-chart">
                    {examStats.byCognitiveLevel.map(row => {
                      const pct = examStats.totalQuestions > 0 ? Math.round((row.count / examStats.totalQuestions) * 100) : 0;
                      return (
                        <div key={row.cognitiveLevelName} className="em-bar-row">
                          <span className="em-bar-label">{row.cognitiveLevelName}</span>
                          <div className="em-bar-track"><div className="em-bar-fill" style={{ width: `${pct}%` }}/></div>
                          <span className="em-bar-count">{row.count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {examStats.byLesson?.length > 0 && (
                <>
                  <h3 className="em-section-title">Phân bố theo bài học</h3>
                  <div className="em-lesson-table">
                    <table>
                      <thead><tr><th>Bài học</th><th className="center">Số câu</th></tr></thead>
                      <tbody>{examStats.byLesson.map(row => <tr key={row.lessonName}><td>{row.lessonName}</td><td className="center">{row.count}</td></tr>)}</tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ DELETE CONFIRM ════════ */}
      {showDeleteConfirm && (
        <div className="em-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="em-confirm" onClick={e => e.stopPropagation()}>
            <AlertTriangle size={40} color="var(--ds-error)"/>
            <h3>Xác nhận xóa đề thi?</h3>
            <p><strong>{deletingExam?.examTitle}</strong> ({deletingExam?.examCode})</p>
            <p className="em-warn">Hành động này không thể hoàn tác.</p>
            <div className="em-confirm-actions">
              <button className="em-btn em-btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Hủy</button>
              <button className="em-btn em-btn-danger" onClick={confirmDelete}>Xóa đề thi</button>
            </div>
          </div>
        </div>
      )}


      {/* ════════ HIDDEN PDF EXPORT CONTAINER ════════ */}
      {exportingExam && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <style>{`
            .pdf-only-header { display: none; }
            .pdf-exporting .pdf-only-header { display: block !important; margin-bottom: 20px;}
            .pdf-exporting.q-list { gap: 12px !important; padding: 20px !important; color: black !important; font-family: "Times New Roman", Times, serif; background: white; width: 800px; }
            .pdf-exporting .q-item { border: none !important; box-shadow: none !important; background: white !important; padding: 0 !important; margin-bottom: 15px !important; page-break-inside: avoid; }
            .pdf-exporting .q-num { font-weight: bold !important; font-size: 16px !important; color: black !important; }
            .pdf-exporting .q-text { font-size: 16px !important; color: black !important; margin-bottom: 8px !important; }
            .pdf-exporting .exam-answers { margin-top: 0 !important; gap: 4px !important; display: flex; flex-direction: column; }
            .pdf-exporting .exam-option { display: flex; gap: 8px; font-size: 15px !important; color: black !important; padding: 2px 0; }
            .pdf-exporting .option-label { font-weight: bold !important; }
            .pdf-exporting .exam-option.correct-marked { font-weight: bold !important; }
            .pdf-exporting .exam-option.correct-marked .option-label,
            .pdf-exporting .exam-option.correct-marked .option-content * { color: var(--ds-warning-text) !important; font-weight: bold !important; text-decoration: underline !important; }
            .pdf-exporting .option-content {
              min-width: 0 !important;
              word-break: break-word !important;
              overflow-wrap: break-word !important;
            }
          `}</style>
          
          <div ref={exportContainerRef} className="q-list" style={{ backgroundColor: 'white' }}>
            {/* Header only for PDF Export */}
            <div className="pdf-only-header">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "black" }}>
                <div style={{ textAlign: "center", fontWeight: "normal", fontSize: "16px" }}>
                  TRƯỜNG: ...........................................<br/>
                  HỌ TÊN: ...........................................<br/>
                  LỚP: ...........................................
                </div>
                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
                  MÃ ĐỀ: {exportingExam.examCode || "........."}
                </div>
              </div>
              <h2 style={{ textAlign: "center", marginBottom: "8px", color: "black", width: "100%", justifyContent: "center", textTransform: "uppercase" }}>
                {exportingExam.examTitle || "ĐỀ KIỂM TRA"}
              </h2>
              <div style={{ textAlign: "center", fontSize: "18px", marginBottom: "5px", color: "black", fontWeight: "bold" }}>
                MÔN: {exportingExam.subjectName?.toUpperCase()}
              </div>
              <div style={{ textAlign: "center", fontSize: "16px", marginBottom: "20px", color: "black", fontStyle: "italic" }}>
                Thời gian làm bài: {exportingExam.examTypeCode === "15MIN" ? "15" : exportingExam.examTypeCode === "45MIN" ? "45" : exportingExam.examTypeCode === "MIDTERM" ? "60" : exportingExam.examTypeCode === "FINAL" ? "90" : "..."} phút (không kể thời gian phát đề)
              </div>
              <hr style={{ borderTop: "2px solid #000", marginBottom: "20px" }} />
            </div>

            {exportingExam.questions?.map((q, idx) => (
              <div key={q.id} className="q-item">
                <div className="q-top" style={{ marginBottom: "2px" }}>
                  <span className="q-num">Câu {q.orderNumber || idx + 1}: </span>
                </div>
                <div className="q-text"><MathRenderer content={q.questionText || ""} /></div>
                
                <div className="exam-answers">
                  {["A", "B", "C", "D"].map((lbl, aIdx) => {
                    const ans = [q.correctAnswer, q.wrongAnswer1, q.wrongAnswer2, q.wrongAnswer3][aIdx];
                    if (!ans) return null;
                    const isCorrect = aIdx === 0 && exportFormat === "answer-key";
                    return (
                      <div key={lbl} className={`exam-option ${isCorrect ? "correct-marked" : ""}`}>
                        <span className="option-label">{lbl}.</span>
                        <span className="option-content"><MathRenderer content={ans} /></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
