import { useState, useEffect, useMemo } from 'react';
import {
    X, Calendar, Clock, Users, Key, CheckCircle, Copy, Printer, Activity, BookOpen, Shuffle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import examAssignmentService from '../../services/examAssignmentService';

/* ── Vietnamese month names for calendar header ── */
const MONTHS_VI = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];
const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/* ── Custom Vietnamese Date-Time Picker ── */
const ViDateTimePicker = ({ value, onChange, label }) => {
    // Parse value (ISO string or datetime-local string) into parts
    const parsed = useMemo(() => {
        if (!value) return { year: '', month: '', day: '', hour: '', minute: '', period: 'SA' };
        const d = new Date(value);
        if (isNaN(d.getTime())) return { year: '', month: '', day: '', hour: '', minute: '', period: 'SA' };
        let h = d.getHours();
        const period = h >= 12 ? 'CH' : 'SA';
        h = h % 12 || 12;
        return {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate(),
            hour: h,
            minute: d.getMinutes(),
            period
        };
    }, [value]);

    const [viewYear, setViewYear] = useState(parsed.year || new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed.month !== '' ? parsed.month : new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState(
        parsed.year ? new Date(parsed.year, parsed.month, parsed.day) : null
    );
    const [hour, setHour] = useState(parsed.hour || 8);
    const [minute, setMinute] = useState(parsed.minute || 0);
    const [period, setPeriod] = useState(parsed.period || 'SA');
    const [showPicker, setShowPicker] = useState(false);

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    }, [viewYear, viewMonth]);

    const emitChange = (date, h, m, p) => {
        if (!date) return;
        let hours24 = h % 12;
        if (p === 'CH') hours24 += 12;
        if (hours24 === 24) hours24 = 12; // 12 CH = 12:00
        if (h === 12 && p === 'SA') hours24 = 0; // 12 SA = 00:00
        const dt = new Date(date);
        dt.setHours(hours24, m, 0, 0);
        // Format as datetime-local value
        const pad = (n) => String(n).padStart(2, '0');
        const val = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        onChange(val);
    };

    const handleDateClick = (day) => {
        const d = new Date(viewYear, viewMonth, day);
        setSelectedDate(d);
        emitChange(d, hour, minute, period);
    };

    const handleTimeChange = (h, m, p) => {
        setHour(h); setMinute(m); setPeriod(p);
        emitChange(selectedDate, h, m, p);
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
    };

    const displayValue = useMemo(() => {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return '';
        const dayOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];
        const pad = (n) => String(n).padStart(2, '0');
        let h = d.getHours();
        const p = h >= 12 ? 'chiều' : 'sáng';
        h = h % 12 || 12;
        return `${dayOfWeek}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${h}:${pad(d.getMinutes())} ${p}`;
    }, [value]);

    return (
        <div className="vi-datetime-picker">
            <label>{label}</label>
            <div className="vi-dt-input" onClick={() => setShowPicker(!showPicker)}>
                <Calendar size={16} />
                <span className={displayValue ? '' : 'placeholder'}>
                    {displayValue || 'Chọn ngày giờ...'}
                </span>
            </div>
            {showPicker && (
                <div className="vi-dt-dropdown">
                    <div className="vi-dt-panels">
                        {/* Calendar */}
                        <div className="vi-calendar">
                            <div className="vi-cal-header">
                                <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}>‹</button>
                                <span>{MONTHS_VI[viewMonth]} {viewYear}</span>
                                <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}>›</button>
                            </div>
                            <div className="vi-cal-weekdays">
                                {WEEKDAYS_VI.map(w => <span key={w}>{w}</span>)}
                            </div>
                            <div className="vi-cal-grid">
                                {calendarDays.map((d, i) => (
                                    <button
                                        key={i}
                                        className={`vi-cal-day ${!d ? 'empty' : ''} ${d && isToday(d) ? 'today' : ''} ${d && isSelected(d) ? 'selected' : ''}`}
                                        onClick={() => d && handleDateClick(d)}
                                        disabled={!d}
                                    >
                                        {d || ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Time */}
                        <div className="vi-time">
                            <div className="vi-time-label">Giờ</div>
                            <div className="vi-time-selectors">
                                <div className="vi-time-col">
                                    <label>Giờ</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={hour}
                                        onChange={e => {
                                            let v = Number(e.target.value);
                                            if (v < 1) v = 1;
                                            if (v > 12) v = 12;
                                            handleTimeChange(v, minute, period);
                                        }}
                                        className="vi-time-input"
                                    />
                                </div>
                                <div className="vi-time-col">
                                    <label>Phút</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={String(minute).padStart(2, '0')}
                                        onChange={e => {
                                            let v = Number(e.target.value);
                                            if (v < 0) v = 0;
                                            if (v > 59) v = 59;
                                            handleTimeChange(hour, v, period);
                                        }}
                                        className="vi-time-input"
                                    />
                                </div>
                                <div className="vi-time-col">
                                    <label>&nbsp;</label>
                                    <div className="vi-period-btns">
                                        <button className={period === 'SA' ? 'active' : ''} onClick={() => handleTimeChange(hour, minute, 'SA')}>Sáng</button>
                                        <button className={period === 'CH' ? 'active' : ''} onClick={() => handleTimeChange(hour, minute, 'CH')}>Chiều</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {selectedDate && (
                    <div className="vi-dt-footer">
                        <button className="vi-dt-done" onClick={() => setShowPicker(false)}>✓ Xong</button>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════ */

const AssignExamModal = ({ exam, variants = [], onClose }) => {
    const navigate = useNavigate();
    const [allClasses, setAllClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [startTime, setStartTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [notifyParent, setNotifyParent] = useState(true);

    // Selected classes (Set of classId)
    const [selectedClasses, setSelectedClasses] = useState(new Set());

    // Selected exam IDs for random distribution (Set of examId)
    const allExams = useMemo(() => {
        const list = [{ id: exam?.id, code: exam?.examCode, label: 'Đề gốc', variantNumber: 0 }];
        variants.forEach(v => list.push({ id: v.id, code: v.examCode, label: `Đề trộn #${v.variantNumber}`, variantNumber: v.variantNumber }));
        return list;
    }, [exam, variants]);
    const [selectedExamIds, setSelectedExamIds] = useState(new Set([exam?.id]));

    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    // Auto-compute endTime
    const endTime = useMemo(() => {
        if (!startTime || !durationMinutes) return '';
        const start = new Date(startTime);
        if (isNaN(start.getTime())) return '';
        // Keep as local datetime string to avoid UTC conversion
        const end = new Date(start.getTime() + Number(durationMinutes) * 60 * 1000);
        const pad = (n) => String(n).padStart(2, '0');
        return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
    }, [startTime, durationMinutes]);

    const formatVN = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '—';
        const dayOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];
        const pad = (n) => String(n).padStart(2, '0');
        let h = d.getHours();
        const p = h >= 12 ? 'chiều' : 'sáng';
        h = h % 12 || 12;
        return `${dayOfWeek}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} lúc ${h}:${pad(d.getMinutes())} ${p}`;
    };

    useEffect(() => {
        examAssignmentService.getTeacherClasses()
            .then(data => setAllClasses(data || []))
            .catch(() => setAllClasses([]))
            .finally(() => setLoading(false));
    }, []);

    // Filter classes matching exam's grade
    const classes = useMemo(() => {
        if (!exam?.gradeLevel) return allClasses;
        const examGrade = String(exam.gradeLevel);
        return allClasses.filter(c => {
            if (c.gradeLevelId != null && String(c.gradeLevelId) === examGrade) return true;
            if (c.gradeLevel) {
                const num = c.gradeLevel.replace(/\D/g, '');
                if (num === examGrade) return true;
            }
            return false;
        });
    }, [allClasses, exam?.gradeLevel]);

    const toggleClass = (classId) => {
        setSelectedClasses(prev => {
            const next = new Set(prev);
            if (next.has(classId)) next.delete(classId); else next.add(classId);
            return next;
        });
    };

    const selectAllClasses = () => {
        if (selectedClasses.size === classes.length) {
            setSelectedClasses(new Set());
        } else {
            setSelectedClasses(new Set(classes.map(c => c.classId)));
        }
    };

    const toggleExamId = (examId) => {
        setSelectedExamIds(prev => {
            const next = new Set(prev);
            if (next.has(examId)) {
                if (next.size > 1) next.delete(examId); // must keep at least 1
            } else {
                next.add(examId);
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        if (selectedClasses.size === 0) { setError('Vui lòng chọn ít nhất 1 lớp'); return; }
        if (!startTime) { setError('Vui lòng chọn thời gian bắt đầu'); return; }
        if (!durationMinutes || Number(durationMinutes) < 1) { setError('Vui lòng nhập thời gian làm bài'); return; }
        setError('');
        setSubmitting(true);
        try {
            const classIds = Array.from(selectedClasses);
            const examIds = Array.from(selectedExamIds);

            // Build classVariantMap: randomly assign each class an exam from selected exams
            // If multiple exams selected, the backend will randomly distribute students
            const payload = {
                examId: exam.id,
                startTime: startTime,   // local datetime string — no UTC conversion
                endTime: endTime,       // already local datetime string
                durationMinutes: Number(durationMinutes),
                notifyParent,
                classIds,
                selectedExamIds: examIds, // backend will randomly distribute
            };

            // If only variants selected (no random distribution needed per-class)
            if (variants.length > 0 && examIds.length > 1) {
                // Map: each class gets an examId picked round-robin 
                const classVariantMap = {};
                classIds.forEach((cid, i) => {
                    classVariantMap[cid] = examIds[i % examIds.length];
                });
                payload.classVariantMap = classVariantMap;
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

    // ── Results view ──
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
                            <thead><tr><th>Lớp</th><th>Mã Đề</th><th>Mã Vào Thi</th><th>Giờ Thi</th><th></th></tr></thead>
                            <tbody>
                                {results.map(r => (
                                    <tr key={r.assignmentId}>
                                        <td><strong>{r.className}</strong></td>
                                        <td><span className="exam-code-badge">{r.examCode}</span></td>
                                        <td><span className="access-code">{r.accessCode}</span></td>
                                        <td style={{ fontSize: '0.82rem', color: 'var(--ds-text-secondary)' }}>
                                            {formatVN(r.startTime)} →{' '}{formatVN(r.endTime)}
                                        </td>
                                        <td>
                                            <button className="btn-copy" onClick={() => copyCode(r.accessCode)} title="Copy mã"><Copy size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="assign-footer">
                        <button className="btn btn-outline" onClick={printCodes}><Printer size={16} /> In bảng mã</button>
                        {results.length === 1 && (
                            <button className="btn btn-outline" style={{ borderColor: '#6366f1', color: '#6366f1' }}
                                onClick={() => { navigate(`/teacher/exam-monitor/${results[0].assignmentId}`); onClose(); }}>
                                <Activity size={16} /> Giám sát realtime
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={() => { navigate('/teacher/assignments'); onClose(); }}>
                            <CheckCircle size={16} /> Xem bài đã giao
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main form ──
    return (
        <div className="assign-overlay" onClick={onClose}>
            <div className="assign-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="assign-header">
                    <div>
                        <h2>📋 Giao đề thi</h2>
                        <p className="muted">{exam?.examTitle} — {exam?.examCode}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {/* ── Time Section ── */}
                <div className="assign-section">
                    <h4><Calendar size={15} /> Thời gian thi</h4>
                    <div className="time-row-2col">
                        <ViDateTimePicker label="Bắt đầu" value={startTime} onChange={setStartTime} />
                        <div className="field">
                            <label>Thời gian làm bài</label>
                            <div className="duration-input">
                                <input
                                    type="number" min="5" max="300"
                                    placeholder="45"
                                    value={durationMinutes}
                                    onChange={e => setDurationMinutes(e.target.value)}
                                />
                                <span className="duration-suffix">phút</span>
                            </div>
                        </div>
                    </div>
                    {startTime && durationMinutes && endTime && (
                        <div className="time-preview">
                            <Clock size={14} />
                            <span>
                                {formatVN(startTime)} → {formatVN(endTime)} ({durationMinutes} phút)
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Exam variants ── */}
                {variants.length > 0 && (
                    <div className="assign-section">
                        <h4><Shuffle size={15} /> Chọn mã đề sử dụng</h4>
                        <p className="muted" style={{ fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                            Chọn nhiều mã đề — hệ thống sẽ <strong>phân bố ngẫu nhiên</strong> cho học sinh trong mỗi lớp.
                        </p>
                        <div className="variant-grid">
                            {allExams.map(ex => {
                                const active = selectedExamIds.has(ex.id);
                                return (
                                    <button
                                        key={ex.id}
                                        className={`variant-card ${active ? 'active' : ''}`}
                                        onClick={() => toggleExamId(ex.id)}
                                    >
                                        <div className="variant-card-check">
                                            {active ? <CheckCircle size={18} /> : <div className="variant-card-uncheck" />}
                                        </div>
                                        <BookOpen size={20} />
                                        <div className="variant-card-info">
                                            <strong>{ex.label}</strong>
                                            <span>{ex.code}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.4rem' }}>
                            Đã chọn {selectedExamIds.size}/{allExams.length} mã đề
                        </p>
                    </div>
                )}

                {/* ── Classes ── */}
                <div className="assign-section">
                    <div className="section-header-row">
                        <h4><Users size={15} /> Chọn lớp giao đề {exam?.gradeLevel && <span className="grade-badge">Khối {exam.gradeLevel}</span>}</h4>
                        {classes.length > 0 && (
                            <button className="select-all-btn" onClick={selectAllClasses}>
                                {selectedClasses.size === classes.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <p className="muted">Đang tải danh sách lớp...</p>
                    ) : classes.length === 0 ? (
                        <div className="empty-classes">
                            <Users size={32} />
                            <p>Không tìm thấy lớp nào thuộc Khối {exam?.gradeLevel}</p>
                        </div>
                    ) : (
                        <div className="class-grid">
                            {classes.map(cls => {
                                const selected = selectedClasses.has(cls.classId);
                                return (
                                    <button
                                        key={cls.classId}
                                        className={`class-card ${selected ? 'selected' : ''}`}
                                        onClick={() => toggleClass(cls.classId)}
                                    >
                                        <div className="class-card-check">
                                            {selected ? <CheckCircle size={18} /> : <div className="class-card-uncheck" />}
                                        </div>
                                        <div className="class-card-body">
                                            <strong className="class-card-name">{cls.className}</strong>
                                            <span className="class-card-code">{cls.classCode}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        {selectedClasses.size} lớp được chọn
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
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                    z-index: 1000; display: flex; align-items: center; justify-content: center;
                    padding: 1rem; backdrop-filter: blur(4px);
                }
                .assign-modal {
                    background: white; border-radius: 20px; width: 100%; max-width: 720px;
                    max-height: 92vh; overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.25);
                    padding: 2rem;
                }
                .assign-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
                .assign-header h2 { margin: 0 0 0.25rem; font-size: 1.4rem; }
                .close-btn { background: none; border: none; cursor: pointer; color: var(--ds-text-muted, #999); padding: 4px; border-radius: 8px; transition: 0.15s; }
                .close-btn:hover { background: #f1f5f9; }
                .muted { color: var(--ds-text-secondary, #666); margin: 0; }

                .assign-section { margin-bottom: 1.5rem; }
                .assign-section h4 { display: flex; align-items: center; gap: 6px; margin: 0 0 0.75rem; font-size: 0.95rem; }

                /* ── Time row ── */
                .time-row-2col { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 1rem; align-items: start; }
                @media (max-width: 600px) { .time-row-2col { grid-template-columns: 1fr; } }

                .field label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; color: var(--ds-text-secondary, #555); }
                .field input { width: 100%; padding: 0.55rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; transition: border 0.2s; }
                .field input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

                .duration-input { position: relative; }
                .duration-input input { padding-right: 50px; }
                .duration-suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.82rem; color: #94a3b8; font-weight: 500; pointer-events: none; }

                .time-preview {
                    display: flex; align-items: center; gap: 8px;
                    margin-top: 0.75rem; padding: 0.65rem 1rem;
                    background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05));
                    border: 1px solid rgba(99,102,241,0.12); border-radius: 12px;
                    font-size: 0.84rem; color: var(--ds-text-secondary, #555);
                }

                /* ── Vietnamese DateTime Picker ── */
                .vi-datetime-picker { position: relative; }
                .vi-datetime-picker > label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; color: var(--ds-text-secondary, #555); }
                .vi-dt-input {
                    display: flex; align-items: center; gap: 8px;
                    padding: 0.55rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
                    cursor: pointer; font-size: 0.88rem; transition: border 0.2s; user-select: none;
                    background: white; min-height: 40px;
                }
                .vi-dt-input:hover { border-color: #6366f1; }
                .vi-dt-input .placeholder { color: #94a3b8; }
                .vi-dt-dropdown {
                    position: absolute; top: calc(100% + 6px); left: 0; z-index: 1100;
                    background: white; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.18);
                    border: 1px solid #e2e8f0; overflow: hidden; min-width: 360px;
                }
                .vi-dt-panels { display: flex; gap: 0; }
                @media (max-width: 500px) { .vi-dt-panels { flex-direction: column; } .vi-dt-dropdown { min-width: 280px; } }

                /* Calendar */
                .vi-calendar { padding: 0.75rem; flex: 1; border-right: 1px solid #f1f5f9; }
                .vi-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-weight: 700; font-size: 0.9rem; }
                .vi-cal-header button { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px 8px; border-radius: 6px; color: #6366f1; }
                .vi-cal-header button:hover { background: rgba(99,102,241,0.08); }
                .vi-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.72rem; font-weight: 600; color: #94a3b8; margin-bottom: 4px; }
                .vi-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
                .vi-cal-day {
                    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
                    font-size: 0.82rem; border: none; background: none; border-radius: 8px; cursor: pointer;
                    transition: 0.15s; color: #1e293b;
                }
                .vi-cal-day:hover:not(.empty):not(.selected) { background: #f1f5f9; }
                .vi-cal-day.empty { cursor: default; }
                .vi-cal-day.today { font-weight: 700; color: #6366f1; background: rgba(99,102,241,0.06); }
                .vi-cal-day.selected { background: #6366f1 !important; color: white !important; font-weight: 700; }

                /* Time selectors */
                .vi-time { padding: 0.75rem; min-width: 130px; display: flex; flex-direction: column; }
                .vi-time-label { font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; color: #334155; }
                .vi-time-selectors { display: flex; flex-direction: column; gap: 0.5rem; }
                .vi-time-col label { display: block; font-size: 0.72rem; font-weight: 600; color: #94a3b8; margin-bottom: 3px; }
                .vi-time-input {
                    width: 100%; padding: 6px 8px; border: 1.5px solid #e2e8f0; border-radius: 8px;
                    font-size: 1rem; font-family: inherit; font-weight: 700; text-align: center;
                    box-sizing: border-box;
                }
                .vi-time-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
                .vi-time-input::-webkit-inner-spin-button { opacity: 1; }
                .vi-period-btns { display: flex; gap: 4px; }
                .vi-period-btns button {
                    flex: 1; padding: 6px 0; border: 1.5px solid #e2e8f0; border-radius: 8px;
                    font-size: 0.78rem; font-weight: 600; cursor: pointer; background: white;
                    transition: 0.15s; font-family: inherit;
                }
                .vi-period-btns button.active { background: #6366f1; color: white; border-color: #6366f1; }
                .vi-period-btns button:hover:not(.active) { background: #f1f5f9; }

                .vi-dt-footer { padding: 0.5rem 0.75rem; border-top: 1px solid #f1f5f9; text-align: right; }
                .vi-dt-done {
                    padding: 6px 16px; background: #6366f1; color: white; border: none; border-radius: 8px;
                    font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit;
                }
                .vi-dt-done:hover { background: #4f46e5; }

                /* ── Variant cards ── */
                .variant-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .variant-card {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.6rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
                    background: white; cursor: pointer; transition: all 0.2s; font-family: inherit;
                }
                .variant-card:hover { border-color: #a5b4fc; background: rgba(99,102,241,0.02); }
                .variant-card.active { border-color: #6366f1; background: rgba(99,102,241,0.06); }
                .variant-card-check { color: #6366f1; flex-shrink: 0; }
                .variant-card-uncheck { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; }
                .variant-card-info { display: flex; flex-direction: column; text-align: left; }
                .variant-card-info strong { font-size: 0.85rem; color: #1e293b; }
                .variant-card-info span { font-size: 0.75rem; color: #94a3b8; }

                /* ── Class cards ── */
                .section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
                .section-header-row h4 { margin: 0 !important; }
                .grade-badge { background: rgba(99,102,241,0.1); color: #6366f1; padding: 2px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; margin-left: 4px; }
                .select-all-btn { background: none; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px 12px; font-size: 0.78rem; cursor: pointer; color: #6366f1; font-weight: 600; font-family: inherit; transition: 0.15s; }
                .select-all-btn:hover { background: rgba(99,102,241,0.05); }

                .class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.6rem; }
                .class-card {
                    display: flex; align-items: center; gap: 0.6rem;
                    padding: 0.75rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 14px;
                    background: white; cursor: pointer; transition: all 0.2s; text-align: left; font-family: inherit;
                }
                .class-card:hover { border-color: #a5b4fc; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.08); }
                .class-card.selected { border-color: #6366f1; background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04)); box-shadow: 0 4px 16px rgba(99,102,241,0.12); }
                .class-card-check { color: #6366f1; flex-shrink: 0; }
                .class-card-uncheck { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; }
                .class-card-body { display: flex; flex-direction: column; }
                .class-card-name { font-size: 0.95rem; font-weight: 700; color: #1e293b; }
                .class-card-code { font-size: 0.78rem; color: #94a3b8; }

                .empty-classes { text-align: center; padding: 2rem; color: #94a3b8; }
                .empty-classes p { margin-top: 0.5rem; font-size: 0.88rem; }

                /* ── Other ── */
                .toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; }
                .error-text { color: #ef4444; font-size: 0.88rem; margin-bottom: 1rem; padding: 0.5rem 0.75rem; background: rgba(239,68,68,0.05); border-radius: 8px; }
                .assign-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }

                /* Results table */
                .codes-table { margin: 1rem 0; overflow-x: auto; }
                .codes-table table { width: 100%; border-collapse: collapse; }
                .codes-table th { text-align: left; padding: 0.6rem 0.75rem; font-size: 0.8rem; color: var(--ds-text-secondary, #666); border-bottom: 2px solid #e2e8f0; }
                .codes-table td { padding: 0.75rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
                .exam-code-badge { background: rgba(99,102,241,0.1); color: #6366f1; padding: 2px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; }
                .access-code { font-family: monospace; font-size: 1.2rem; font-weight: 800; letter-spacing: 3px; color: #1a1a2e; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
                .btn-copy { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 8px; cursor: pointer; color: #94a3b8; transition: 0.15s; }
                .btn-copy:hover { background: #f1f5f9; color: #6366f1; }
                @media print {
                    .assign-header, .assign-footer, .btn-copy, .close-btn { display: none !important; }
                    .assign-overlay { position: static; background: none; backdrop-filter: none; }
                    .assign-modal { box-shadow: none; }
                }
            `}</style>
        </div>
    );
};

export default AssignExamModal;
