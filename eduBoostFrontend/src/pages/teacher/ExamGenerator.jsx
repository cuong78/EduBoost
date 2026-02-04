import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Layers, FileText, Eye, Sparkles, Download } from 'lucide-react';
import { knowledgeService } from '../../services/knowledgeService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

const GRADE_OPTIONS = [10, 11, 12];

const EXAM_TYPES = [
  { value: '15MIN', label: "Kiểm tra 15 phút" },
  { value: '45MIN', label: "Kiểm tra 1 tiết" },
  { value: 'SEMESTER', label: "Kiểm tra học kì" },
];

const COGNITIVE_LEVELS = [
  { id: 'nb', name: 'Nhận biết' },
  { id: 'th', name: 'Thông hiểu' },
  { id: 'vd', name: 'Vận dụng' },
  { id: 'vdc', name: 'Vận dụng cao' },
];

const ExamGenerator = () => {
    const [step, setStep] = useState(1);

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [examType, setExamType] = useState('15MIN');

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
    if (!subjectId) return showErrorToast('Vui lòng chọn môn học');
    if (!chapterId) return showErrorToast('Vui lòng chọn chương');
    if (selectedLessonIds.length === 0) return showErrorToast('Vui lòng chọn ít nhất 1 bài học');
    setStep(2);
  };

  const generatePreview = () => {
    if (Number(totalQuestions) <= 0) return showErrorToast('Tổng số câu phải > 0');
    if (stats.sumLesson !== Number(totalQuestions)) {
      return showErrorToast('Phân bổ theo bài học phải bằng tổng số câu');
    }
    if (stats.sumLevel !== Number(totalQuestions)) {
      return showErrorToast('Phân bổ theo mức độ phải bằng tổng số câu');
    }

    // Stub preview: show placeholders. Real implementation will call /api/exams/{id}/auto-select etc.
    const byLessonQueue = [];
    selectedLessonIds.forEach((lid) => {
      const count = Number(lessonDistribution[lid] || 0);
      for (let i = 0; i < count; i++) byLessonQueue.push(lid);
    });

    const levelQueue = [];
    Object.entries(levelDistribution).forEach(([k, v]) => {
      for (let i = 0; i < Number(v || 0); i++) levelQueue.push(k);
    });

    const getLessonName = (lid) => {
      const l = lessons.find((x) => String(x.id) === String(lid));
      return l ? `Bài ${l.lessonNumber}: ${l.lessonName}` : `Lesson ${lid}`;
    };

    const getLevelName = (id) => COGNITIVE_LEVELS.find((x) => x.id === id)?.name ?? id;

    const qs = Array.from({ length: Number(totalQuestions) }, (_, idx) => {
      const lid = byLessonQueue[idx];
      const lv = levelQueue[idx];
      return {
        id: idx + 1,
        lessonId: lid,
        lessonName: getLessonName(lid),
        level: lv,
        levelName: getLevelName(lv),
        source: idx % 3 === 0 ? 'AI' : 'BANK',
        text: `Câu ${idx + 1}: (preview) Nội dung câu hỏi sẽ được chọn từ ngân hàng/AI theo cấu hình.`,
      };
    });

    setPreviewQuestions(qs);
    setStep(3);
  };

  const handleSaveDraft = () => {
    showSuccessToast('Đã lưu draft đề thi (tạm thời)');
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
                {EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
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
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Quay lại</button>
            <button className="btn btn-primary" onClick={generatePreview}>
              <Eye size={16} /> Xem preview
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
              <p className="muted">{previewQuestions.length} câu • Loại: {examType}</p>
                                    </div>
                                    <div className="actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Chỉnh cấu hình</button>
              <button className="btn btn-primary" onClick={handleSaveDraft}><Sparkles size={16} /> Lưu draft</button>
              <button className="btn btn-outline" onClick={() => showSuccessToast('Export sẽ bật khi backend sẵn sàng')}>
                <Download size={16} /> Export
              </button>
                                    </div>
                                </div>

          <div className="q-list">
            {previewQuestions.map((q) => (
              <div key={q.id} className="q-item">
                <div className="q-top">
                  <span className="q-num">Câu {q.id}</span>
                                                <span className={`badge ${q.level}`}>{q.levelName}</span>
                  <span className={`badge ${q.source === 'AI' ? 'ai' : 'bank'}`}>{q.source}</span>
                </div>
                <div className="q-meta muted">{q.lessonName}</div>
                <div className="q-text">{q.text}</div>
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
        .q-top { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; }
        .q-num { font-weight: 800; }
        .q-meta { font-size: 0.9rem; margin-bottom: 8px; }
        .q-text { font-size: 0.98rem; }

        .badge { padding: 4px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; }
        .badge.nb { background: #dcfce7; color: #16a34a; }
        .badge.th { background: #dbeafe; color: #2563eb; }
        .badge.vd { background: #ffedd5; color: #ea580c; }
        .badge.vdc { background: #fee2e2; color: #dc2626; }
        .badge.ai { background: rgba(99,102,241,0.12); color: var(--color-accent-1); }
        .badge.bank { background: rgba(17,24,39,0.1); color: #111827; }
            `}</style>
    </div>
    );
};

export default ExamGenerator;
