import { useState, useEffect, useMemo, useRef } from 'react';
import {
    X, Calendar, Clock, Users, Key, CheckCircle, Copy, Printer, Activity, BookOpen, Shuffle
} from 'lucide-react';

import examAssignmentService from '../../services/examAssignmentService';

/* ── Vietnamese month names for calendar header ── */
const MONTHS_VI = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];
const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/* ── Custom Premium Vietnamese Date-Time Picker ── */
const ViDateTimePicker = ({ value, onChange, label }) => {
    const lastEmittedRef = useRef(null);

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
    const [minute, setMinute] = useState(parsed.minute !== '' ? parsed.minute : 0);
    const [period, setPeriod] = useState(parsed.period || 'SA');
    const [hourStr, setHourStr] = useState(String(parsed.hour || 8));
    const [minuteStr, setMinuteStr] = useState(String(parsed.minute !== '' ? parsed.minute : 0).padStart(2, '0'));
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        // Prevent feedback loop when change was emitted internally
        if (value && value === lastEmittedRef.current) {
            return;
        }
        if (parsed.year) {
            setViewYear(parsed.year);
            setViewMonth(parsed.month);
            setSelectedDate(new Date(parsed.year, parsed.month, parsed.day));
        }
        if (parsed.hour !== '') {
            setHour(parsed.hour);
            setHourStr(String(parsed.hour));
        }
        if (parsed.minute !== '') {
            setMinute(parsed.minute);
            setMinuteStr(String(parsed.minute).padStart(2, '0'));
        }
        if (parsed.period) {
            setPeriod(parsed.period);
        }
    }, [value, parsed]);

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
        lastEmittedRef.current = val;
        onChange(val);
    };

    const handleDateClick = (day) => {
        const d = new Date(viewYear, viewMonth, day);
        setSelectedDate(d);
        emitChange(d, hour, minute, period);
    };

    const handleTimeChange = (h, m, p) => {
        setHour(h);
        setHourStr(String(h));
        setMinute(m);
        setMinuteStr(String(m).padStart(2, '0'));
        setPeriod(p);
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
                <Calendar size={18} />
                <span className={displayValue ? '' : 'placeholder'}>
                    {displayValue || 'Chọn ngày giờ thi...'}
                </span>
            </div>
            {showPicker && (
                <div className="vi-dt-dropdown">
                    <div className="vi-dt-panels">
                        {/* Calendar */}
                        <div className="vi-calendar">
                            <div className="vi-cal-header">
                                <button type="button" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}>‹</button>
                                <span>{MONTHS_VI[viewMonth]} {viewYear}</span>
                                <button type="button" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}>›</button>
                            </div>
                            <div className="vi-cal-weekdays">
                                {WEEKDAYS_VI.map(w => <span key={w}>{w}</span>)}
                            </div>
                            <div className="vi-cal-grid">
                                {calendarDays.map((d, i) => (
                                    <button
                                        type="button"
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
                            <div className="vi-time-label">Chọn Giờ</div>
                            <div className="vi-time-selectors">
                                <div className="vi-time-col">
                                    <label>Giờ</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={hourStr}
                                        onFocus={e => e.target.select()}
                                        onChange={e => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length > 2) val = val.slice(-2);
                                            setHourStr(val);
                                            if (val === '') return;
                                            let n = parseInt(val, 10);
                                            if (!isNaN(n)) {
                                                if (n > 12) {
                                                    n = 12;
                                                    setHourStr('12');
                                                }
                                                if (n >= 1) {
                                                    setHour(n);
                                                    emitChange(selectedDate, n, minute, period);
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            let n = parseInt(hourStr, 10);
                                            if (isNaN(n) || n < 1) n = 1;
                                            if (n > 12) n = 12;
                                            setHourStr(String(n));
                                            setHour(n);
                                            emitChange(selectedDate, n, minute, period);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                const next = hour >= 12 ? 1 : hour + 1;
                                                handleTimeChange(next, minute, period);
                                            } else if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                const prev = hour <= 1 ? 12 : hour - 1;
                                                handleTimeChange(prev, minute, period);
                                            }
                                        }}
                                        className="vi-time-input"
                                    />
                                </div>
                                <div className="vi-time-col">
                                    <label>Phút</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={minuteStr}
                                        onFocus={e => e.target.select()}
                                        onChange={e => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length > 2) val = val.slice(-2);
                                            setMinuteStr(val);
                                            if (val === '') return;
                                            let n = parseInt(val, 10);
                                            if (!isNaN(n)) {
                                                if (n > 59) {
                                                    n = 59;
                                                    setMinuteStr('59');
                                                }
                                                setMinute(n);
                                                emitChange(selectedDate, hour, n, period);
                                            }
                                        }}
                                        onBlur={() => {
                                            let n = parseInt(minuteStr, 10);
                                            if (isNaN(n) || n < 0) n = 0;
                                            if (n > 59) n = 59;
                                            setMinuteStr(String(n).padStart(2, '0'));
                                            setMinute(n);
                                            emitChange(selectedDate, hour, n, period);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                const next = (minute + 1) % 60;
                                                handleTimeChange(hour, next, period);
                                            } else if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                const prev = minute <= 0 ? 59 : minute - 1;
                                                handleTimeChange(hour, prev, period);
                                            }
                                        }}
                                        className="vi-time-input"
                                    />
                                </div>
                                <div className="vi-time-col">
                                    <label>&nbsp;</label>
                                    <div className="vi-period-btns">
                                        <button type="button" className={period === 'SA' ? 'active' : ''} onClick={() => handleTimeChange(hour, minute, 'SA')}>Sáng</button>
                                        <button type="button" className={period === 'CH' ? 'active' : ''} onClick={() => handleTimeChange(hour, minute, 'CH')}>Chiều</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {selectedDate && (
                        <div className="vi-dt-footer">
                            <button type="button" className="vi-dt-done" onClick={() => setShowPicker(false)}>
                                <CheckCircle size={15} /> Hoàn tất
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════ */

// Helper to recommend duration based on exam type/title
const getRecommendedDuration = (exam) => {
    if (!exam) return 45;
    if (exam.durationMinutes && Number(exam.durationMinutes) > 0) {
        return Number(exam.durationMinutes);
    }
    if (exam.duration && Number(exam.duration) > 0) {
        return Number(exam.duration);
    }

    const textToMatch = [
        exam.examTypeName,
        exam.examTypeCode,
        exam.examType?.typeName,
        exam.examType?.typeCode,
        typeof exam.examType === 'string' ? exam.examType : '',
        exam.examTitle,
        exam.title,
    ].filter(Boolean).join(' ').toLowerCase();

    // 15 minutes test
    if (
        textToMatch.includes('15 ph') ||
        textToMatch.includes('15p') ||
        textToMatch.includes('15 phút') ||
        textToMatch.includes('15 minute') ||
        textToMatch.includes('mười lăm')
    ) {
        return 15;
    }

    // 1 tiết or học kì or giữa kì or cuối kì -> 45 minutes
    if (
        textToMatch.includes('1 tiet') ||
        textToMatch.includes('1 tiết') ||
        textToMatch.includes('một tiết') ||
        textToMatch.includes('hoc ki') ||
        textToMatch.includes('học kì') ||
        textToMatch.includes('học kỳ') ||
        textToMatch.includes('giua ki') ||
        textToMatch.includes('giữa kì') ||
        textToMatch.includes('giữa kỳ') ||
        textToMatch.includes('cuoi ki') ||
        textToMatch.includes('cuối kì') ||
        textToMatch.includes('cuối kỳ') ||
        textToMatch.includes('45')
    ) {
        return 45;
    }

    return 45;
};

const AssignExamModal = ({ exam, variants = [], onClose }) => {

    const [allClasses, setAllClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state: pre-fill durationMinutes with recommended duration based on exam type
    const recommendedDuration = useMemo(() => getRecommendedDuration(exam), [exam]);
    const [startTime, setStartTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(() => getRecommendedDuration(exam));
    const [notifyParent, setNotifyParent] = useState(true);

    useEffect(() => {
        if (exam) {
            setDurationMinutes(getRecommendedDuration(exam));
        }
    }, [exam]);

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
        const end = new Date(start.getTime() + Number(durationMinutes) * 60000);
        const pad = (n) => String(n).padStart(2, '0');
        return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
    }, [startTime, durationMinutes]);

    // Load teacher's classes
    useEffect(() => {
        setLoading(true);
        examAssignmentService.getTeacherClasses()
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
                setAllClasses(list);
            })
            .catch(err => {
                console.error('Failed to load teacher classes:', err);
                setAllClasses([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Filter classes matching exam gradeLevel
    const classes = useMemo(() => {
        if (!allClasses || allClasses.length === 0) return [];
        if (!exam?.gradeLevel) return allClasses;
        const targetGrade = parseInt(String(exam.gradeLevel).replace(/\D/g, ''), 10);
        if (isNaN(targetGrade)) return allClasses;

        const filtered = allClasses.filter(c => {
            // 1. Check gradeLevel (e.g. "6", 6, "Khối 6")
            if (c.gradeLevel !== undefined && c.gradeLevel !== null) {
                const num = parseInt(String(c.gradeLevel).replace(/\D/g, ''), 10);
                if (!isNaN(num) && num === targetGrade) return true;
            }
            // 2. Check gradeName if present (e.g. "Khối 6", "6")
            if (c.gradeName) {
                const num = parseInt(String(c.gradeName).replace(/\D/g, ''), 10);
                if (!isNaN(num) && num === targetGrade) return true;
            }
            // 3. Check className (e.g. "6A1", "Lớp 6A1")
            if (c.className) {
                const match = String(c.className).match(/(\d+)/);
                if (match && parseInt(match[1], 10) === targetGrade) return true;
            }
            // 4. Check classCode (e.g. "6A1-2024")
            if (c.classCode) {
                const match = String(c.classCode).match(/(\d+)/);
                if (match && parseInt(match[1], 10) === targetGrade) return true;
            }
            return false;
        });

        // Fallback to all classes if no specific grade match
        return filtered.length > 0 ? filtered : allClasses;
    }, [allClasses, exam]);

    const toggleClass = (classId) => {
        setSelectedClasses(prev => {
            const next = new Set(prev);
            if (next.has(classId)) next.delete(classId);
            else next.add(classId);
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

    const toggleExamId = (id) => {
        setSelectedExamIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                if (next.size === 1) return prev; // Keep at least one
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!startTime) { setError('Vui lòng chọn thời gian bắt đầu'); return; }
        if (!durationMinutes || Number(durationMinutes) <= 0) { setError('Vui lòng nhập thời gian làm bài hợp lệ'); return; }
        if (selectedClasses.size === 0) { setError('Vui lòng chọn ít nhất một lớp để giao đề'); return; }
        if (selectedExamIds.size === 0) { setError('Vui lòng chọn ít nhất một mã đề'); return; }

        setError('');
        setSubmitting(true);
        try {
            const payload = {
                examId: exam.id,
                classIds: Array.from(selectedClasses),
                selectedExamIds: Array.from(selectedExamIds),
                startTime: startTime.length === 16 ? startTime + ':00' : startTime,
                endTime: endTime.length === 16 ? endTime + ':00' : endTime,
                durationMinutes: Number(durationMinutes),
                notifyParent,
            };
            const res = await (examAssignmentService.assignExam || examAssignmentService.createAssignment)(payload);
            const data = Array.isArray(res) ? res : (res?.data?.data || res?.data || (res ? [res] : []));
            setResults(Array.isArray(data) ? data : [data]);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Lỗi khi giao đề thi';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    const formatVN = (str) => {
        if (!str) return '';
        const d = new Date(str);
        if (isNaN(d.getTime())) return str;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const printCodes = () => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Mã làm bài - ${exam?.examTitle}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; }
                        h2 { color: #1e293b; margin-bottom: 0.5rem; }
                        .subtitle { color: #64748b; margin-bottom: 2rem; }
                        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
                        .card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; text-align: center; }
                        .class-name { font-weight: 700; font-size: 1.1rem; color: #1e293b; }
                        .code { font-family: monospace; font-size: 2.2rem; font-weight: 900; letter-spacing: 6px; color: #6366f1; margin: 0.75rem 0; }
                        .time { font-size: 0.85rem; color: #64748b; }
                    </style>
                </head>
                <body>
                    <h2>📋 MÃ VÀO THI — ${exam?.examTitle}</h2>
                    <p class="subtitle">Mã đề: ${exam?.examCode} | Đã tạo lúc ${new Date().toLocaleString('vi-VN')}</p>
                    <div class="grid">
                        ${results ? results.map(r => `
                            <div class="card">
                                <div class="class-name">${r.className} (${r.examCode})</div>
                                <div class="code">${r.accessCode}</div>
                                <div class="time">⏰ ${formatVN(r.startTime)} → ${formatVN(r.endTime)}</div>
                            </div>
                        `).join('') : ''}
                    </div>
                    <script>window.onload = () => window.print();</script>
                </body>
            </html>
        `);
        win.document.close();
    };

    // ── Success screen ──
    if (results) {
        const highlightParam = results.map(r => r.assignmentId).join(',');
        return (
            <div className="assign-overlay" style={{ animation: 'fadeInOverlay 0.2s ease-out' }}>
                <div className="assign-modal success-modal" style={{ animation: 'slideUpModal 0.25s ease-out' }}>
                    <div className="success-header">
                        <div className="success-icon-badge">
                            <CheckCircle size={32} />
                        </div>
                        <h3>Giao đề thi thành công!</h3>
                        <p className="muted">{exam?.examTitle}</p>
                        <button className="close-btn success-close" onClick={onClose}><X size={18} /></button>
                    </div>

                    {/* Codes cards */}
                    <div className="results-list">
                        {results.map(r => (
                            <div key={r.assignmentId} className="result-card">
                                <div className="result-card-header">
                                    <span className="result-class-name">{r.className}</span>
                                    <span className="result-exam-code">{r.examCode}</span>
                                </div>
                                <div className="result-code-box">
                                    <div>
                                        <div className="result-code-label">Mã vào thi</div>
                                        <div className="result-code-value">{r.accessCode}</div>
                                    </div>
                                    <button onClick={() => copyCode(r.accessCode)} className="btn-copy">
                                        <Copy size={14} /> Sao chép
                                    </button>
                                </div>
                                <div className="result-time-info">
                                    <Clock size={13} /> {formatVN(r.startTime)} → {formatVN(r.endTime)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="success-actions">
                        <a href={`/teacher/assignments?highlight=${highlightParam}`} className="btn-view-assignments">
                            <CheckCircle size={18} /> Xem danh sách bài đã giao
                        </a>
                        <div className="action-row-2col">
                            <button onClick={printCodes} className="btn-action-sec">
                                <Printer size={15} /> In bảng mã
                            </button>
                            {results.length === 1 && (
                                <a href={`/teacher/exam-monitor/${results[0].assignmentId}`} className="btn-action-primary">
                                    <Activity size={15} /> Giám sát trực tiếp
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideUpModal { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                `}</style>
            </div>
        );
    }

    // ── Main form ──
    return (
        <div className="assign-overlay" onClick={onClose}>
            <div className="assign-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="assign-header">
                    <div className="header-title-group">
                        <div className="header-icon-badge">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <h2>Giao đề thi</h2>
                            <div className="header-exam-meta">
                                <span className="exam-title-text">{exam?.examTitle}</span>
                                <span className="exam-code-tag">{exam?.examCode}</span>
                            </div>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Đóng"><X size={20} /></button>
                </div>

                {/* ── Time Section ── */}
                <div className="assign-section">
                    <h4><Calendar size={16} /> Thời gian thi</h4>
                    <div className="time-row-2col">
                        <ViDateTimePicker label="Thời điểm bắt đầu" value={startTime} onChange={setStartTime} />
                        <div className="field">
                            <div className="field-header-row">
                                <label>Thời gian làm bài</label>
                                {recommendedDuration && (
                                    <span className="duration-recommended-badge" title="Gợi ý tự động theo loại đề">
                                        Gợi ý: {recommendedDuration}p
                                    </span>
                                )}
                            </div>
                            <div className="duration-input">
                                <input
                                    type="number" min="1" max="300"
                                    placeholder={String(recommendedDuration || 45)}
                                    value={durationMinutes}
                                    onChange={e => setDurationMinutes(e.target.value)}
                                />
                                <span className="duration-suffix">phút</span>
                            </div>
                            <div className="duration-quick-chips">
                                {[15, 45, 60, 90].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={`duration-chip ${Number(durationMinutes) === val ? 'active' : ''}`}
                                        onClick={() => setDurationMinutes(val)}
                                    >
                                        {val}p
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {startTime && durationMinutes && endTime && (
                        <div className="time-preview">
                            <Clock size={15} />
                            <span>
                                <strong>Thời gian:</strong> {formatVN(startTime)} → {formatVN(endTime)} ({durationMinutes} phút)
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Exam variants ── */}
                {variants.length > 0 && (
                    <div className="assign-section">
                        <h4><Shuffle size={16} /> Chọn mã đề sử dụng</h4>
                        <p className="muted" style={{ fontSize: '0.84rem', marginBottom: '0.65rem' }}>
                            Chọn nhiều mã đề — hệ thống sẽ <strong>phân bố ngẫu nhiên</strong> cho học sinh trong mỗi lớp.
                        </p>
                        <div className="variant-grid">
                            {allExams.map(ex => {
                                const active = selectedExamIds.has(ex.id);
                                return (
                                    <button
                                        key={ex.id}
                                        type="button"
                                        className={`variant-card ${active ? 'active' : ''}`}
                                        onClick={() => toggleExamId(ex.id)}
                                    >
                                        <div className="variant-card-check">
                                            {active ? <CheckCircle size={18} /> : <div className="variant-card-uncheck" />}
                                        </div>
                                        <div className="variant-card-icon">
                                            <BookOpen size={18} />
                                        </div>
                                        <div className="variant-card-info">
                                            <span className="variant-label">{ex.label}</span>
                                            <code className="variant-code">{ex.code}</code>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.45rem' }}>
                            Đã chọn {selectedExamIds.size}/{allExams.length} mã đề
                        </p>
                    </div>
                )}

                {/* ── Classes ── */}
                <div className="assign-section">
                    <div className="section-header-row">
                        <h4><Users size={16} /> Chọn lớp giao đề {exam?.gradeLevel && <span className="grade-badge">Khối {exam.gradeLevel}</span>}</h4>
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
                                        type="button"
                                        className={`class-card ${selected ? 'selected' : ''}`}
                                        onClick={() => toggleClass(cls.classId)}
                                    >
                                        <div className="class-card-check">
                                            {selected ? <CheckCircle size={18} /> : <div className="class-card-uncheck" />}
                                        </div>
                                        <div className="class-card-icon">
                                            <Users size={18} />
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
                        <span>Thông báo điểm cho phụ huynh sau khi thi xong</span>
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
                    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
                    z-index: 1000; display: flex; align-items: center; justify-content: center;
                    padding: 1rem; backdrop-filter: blur(6px);
                    animation: fadeInOverlay 0.2s ease-out;
                }
                .assign-modal {
                    background: #ffffff; border-radius: 24px; width: 100%; max-width: 720px;
                    max-height: 92vh; overflow-y: auto;
                    box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1);
                    padding: 2rem;
                    animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Header */
                .assign-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9;
                }
                .header-title-group { display: flex; align-items: center; gap: 12px; }
                .header-icon-badge {
                    width: 46px; height: 46px; border-radius: 14px;
                    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12));
                    border: 1px solid rgba(99,102,241,0.2);
                    display: flex; align-items: center; justify-content: center;
                    color: #6366f1; flex-shrink: 0;
                }
                .assign-header h2 { margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
                .header-exam-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
                .exam-title-text { font-size: 0.88rem; font-weight: 600; color: #475569; }
                .exam-code-tag {
                    font-size: 0.75rem; font-weight: 700; font-family: ui-monospace, monospace;
                    background: #f1f5f9; color: #6366f1; padding: 2px 8px; border-radius: 6px; border: 1px solid #e2e8f0;
                }

                .close-btn { background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; color: #64748b; padding: 6px; border-radius: 10px; transition: 0.15s; }
                .close-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
                .muted { color: #64748b; margin: 0; }

                .assign-section { margin-bottom: 1.65rem; }
                .assign-section h4 {
                    display: flex; align-items: center; gap: 8px;
                    margin: 0 0 0.85rem; font-size: 0.98rem; font-weight: 700; color: #1e293b; letter-spacing: -0.01em;
                }
                .assign-section h4 svg { color: #6366f1; }

                /* ── Time row ── */
                .time-row-2col { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 1rem; align-items: start; }
                @media (max-width: 600px) { .time-row-2col { grid-template-columns: 1fr; } }

                .field-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .field-header-row label { margin-bottom: 0; }
                .duration-recommended-badge {
                    font-size: 0.72rem; font-weight: 700; color: #4f46e5; background: #e0e7ff;
                    padding: 2px 7px; border-radius: 6px; border: 1px solid #c7d2fe;
                }
                .duration-quick-chips { display: flex; gap: 5px; margin-top: 6px; }
                .duration-chip {
                    padding: 3px 8px; font-size: 0.75rem; font-weight: 700; border-radius: 6px;
                    border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.15s ease;
                }
                .duration-chip:hover { border-color: #cbd5e1; color: #1e293b; background: #f1f5f9; }
                .duration-chip.active {
                    border-color: #6366f1; background: #6366f1; color: #ffffff;
                    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
                }

                .field label { display: block; font-size: 0.83rem; font-weight: 700; margin-bottom: 6px; color: #334155; }
                .field input {
                    width: 100%; padding: 0.65rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
                    font-size: 0.92rem; font-weight: 600; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                }
                .field input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }

                .duration-input { position: relative; }
                .duration-input input { padding-right: 50px; }
                .duration-suffix { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.84rem; color: #64748b; font-weight: 600; pointer-events: none; }

                .time-preview {
                    display: flex; align-items: center; gap: 8px;
                    margin-top: 0.85rem; padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06));
                    border: 1px solid rgba(99,102,241,0.15); border-radius: 14px;
                    font-size: 0.86rem; color: #334155;
                }
                .time-preview svg { color: #6366f1; }

                /* ── Modern Premium Vietnamese DateTime Picker ── */
                .vi-datetime-picker { position: relative; }
                .vi-datetime-picker > label { display: block; font-size: 0.83rem; font-weight: 700; margin-bottom: 6px; color: #334155; }
                .vi-dt-input {
                    display: flex; align-items: center; gap: 10px;
                    padding: 0.65rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
                    cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
                    background: #ffffff; min-height: 44px; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                }
                .vi-dt-input:hover { border-color: #6366f1; background: #f8fafc; box-shadow: 0 4px 12px rgba(99,102,241,0.08); }
                .vi-dt-input .placeholder { color: #94a3b8; font-weight: 400; }
                .vi-dt-input svg { color: #6366f1; }

                .vi-dt-dropdown {
                    position: absolute; top: calc(100% + 8px); left: 0; z-index: 1100;
                    background: #ffffff; border-radius: 20px;
                    box-shadow: 0 20px 50px -10px rgba(15,23,42,0.25), 0 0 0 1px rgba(99,102,241,0.12);
                    overflow: hidden; min-width: 380px;
                    animation: dropdownFadeIn 0.2s ease-out;
                }
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .vi-dt-panels { display: flex; gap: 0; background: #ffffff; }
                @media (max-width: 520px) { .vi-dt-panels { flex-direction: column; } .vi-dt-dropdown { min-width: 290px; } }

                /* Calendar styling */
                .vi-calendar { padding: 1rem; flex: 1; border-right: 1px solid #f1f5f9; }
                .vi-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-weight: 700; font-size: 0.95rem; color: #1e293b; }
                .vi-cal-header button {
                    background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; font-size: 1rem;
                    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
                    border-radius: 8px; color: #475569; transition: all 0.15s;
                }
                .vi-cal-header button:hover { background: #e0e7ff; color: #4f46e5; border-color: #c7d2fe; }

                .vi-cal-weekdays {
                    display: grid; grid-template-columns: repeat(7, 34px); justify-content: center; gap: 4px;
                    text-align: center; font-size: 0.72rem; font-weight: 700; color: #64748b; margin-bottom: 6px;
                    text-transform: uppercase; letter-spacing: 0.05em;
                }
                .vi-cal-grid { display: grid; grid-template-columns: repeat(7, 34px); justify-content: center; gap: 4px; }
                .vi-cal-day {
                    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
                    font-size: 0.85rem; font-weight: 500; border: none; background: none; border-radius: 10px;
                    cursor: pointer; transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); color: #334155; padding: 0;
                }
                .vi-cal-day:hover:not(.empty):not(.selected) { background: #f1f5f9; color: #4f46e5; transform: translateY(-1px); }
                .vi-cal-day.empty { cursor: default; }
                .vi-cal-day.today { font-weight: 700; color: #4f46e5; background: #e0e7ff; box-shadow: inset 0 0 0 1.5px #6366f1; }
                .vi-cal-day.selected { background: linear-gradient(135deg, #6366f1, #4f46e5) !important; color: #ffffff !important; font-weight: 700; box-shadow: 0 4px 12px rgba(99,102,241,0.35) !important; }

                /* Time Panel Styling */
                .vi-time { padding: 1rem; min-width: 145px; display: flex; flex-direction: column; background: #fafafa; }
                .vi-time-label { font-weight: 700; font-size: 0.85rem; margin-bottom: 0.65rem; color: #1e293b; text-transform: uppercase; letter-spacing: 0.04em; }
                .vi-time-selectors { display: flex; flex-direction: column; gap: 0.65rem; }
                .vi-time-col label { display: block; font-size: 0.72rem; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
                .vi-time-input {
                    width: 100%; padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 10px;
                    font-size: 1.05rem; font-family: inherit; font-weight: 700; text-align: center;
                    box-sizing: border-box; background: #ffffff; color: #0f172a; transition: all 0.2s;
                }
                .vi-time-input:focus { outline: none; border-color: #6366f1; background: #ffffff; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }

                .vi-period-btns { display: flex; gap: 4px; background: #e2e8f0; padding: 3px; border-radius: 10px; }
                .vi-period-btns button {
                    flex: 1; padding: 6px 0; border: none; border-radius: 7px;
                    font-size: 0.78rem; font-weight: 700; cursor: pointer; background: transparent;
                    color: #64748b; transition: all 0.2s; font-family: inherit;
                }
                .vi-period-btns button.active { background: #ffffff; color: #4f46e5; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }

                .vi-dt-footer { padding: 0.65rem 1rem; background: #ffffff; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
                .vi-dt-done {
                    background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none;
                    padding: 7px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(99,102,241,0.25); transition: all 0.15s;
                }
                .vi-dt-done:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.4); }

                /* Variant & Class Grids */
                .variant-grid, .class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.85rem; margin-top: 0.75rem; }
                .variant-card, .class-card {
                    display: flex; align-items: center; gap: 12px; padding: 0.85rem 1rem;
                    border: 1.5px solid #e2e8f0; border-radius: 16px; background: #ffffff;
                    cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-align: left; user-select: none;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                .variant-card:hover, .class-card:hover {
                    border-color: #6366f1; background: #f8fafc; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.1);
                }
                .variant-card.active, .class-card.selected {
                    border-color: #6366f1; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
                    box-shadow: 0 4px 16px rgba(99,102,241,0.15);
                }
                .variant-card-check, .class-card-check { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #6366f1; flex-shrink: 0; }
                .variant-card-uncheck, .class-card-uncheck { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 50%; transition: all 0.2s; }
                .variant-card:hover .variant-card-uncheck, .class-card:hover .class-card-uncheck { border-color: #6366f1; }
                .variant-card-icon, .class-card-icon {
                    width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; color: #6366f1;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;
                }
                .variant-card.active .variant-card-icon, .class-card.selected .class-card-icon {
                    background: #e0e7ff; color: #4f46e5;
                }
                .variant-card-info, .class-card-body {
                    display: flex; flex-direction: column; gap: 4px; overflow: hidden; flex: 1;
                }
                .variant-label { font-size: 0.92rem; font-weight: 800; color: #0f172a; display: block; }
                .variant-code {
                    font-size: 0.72rem; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 5px; border: 1px solid #e2e8f0;
                    display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .variant-card.active .variant-code { background: #ffffff; color: #4f46e5; border-color: #c7d2fe; }
                .class-card-name { font-size: 0.95rem; font-weight: 800; color: #0f172a; display: block; }
                .class-card-code {
                    font-size: 0.72rem; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 5px; border: 1px solid #e2e8f0;
                    display: inline-block;
                }
                .class-card.selected .class-card-code { background: #ffffff; color: #4f46e5; border-color: #c7d2fe; }

                .section-header-row { display: flex; justify-content: space-between; align-items: center; }
                .select-all-btn { background: none; border: none; color: #6366f1; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
                .select-all-btn:hover { text-decoration: underline; }
                .grade-badge { background: #e0e7ff; color: #4f46e5; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }

                .toggle-label { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; font-weight: 600; color: #334155; cursor: pointer; user-select: none; }
                .toggle-label input { width: 18px; height: 18px; accent-color: #6366f1; border-radius: 4px; }

                .error-text { color: #ef4444; font-weight: 600; font-size: 0.85rem; margin-top: 0.5rem; }

                /* Success Modal */
                .success-modal { text-align: center; padding: 2.25rem 2rem; max-width: 580px; }
                .success-header { position: relative; margin-bottom: 1.5rem; }
                .success-icon-badge {
                    width: 64px; height: 64px; border-radius: 20px; background: #dcfce7; color: #16a34a;
                    display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;
                    box-shadow: 0 10px 25px -5px rgba(22, 163, 74, 0.3);
                }
                .success-header h3 { margin: 0 0 4px; font-size: 1.4rem; font-weight: 800; color: #0f172a; }
                .success-close { position: absolute; top: -10px; right: -10px; }

                .results-list { max-height: 45vh; overflow-y: auto; text-align: left; margin-bottom: 1.5rem; }
                .result-card { background: #f8fafc; border-radius: 16px; padding: 1.1rem 1.25rem; margin-bottom: 0.85rem; border: 1px solid #e2e8f0; }
                .result-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; }
                .result-class-name { font-weight: 800; color: #0f172a; font-size: 1rem; }
                .result-exam-code { background: #e0e7ff; color: #4f46e5; padding: 3px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; font-family: monospace; }
                .result-code-box {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #ffffff; border-radius: 12px; padding: 0.75rem 1rem; border: 1.5px dashed #c7d2fe;
                }
                .result-code-label { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .result-code-value { font-family: monospace; font-size: 1.6rem; font-weight: 900; letter-spacing: 4px; color: #4f46e5; }
                .btn-copy { background: #e0e7ff; color: #4f46e5; border: none; border-radius: 9px; padding: 8px 14px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.15s; }
                .btn-copy:hover { background: #c7d2fe; }
                .result-time-info { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #64748b; margin-top: 0.6rem; font-weight: 500; }

                .success-actions { display: flex; flex-direction: column; gap: 0.75rem; }
                .btn-view-assignments {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 14px 24px; font-size: 1rem; font-weight: 800;
                    background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
                    border-radius: 14px; text-decoration: none; border: none; cursor: pointer;
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); transition: 0.2s;
                }
                .btn-view-assignments:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5); }
                .action-row-2col { display: flex; gap: 0.75rem; }
                .btn-action-sec, .btn-action-primary {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
                    padding: 11px; border-radius: 12px; font-weight: 700; font-size: 0.88rem;
                    text-decoration: none; cursor: pointer; font-family: inherit; transition: 0.2s;
                }
                .btn-action-sec { background: #ffffff; border: 1.5px solid #e2e8f0; color: #475569; }
                .btn-action-sec:hover { background: #f8fafc; border-color: #cbd5e1; }
                .btn-action-primary { background: #ffffff; border: 1.5px solid #6366f1; color: #4f46e5; }
                .btn-action-primary:hover { background: #e0e7ff; }

                /* Footer */
                .assign-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid #f1f5f9; }
                .btn { padding: 0.7rem 1.4rem; border-radius: 12px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
                .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
                .btn-secondary:hover { background: #e2e8f0; color: #1e293b; }
                .btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(99,102,241,0.35); }
                .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default AssignExamModal;
