import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Layers, FileText, Eye, Sparkles, Download, Pencil, RefreshCw, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { knowledgeService } from '../../services/knowledgeService';
import { examService } from '../../services/examService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import RichTextEditor from '../../components/common/RichTextEditor';
import MathRenderer from '../../components/common/MathRenderer';
import { jsPDF } from 'jspdf';

const GRADE_OPTIONS = [10, 11, 12];

const DEFAULT_EXAM_TYPES = [
  { value: '15MIN', label: "Kiểm tra 15 phút" },
  { value: '45MIN', label: "Kiểm tra 1 tiết" },
  { value: 'MIDTERM', label: "Kiểm tra giữa kỳ" },
  { value: 'FINAL', label: "Kiểm tra cuối kỳ" },
];

const COGNITIVE_LEVELS = [
  { id: 'nb', name: 'Nhận biết' },
  { id: 'th', name: 'Thông hiểu' },
  { id: 'vd', name: 'Vận dụng' },
  { id: 'vdc', name: 'Vận dụng cao' },
];

const durationMinutesByTypeCode = (typeCode) => {
  if (typeCode === '15MIN') return 15;
  if (typeCode === '45MIN') return 45;
  if (typeCode === 'MIDTERM') return 60;
  if (typeCode === 'FINAL') return 90;
  return 45;
};

// Deterministic shuffle for answers based on seed
const shuffleAnswers = (correct, wrong1, wrong2, wrong3, seed) => {
  const answers = [correct, wrong1, wrong2, wrong3].filter(Boolean);
  // Simple deterministic shuffle based on seed
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 7) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const ExamGenerator = () => {
    const [step, setStep] = useState(1);

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [examType, setExamType] = useState('15MIN');
  const [examTypes, setExamTypes] = useState([]);
  const [examTitle, setExamTitle] = useState('');

  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  // Config
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1);
  const [lessonDistribution, setLessonDistribution] = useState({}); // { [lessonId]: count }
  const [levelDistribution, setLevelDistribution] = useState({ nb: 4, th: 4, vd: 2, vdc: 0 });

  // Preview
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true); // Toggle hiển thị đáp án đúng
  const [editForm, setEditForm] = useState({
    modifiedQuestionText: '',
    modifiedCorrectAnswer: '',
    modifiedExplanation: '',
    wrongAnswer1: '',
    wrongAnswer2: '',
    wrongAnswer3: '',
  });

    const stats = useMemo(() => {
    const byLesson = selectedLessonIds.reduce((acc, lid) => {
      acc[lid] = Number(lessonDistribution[lid] || 0);
            return acc;
        }, {});
    const sumLesson = Object.values(byLesson).reduce((s, n) => s + Number(n), 0);

    const sumLevel = Object.values(levelDistribution).reduce((s, n) => s + Number(n), 0);

    return { byLesson, sumLesson, sumLevel };
  }, [selectedLessonIds, lessonDistribution, levelDistribution]);

  const loadSubjects = async () => {
    const data = await knowledgeService.getSubjects();
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setSubjects(list);
    if (!subjectId && list.length) setSubjectId(String(list[0].id));
  };

  const loadExamTypes = async () => {
    try {
      const data = await examService.getExamTypes();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setExamTypes(list);
    } catch {
      setExamTypes([]);
    }
  };

  const getSelectedExamTypeId = () => {
    const found = examTypes.find((t) => String(t.typeCode) === String(examType));
    return found?.id ?? null;
  };

  const refreshExam = async (examId) => {
    const exam = await examService.getExamById(examId);
    setCurrentExam(exam);
    const qs = Array.isArray(exam?.questions) ? [...exam.questions] : [];
    qs.sort((a, b) => Number(a.orderNumber || 0) - Number(b.orderNumber || 0));
    setPreviewQuestions(qs);
  };

  const loadChapters = async () => {
    if (!subjectId) return;
    const data = await knowledgeService.getChaptersBySubject(subjectId, gradeLevel);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setChapters(list);
    setChapterId(list.length ? String(list[0].id) : '');
  };

  const loadLessons = async () => {
    if (!chapterId) return;
    const data = await knowledgeService.getLessonsByChapter(chapterId);
    const list = Array.isArray(data) ? data : data?.data ?? [];
    setLessons(list);
    const firstIds = list.slice(0, 2).map((l) => String(l.id));
    setSelectedLessonIds(firstIds);
    const dist = {};
    firstIds.forEach((id) => (dist[id] = Math.max(1, Math.floor(totalQuestions / Math.max(1, firstIds.length)))));
    setLessonDistribution(dist);
  };

  useEffect(() => {
    loadSubjects().catch(() => setSubjects([]));
    loadExamTypes().catch(() => setExamTypes([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadChapters().catch(() => setChapters([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, gradeLevel]);

  useEffect(() => {
    loadLessons().catch(() => setLessons([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const toggleLesson = (lessonId) => {
    setSelectedLessonIds((prev) => {
      const id = String(lessonId);
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      // sync distribution keys
      setLessonDistribution((d) => {
        const copy = { ...d };
        Object.keys(copy).forEach((k) => {
          if (!next.includes(k)) delete copy[k];
        });
        next.forEach((k) => {
          if (copy[k] == null) copy[k] = 0;
        });
        return copy;
      });
      return next;
    });
  };

  const goStep2 = () => {
    if (!examTitle.trim()) return showErrorToast('Vui lòng nhập tên đề thi');
    if (!subjectId) return showErrorToast('Vui lòng chọn môn học');
    if (!chapterId) return showErrorToast('Vui lòng chọn chương');
    if (selectedLessonIds.length === 0) return showErrorToast('Vui lòng chọn ít nhất 1 bài học');
    setStep(2);
  };

  const generatePreview = async () => {
    if (Number(totalQuestions) <= 0) return showErrorToast('Tổng số câu phải > 0');
    if (stats.sumLesson !== Number(totalQuestions)) {
      return showErrorToast('Phân bổ theo bài học phải bằng tổng số câu');
    }

    const examTypeId = getSelectedExamTypeId();
    if (!examTypeId) {
      return showErrorToast('Không tìm thấy Exam Type tương ứng. Vui lòng kiểm tra dữ liệu /api/exam-types');
    }

    const lessonDistList = selectedLessonIds
      .map((lid) => ({ lessonId: Number(lid), numberOfQuestions: Number(lessonDistribution[lid] || 0) }))
      .filter((x) => x.numberOfQuestions > 0);

    const payload = {
      examTitle: examTitle.trim(),
      examTypeId,
      subjectId: Number(subjectId),
      gradeLevel: Number(gradeLevel),
      chapterId: chapterId ? Number(chapterId) : null,
      durationMinutes: durationMinutesByTypeCode(examType),
      lessonIds: selectedLessonIds.map((x) => Number(x)),
      config: {
        totalQuestions: Number(totalQuestions),
        pointsPerQuestion: Number(pointsPerQuestion),
        lessonDistribution: lessonDistList,
      },
    };

    setLoadingPreview(true);
    try {
      const created = await examService.createExam(payload);
      setCurrentExam(created);
      
      // Build cognitive level distribution by code
      // levelDistribution has format: { nb: 4, th: 4, vd: 2, vdc: 0 }
      // Backend will resolve codes to cognitive level IDs
      
      const autoSelectConfig = {
        lessonDistribution: lessonDistList,
        cognitiveLevelDistributionByCode: levelDistribution, // { nb: 4, th: 4, vd: 2, vdc: 0 }
        useAiGeneration: true
      };
      
      await examService.autoSelectQuestionsWithConfig(created.id, autoSelectConfig);
      await refreshExam(created.id);
      setStep(3);
    } catch (e) {
      console.error(e);
      showErrorToast('Không thể tạo/preview đề thi. Vui lòng kiểm tra backend API.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSaveDraft = () => {
    if (!currentExam?.id) return showErrorToast('Chưa có đề thi để lưu');
    showSuccessToast('Đã tạo & lưu draft đề thi');
    };

  const handleExport = async () => {
    if (!currentExam?.id) return showErrorToast('Chưa có đề thi để export');
    if (!currentExam?.questions?.length) return showErrorToast('Đề thi chưa có câu hỏi');
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;
      
      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(currentExam.examTitle || 'ĐỀ KIỂM TRA', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Mã đề: ${currentExam.examCode || ''}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(`Môn: ${currentExam.subjectName || ''} - Lớp ${currentExam.gradeLevel || ''}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(`Thời gian: ${currentExam.durationMinutes || 45} phút`, pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      // Questions
      doc.setFontSize(11);
      const questions = currentExam.questions || [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionNum = i + 1;
        
        // Check page break
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        // Question text - strip HTML and LaTeX for PDF
        const cleanText = (q.questionText || '').replace(/<[^>]*>/g, '').replace(/\$[^$]*\$/g, '[formula]');
        doc.setFont(undefined, 'bold');
        const questionLines = doc.splitTextToSize(`Câu ${questionNum}: ${cleanText}`, pageWidth - margin * 2);
        doc.text(questionLines, margin, y);
        y += questionLines.length * 5 + 3;
        
        // Answers
        doc.setFont(undefined, 'normal');
        const answers = shuffleAnswers(q.correctAnswer, q.wrongAnswer1, q.wrongAnswer2, q.wrongAnswer3, questionNum);
        const labels = ['A', 'B', 'C', 'D'];
        
        answers.forEach((ans, idx) => {
          if (ans) {
            const cleanAns = (ans || '').replace(/<[^>]*>/g, '').replace(/\$[^$]*\$/g, '[formula]');
            const ansLines = doc.splitTextToSize(`${labels[idx]}. ${cleanAns}`, pageWidth - margin * 2 - 10);
            doc.text(ansLines, margin + 5, y);
            y += ansLines.length * 5 + 2;
          }
        });
        
        y += 5;
      }
      
      // Save
      doc.save(`${currentExam.examCode || `exam_${currentExam.id}`}.pdf`);
      showSuccessToast('Đã tải xuống đề thi');
    } catch (e) {
      console.error(e);
      showErrorToast('Không thể export đề thi');
    }
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      modifiedQuestionText: q.questionText || '',
      modifiedCorrectAnswer: q.correctAnswer || '',
      modifiedExplanation: q.explanation || '',
      wrongAnswer1: q.wrongAnswer1 || '',
      wrongAnswer2: q.wrongAnswer2 || '',
      wrongAnswer3: q.wrongAnswer3 || '',
    });
  };

  const saveEdit = async () => {
    if (!currentExam?.id || !editingId) return;
    try {
      await examService.editExamQuestion(currentExam.id, editingId, editForm);
      setEditingId(null);
      await refreshExam(currentExam.id);
      showSuccessToast('Đã cập nhật câu hỏi');
    } catch (e) {
      console.error(e);
      showErrorToast('Không thể cập nhật câu hỏi');
    }
  };

  const handleRegenerateWrong = async (qid) => {
    if (!currentExam?.id) return;
    try {
      await examService.regenerateWrongAnswers(currentExam.id, qid);
      await refreshExam(currentExam.id);
      showSuccessToast('Đã yêu cầu sinh lại đáp án sai');
    } catch (e) {
      console.error(e);
      showErrorToast('Không thể sinh lại đáp án sai');
    }
  };

  const handleDeleteQuestion = async (qid) => {
    if (!currentExam?.id) return;
    try {
      await examService.deleteExamQuestion(currentExam.id, qid);
      await refreshExam(currentExam.id);
      showSuccessToast('Đã xóa câu hỏi khỏi đề');
    } catch (e) {
      console.error(e);
      showErrorToast('Không thể xóa câu hỏi');
    }
  };

  const moveQuestion = async (index, dir) => {
    if (!currentExam?.id) return;
    const next = [...previewQuestions];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    const reOrdered = next.map((q, idx) => ({ ...q, orderNumber: idx + 1 }));
    setPreviewQuestions(reOrdered);
    try {
      await examService.reorderQuestions(currentExam.id, {
        questionOrders: reOrdered.map((q, idx) => ({
          examQuestionId: q.id,
          newOrderNumber: idx + 1,
        })),
      });
      await refreshExam(currentExam.id);
    } catch (e) {
      console.error(e);
      showErrorToast('Không thể sắp xếp lại thứ tự');
    }
  };

    return (
    <div className="create-exam-page">
      <div className="steps glass">
        <div className={`s ${step >= 1 ? 'active' : ''}`}><div className="n">1</div><span>Phạm vi</span></div>
        <div className="line" />
        <div className={`s ${step >= 2 ? 'active' : ''}`}><div className="n">2</div><span>Cấu hình</span></div>
        <div className="line" />
        <div className={`s ${step >= 3 ? 'active' : ''}`}><div className="n">3</div><span>Preview</span></div>
            </div>

            {step === 1 && (
        <div className="panel glass">
          <h2><Layers size={20} /> Tạo đề thi</h2>

          <div className="row3">
            <div className="field">
              <label>Loại đề</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                {(examTypes.length ? examTypes.map((t) => ({ value: t.typeCode, label: t.typeName })) : DEFAULT_EXAM_TYPES)
                  .map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tên đề thi</label>
              <input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Ví dụ: Kiểm tra 15 phút - Chương 1" />
            </div>
            <div className="field">
              <label>Môn học</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                {subjects.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.subjectCode} {s.description ? `- ${s.description}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Khối</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))}>
                {GRADE_OPTIONS.map((g) => <option key={g} value={g}>Khối {g}</option>)}
              </select>
                            </div>
                        </div>

          <div className="row2">
            <div className="field">
              <label>Chương</label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={!chapters.length}>
                {chapters.map((c) => (
                  <option key={c.id} value={String(c.id)}>Chương {c.chapterNumber}: {c.chapterName}</option>
                ))}
                                                </select>
              {!chapters.length && <small className="muted">Chưa có chương</small>}
                        </div>
                    </div>

          <div className="divider" />
          <h3>Chọn bài học</h3>
          {!lessons.length ? (
            <p className="muted">Chưa có bài học</p>
          ) : (
            <div className="lesson-grid">
              {lessons.map((l) => {
                const id = String(l.id);
                const checked = selectedLessonIds.includes(id);
                                return (
                  <label key={id} className={`lesson-pill ${checked ? 'on' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleLesson(id)} />
                    <span>Bài {l.lessonNumber}: {l.lessonName}</span>
                  </label>
                                );
                            })}
                        </div>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={goStep2}>
              Tiếp tục <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
      )}

      {step === 2 && (
        <div className="panel glass">
          <h2><FileText size={20} /> Cấu hình đề</h2>

          <div className="row3">
            <div className="field">
              <label>Tổng số câu</label>
              <input type="number" min="1" value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Điểm / câu</label>
              <input type="number" min="0.1" step="0.1" value={pointsPerQuestion} onChange={(e) => setPointsPerQuestion(Number(e.target.value))} />
                                    </div>
            <div className="field">
              <label>Tổng điểm (ước tính)</label>
              <input value={(Number(totalQuestions) * Number(pointsPerQuestion)).toFixed(1)} disabled />
                                </div>
                            </div>

          <div className="row2">
            <div className="box">
              <h3>Phân bổ theo bài học</h3>
              {selectedLessonIds.map((lid) => {
                const l = lessons.find((x) => String(x.id) === String(lid));
                const name = l ? `Bài ${l.lessonNumber}: ${l.lessonName}` : `Lesson ${lid}`;
                return (
                  <div key={lid} className="dist-row">
                    <span className="dist-name">{name}</span>
                    <input
                      type="number"
                      min="0"
                      value={lessonDistribution[lid] ?? 0}
                      onChange={(e) => setLessonDistribution((d) => ({ ...d, [lid]: Number(e.target.value) }))}
                      className="dist-input"
                    />
                                    </div>
                );
              })}
              <div className="dist-footer muted">Tổng: {stats.sumLesson}/{totalQuestions}</div>
                                </div>

            <div className="box">
              <h3>Phân bổ theo mức độ</h3>
              {COGNITIVE_LEVELS.map((lv) => (
                <div key={lv.id} className="dist-row">
                  <span className="dist-name">{lv.name}</span>
                                    <input
                    type="number"
                    min="0"
                    value={levelDistribution[lv.id] ?? 0}
                    onChange={(e) => setLevelDistribution((d) => ({ ...d, [lv.id]: Number(e.target.value) }))}
                    className="dist-input"
                  />
                </div>
              ))}
              <div className="dist-footer muted">Tổng: {stats.sumLevel}/{totalQuestions}</div>
                            </div>
                        </div>

          <div className="actions space">
            <button className="btn btn-secondary" onClick={() => setStep(1)} disabled={loadingPreview}>Quay lại</button>
            <button className="btn btn-primary" onClick={generatePreview} disabled={loadingPreview}>
              {loadingPreview ? (
                <>
                  <RefreshCw size={16} className="spin" /> Đang tạo đề thi...
                </>
              ) : (
                <>
                  <Eye size={16} /> Xem preview
                </>
              )}
            </button>
          </div>

          <div className="divider" />
          <p className="muted">
            Khi backend module Exam sẵn sàng, hệ thống sẽ tự ưu tiên chọn câu từ ngân hàng (đã verify), thiếu sẽ gọi AI tạo mới theo cấu hình.
          </p>
                    </div>
      )}

      {step === 3 && (
        <div className="panel glass">
          <div className="header">
            <div>
              <h2>Preview đề thi</h2>
              <p className="muted">{previewQuestions.length} câu • Loại: {examType}{currentExam?.examCode ? ` • Mã: ${currentExam.examCode}` : ''}</p>
                                    </div>
                                    <div className="actions">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showCorrectAnswers} 
                  onChange={(e) => setShowCorrectAnswers(e.target.checked)} 
                />
                Hiển thị đáp án
              </label>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Chỉnh cấu hình</button>
              <button className="btn btn-primary" onClick={handleSaveDraft} disabled={!currentExam?.id}><Sparkles size={16} /> Lưu draft</button>
              <button className="btn btn-outline" onClick={() => { setShowCorrectAnswers(false); handleExport(); }} disabled={!currentExam?.id}>
                <Download size={16} /> Export
              </button>
                                    </div>
                                </div>

          <div className="q-list">
            {loadingPreview ? (
              <div className="muted" style={{ padding: '1rem' }}>
                <RefreshCw className="spin" size={16} /> Đang tạo preview...
              </div>
            ) : previewQuestions.map((q, idx) => (
              <div key={q.id} className="q-item">
                <div className="q-top">
                  <span className="q-num">Câu {q.orderNumber || idx + 1}</span>
                  {q.cognitiveLevelName && <span className="badge bank">{q.cognitiveLevelName}</span>}
                  <span className={`badge ${q.sourceFlag === 'AI_GENERATED' ? 'ai' : 'bank'}`}>
                    {q.sourceFlag === 'AI_GENERATED' ? 'AI' : (q.sourceFlag === 'TEACHER_EDITED' ? 'EDITED' : 'BANK')}
                  </span>

                  <div className="q-actions">
                    <button className="btn btn-outline btn-xs" onClick={() => moveQuestion(idx, -1)} title="Lên"><ArrowUp size={14} /></button>
                    <button className="btn btn-outline btn-xs" onClick={() => moveQuestion(idx, 1)} title="Xuống"><ArrowDown size={14} /></button>
                    <button className="btn btn-outline btn-xs" onClick={() => startEdit(q)} title="Sửa"><Pencil size={14} /></button>
                    <button className="btn btn-outline btn-xs" onClick={() => handleRegenerateWrong(q.id)} title="Sinh lại đáp án sai"><RefreshCw size={14} /></button>
                    <button className="btn btn-outline btn-xs danger" onClick={() => handleDeleteQuestion(q.id)} title="Xóa"><Trash2 size={14} /></button>
                  </div>
                </div>

                {q.lessonName && <div className="q-meta muted">{q.lessonName}</div>}

                {editingId === q.id ? (
                  <div className="edit-box">
                    <label>Nội dung câu hỏi</label>
                    <RichTextEditor 
                      value={editForm.modifiedQuestionText} 
                      onChange={(val) => setEditForm((f) => ({ ...f, modifiedQuestionText: val }))} 
                      placeholder="Nhập nội dung câu hỏi..."
                    />
                    <label>Đáp án đúng</label>
                    <RichTextEditor 
                      value={editForm.modifiedCorrectAnswer} 
                      onChange={(val) => setEditForm((f) => ({ ...f, modifiedCorrectAnswer: val }))} 
                      placeholder="Nhập đáp án đúng..."
                    />
                    <label>Giải thích</label>
                    <RichTextEditor 
                      value={editForm.modifiedExplanation} 
                      onChange={(val) => setEditForm((f) => ({ ...f, modifiedExplanation: val }))} 
                      placeholder="Nhập giải thích..."
                    />
                    <div className="wrong-answers-grid">
                      <div className="field">
                        <label>Đáp án sai 1</label>
                        <RichTextEditor 
                          value={editForm.wrongAnswer1} 
                          onChange={(val) => setEditForm((f) => ({ ...f, wrongAnswer1: val }))} 
                          placeholder="Nhập đáp án sai 1..."
                        />
                      </div>
                      <div className="field">
                        <label>Đáp án sai 2</label>
                        <RichTextEditor 
                          value={editForm.wrongAnswer2} 
                          onChange={(val) => setEditForm((f) => ({ ...f, wrongAnswer2: val }))} 
                          placeholder="Nhập đáp án sai 2..."
                        />
                      </div>
                      <div className="field">
                        <label>Đáp án sai 3</label>
                        <RichTextEditor 
                          value={editForm.wrongAnswer3} 
                          onChange={(val) => setEditForm((f) => ({ ...f, wrongAnswer3: val }))} 
                          placeholder="Nhập đáp án sai 3..."
                        />
                      </div>
                    </div>

                    <div className="actions">
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Hủy</button>
                      <button className="btn btn-primary" onClick={saveEdit}>Lưu</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="q-text"><MathRenderer content={q.questionText} /></div>
                    <div className="exam-answers">
                      {(() => {
                        // Tạo mảng 4 đáp án và shuffle
                        const allAnswers = [
                          { content: q.correctAnswer, isCorrect: true },
                          { content: q.wrongAnswer1, isCorrect: false },
                          { content: q.wrongAnswer2, isCorrect: false },
                          { content: q.wrongAnswer3, isCorrect: false },
                        ].filter(a => a.content); // Lọc bỏ đáp án rỗng
                        
                        // Shuffle dựa trên question id để giữ thứ tự cố định
                        const shuffled = [...allAnswers].sort((a, b) => {
                          const hashA = (q.id + a.content).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                          const hashB = (q.id + b.content).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                          return hashA - hashB;
                        });
                        
                        const labels = ['A', 'B', 'C', 'D'];
                        return shuffled.map((ans, idx) => (
                          <div 
                            key={idx} 
                            className={`exam-option ${showCorrectAnswers && ans.isCorrect ? 'correct-marked' : ''}`}
                          >
                            <span className="option-label">{labels[idx]}.</span>
                            <span className="option-content"><MathRenderer content={ans.content} /></span>
                            {showCorrectAnswers && ans.isCorrect && <span className="correct-icon">✓</span>}
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                )}
                                            </div>
                                                    ))}
                                                </div>
                                            </div>
      )}

            <style>{`
        .create-exam-page { max-width: 1200px; margin: 0 auto; }

        .steps { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 1.25rem; border-radius: 16px; margin-bottom: 1.5rem; }
        .s { display: flex; align-items: center; gap: 10px; opacity: 0.55; font-weight: 700; }
        .s.active { opacity: 1; color: var(--color-accent-1); }
        .n { width: 32px; height: 32px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; }
        .s.active .n { background: var(--color-accent-1); color: white; }
        .line { width: 46px; height: 2px; background: rgba(0,0,0,0.08); }

        .panel { padding: 1.5rem; border-radius: 16px; }
        h2 { margin: 0 0 1rem; display: flex; align-items: center; gap: 8px; }
        h3 { margin: 0 0 0.75rem; }
        .muted { color: var(--color-text-secondary); }
        .divider { height: 1px; background: rgba(0,0,0,0.06); margin: 1.25rem 0; }

        .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 980px) { .row3, .row2 { grid-template-columns: 1fr; } }

        .field { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 6px; font-weight: 700; font-size: 0.9rem; }
        input, select { width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8); }

        .lesson-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
        .lesson-pill { display: flex; gap: 10px; align-items: center; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.06); cursor: pointer; }
        .lesson-pill.on { border-color: rgba(99,102,241,0.35); background: rgba(99,102,241,0.06); }
        .lesson-pill input { width: auto; }

        .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1rem; flex-wrap: wrap; }
        .actions.space { justify-content: space-between; }

        .box { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.45); border: 1px solid rgba(0,0,0,0.06); }
        .dist-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px 0; }
        .dist-name { font-weight: 600; }
        .dist-input { width: 110px; }
        .dist-footer { margin-top: 10px; font-weight: 700; }

        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 1rem; }

        .q-list { display: flex; flex-direction: column; gap: 12px; }
        .q-item { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.06); }
        .q-top { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; justify-content: space-between; }
        .q-num { font-weight: 800; }
        .q-meta { font-size: 0.9rem; margin-bottom: 8px; }
        .q-text { font-size: 0.98rem; }
        .q-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .btn-xs { padding: 6px 8px; border-radius: 10px; }
        .danger { border-color: rgba(239,68,68,0.35); color: #ef4444; }

        .badge { padding: 4px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; }
        .badge.ai { background: rgba(99,102,241,0.12); color: var(--color-accent-1); }
        .badge.bank { background: rgba(17,24,39,0.1); color: #111827; }

        .answers { margin-top: 10px; display: grid; gap: 6px; }
        .a { padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.06); }
        .a.correct { border-color: rgba(16,185,129,0.35); }
        .a.wrong { border-color: rgba(239,68,68,0.2); }
        .explain { margin-top: 10px; }

        /* Exam-style answers A B C D */
        .exam-answers { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
        @media (max-width: 768px) { .exam-answers { grid-template-columns: 1fr; } }
        .exam-option { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.08); transition: all 0.2s; }
        .exam-option.correct-marked { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.4); }
        .option-label { font-weight: 700; color: var(--color-accent-1); min-width: 20px; }
        .option-content { flex: 1; }
        .correct-icon { color: #10b981; font-weight: 700; margin-left: auto; }
        .toggle-label { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer; }
        .toggle-label input { width: auto; cursor: pointer; }

        .edit-box textarea { width: 100%; min-height: 90px; padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8); }
        .edit-box .rich-text-editor .ql-editor { min-height: 80px; }
        .edit-box label { margin-top: 1rem; }
        .edit-box label:first-child { margin-top: 0; }
        .wrong-answers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
        .wrong-answers-grid .rich-text-editor .ql-editor { min-height: 60px; }
        @media (max-width: 980px) { .wrong-answers-grid { grid-template-columns: 1fr; } }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
    </div>
    );
};

export default ExamGenerator;
