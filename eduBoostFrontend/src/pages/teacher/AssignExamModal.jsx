import { useState, useEffect } from 'react';
import {
    X, Calendar, Clock, Users, Key, CheckCircle, Copy, Printer, ChevronDown, ChevronUp, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import examAssignmentService from '../../services/examAssignmentService';
import examService from '../../services/examService';

/**
 * AssignExamModal — lets teacher assign an exam (and its variants) to classes
 * Props:
 *   exam          — current Exam object (parent or variant)
 *   variants      — list of variant exams (if any)
 *   onClose       — callback to close modal
 */
const AssignExamModal = ({ exam, variants = [], onClose }) => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Assignment form state
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [notifyParent, setNotifyParent] = useState(true);

    // Selected class → exam mapping: { [classId]: examId }
    const [classVariantMap, setClassVariantMap] = useState({});

    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null); // access codes after creation
    const [error, setError] = useState('');

    useEffect(() => {
        examAssignmentService.getTeacherClasses()
            .then(data => {
                // Filter classes matching exam's grade level
                const filtered = exam?.gradeLevel
                    ? data.filter(c => c.gradeLevel === exam.gradeLevel)
                    : data;
                setClasses(filtered);
            })
            .catch(() => setClasses([]))
            .finally(() => setLoading(false));
    }, [exam]);

    const toggleClass = (classId) => {
        setClassVariantMap(prev => {
            const next = { ...prev };
            if (next[classId] !== undefined) {
                delete next[classId];
            } else {
                // Default: assign base exam
                next[classId] = exam.id;
            }
            return next;
        });
    };

    const setVariantForClass = (classId, examId) => {
        setClassVariantMap(prev => ({ ...prev, [classId]: Number(examId) }));
    };

    const selectedClassIds = Object.keys(classVariantMap);

    const handleSubmit = async () => {
        if (selectedClassIds.length === 0) { setError('Vui lòng chọn ít nhất 1 lớp'); return; }
        if (!startTime || !endTime) { setError('Vui lòng chọn thời gian bắt đầu và kết thúc'); return; }
        if (new Date(endTime) <= new Date(startTime)) { setError('Giờ kết thúc phải sau giờ bắt đầu'); return; }
        setError('');
        setSubmitting(true);
        try {
            const hasVariants = variants.length > 0;
            const payload = {
                examId: exam.id,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                durationMinutes: durationMinutes ? Number(durationMinutes) : null,
                notifyParent,
            };

            if (hasVariants) {
                payload.classVariantMap = classVariantMap;
            } else {
                payload.classIds = selectedClassIds;
            }

            const data = await examAssignmentService.createAssignment(payload);
            setResults(data);
        } catch (e) {
            setError(e?.response?.data?.message || 'Giao đề thất bại, thử lại');
        } finally {
            setSubmitting(false);
        }
    };

    const copyCode = (code) => navigator.clipboard.writeText(code);

    const printCodes = () => window.print();

    // ── Render ──────────────────────────────────────────────────────────────

    if (results) {
        return (
            <div className="assign-overlay" onClick={onClose}>
                <div className="assign-modal" onClick={e => e.stopPropagation()}>
                    <div className="assign-header">
                        <div>
                            <h2>✅ Giao đề thành công!</h2>
                            <p className="muted">Đây là mã vào thi cho từng lớp. Đọc cho học sinh trong phòng thi.</p>
                        </div>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="codes-table" id="printable-codes">
                        <table>
                            <thead>
                                <tr>
                                    <th>Lớp</th>
                                    <th>Mã Đề</th>
                                    <th>Mã Vào Thi</th>
                                    <th>Giờ Thi</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(r => (
                                    <tr key={r.assignmentId}>
                                        <td><strong>{r.className}</strong></td>
                                        <td><span className="exam-code-badge">{r.examCode}</span></td>
                                        <td>
                                            <span className="access-code">{r.accessCode}</span>
                                        </td>
                                        <td style={{ fontSize: '0.82rem', color: 'var(--ds-text-secondary)' }}>
                                            {new Date(r.startTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                                            &nbsp;→&nbsp;
                                            {new Date(r.endTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td>
                                            <button className="btn-copy" onClick={() => copyCode(r.accessCode)} title="Copy mã">
                                                <Copy size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="assign-footer">
                        <button className="btn btn-outline" onClick={printCodes}>
                            <Printer size={16} /> In bảng mã
                        </button>
                        {results.length === 1 && (
                            <button
                                className="btn btn-outline"
                                style={{ borderColor: '#6366f1', color: '#6366f1' }}
                                onClick={() => {
                                    navigate(`/teacher/exam-monitor/${results[0].assignmentId}`);
                                    onClose();
                                }}
                            >
                                <Activity size={16} /> Giám sát realtime
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={onClose}>
                            <CheckCircle size={16} /> Xong
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="assign-overlay" onClick={onClose}>
            <div className="assign-modal" onClick={e => e.stopPropagation()}>
                <div className="assign-header">
                    <div>
                        <h2>📋 Giao đề thi</h2>
                        <p className="muted">{exam?.examTitle} — {exam?.examCode}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Time */}
                <div className="assign-section">
                    <h4><Calendar size={15} /> Thời gian thi</h4>
                    <div className="time-row">
                        <div className="field">
                            <label>Bắt đầu</label>
                            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="field">
                            <label>Kết thúc</label>
                            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                        <div className="field">
                            <label>Thời gian làm (phút)</label>
                            <input type="number" min="5" max="180" placeholder="Mặc định theo loại đề"
                                value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Classes */}
                <div className="assign-section">
                    <h4><Users size={15} /> Chọn lớp giao đề {exam?.gradeLevel && `(Khối ${exam.gradeLevel})`}</h4>
                    {loading ? (
                        <p className="muted">Đang tải danh sách lớp...</p>
                    ) : classes.length === 0 ? (
                        <p className="muted">Không có lớp nào phù hợp khối {exam?.gradeLevel}</p>
                    ) : (
                        <div className="class-list">
                            {classes.map(cls => {
                                const selected = classVariantMap[cls.classId] !== undefined;
                                return (
                                    <div key={cls.classId} className={`class-row ${selected ? 'selected' : ''}`}>
                                        <label className="class-check">
                                            <input type="checkbox" checked={selected} onChange={() => toggleClass(cls.classId)} />
                                            <span className="class-name">{cls.className}</span>
                                            <span className="class-code muted">{cls.classCode}</span>
                                        </label>
                                        {/* Variant selector if variants exist */}
                                        {selected && variants.length > 0 && (
                                            <select
                                                className="variant-select"
                                                value={classVariantMap[cls.classId]}
                                                onChange={e => setVariantForClass(cls.classId, e.target.value)}
                                            >
                                                <option value={exam.id}>Đề gốc ({exam.examCode})</option>
                                                {variants.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        Đề trộn #{v.variantNumber} ({v.examCode})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        {selectedClassIds.length} lớp được chọn
                        {variants.length > 0 && ' — bạn có thể gán đề trộn khác nhau cho mỗi lớp'}
                    </p>
                </div>

                {/* Options */}
                <div className="assign-section">
                    <label className="toggle-label">
                        <input type="checkbox" checked={notifyParent} onChange={e => setNotifyParent(e.target.checked)} />
                        Thông báo điểm cho phụ huynh sau khi thi xong
                    </label>
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="assign-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Đang giao...' : <><Key size={16} /> Giao đề & Tạo mã</>}
                    </button>
                </div>
            </div>

            <style>{`
                .assign-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
                    z-index: 1000; display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                }
                .assign-modal {
                    background: white; border-radius: 20px; width: 100%; max-width: 680px;
                    max-height: 90vh; overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
                    padding: 2rem;
                }
                .assign-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
                .assign-header h2 { margin: 0 0 0.25rem; font-size: 1.4rem; }
                .close-btn { background: none; border: none; cursor: pointer; color: var(--ds-text-muted); padding: 4px; }
                .assign-section { margin-bottom: 1.5rem; }
                .assign-section h4 { display: flex; align-items: center; gap: 6px; margin: 0 0 0.75rem; font-size: 0.95rem; }
                .time-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
                @media (max-width: 600px) { .time-row { grid-template-columns: 1fr; } }
                .field label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 4px; color: var(--ds-text-secondary); }
                .field input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--ds-border); border-radius: 8px; font-size: 0.9rem; }
                .class-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 280px; overflow-y: auto; border: 1px solid var(--ds-border); border-radius: 10px; padding: 0.75rem; }
                .class-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 8px; transition: background 0.15s; }
                .class-row.selected { background: rgba(99,102,241,0.06); }
                .class-check { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex: 1; }
                .class-name { font-weight: 600; font-size: 0.92rem; }
                .class-code { font-size: 0.8rem; }
                .variant-select { padding: 0.3rem 0.5rem; border: 1px solid var(--ds-border); border-radius: 6px; font-size: 0.82rem; font-family: inherit; }
                .toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; }
                .error-text { color: var(--ds-error); font-size: 0.88rem; margin-bottom: 1rem; }
                .assign-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--ds-border); }
                /* Results table */
                .codes-table { margin: 1rem 0; overflow-x: auto; }
                .codes-table table { width: 100%; border-collapse: collapse; }
                .codes-table th { text-align: left; padding: 0.6rem 0.75rem; font-size: 0.8rem; color: var(--ds-text-secondary); border-bottom: 2px solid var(--ds-border); }
                .codes-table td { padding: 0.75rem; border-bottom: 1px solid var(--ds-border); font-size: 0.9rem; }
                .exam-code-badge { background: rgba(99,102,241,0.1); color: var(--color-accent-1); padding: 2px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
                .access-code { font-family: monospace; font-size: 1.2rem; font-weight: 800; letter-spacing: 3px; color: #1a1a2e; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
                .btn-copy { background: none; border: 1px solid var(--ds-border); border-radius: 6px; padding: 4px 8px; cursor: pointer; color: var(--ds-text-muted); }
                .btn-copy:hover { background: var(--ds-bg-subtle); color: var(--color-accent-1); }
                @media print {
                    .assign-header, .assign-footer, .btn-copy, .close-btn { display: none !important; }
                    .assign-overlay { position: static; background: none; }
                    .assign-modal { box-shadow: none; }
                }
            `}</style>
        </div>
    );
};

export default AssignExamModal;
