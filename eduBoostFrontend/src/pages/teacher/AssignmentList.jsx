import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Search, RefreshCw, Calendar, Clock, Users, Copy, Eye, X,
    CheckCircle, AlertTriangle, ClipboardCheck, Trophy, BarChart2,
    ChevronDown, ChevronUp, ExternalLink, Activity, Timer,
    TrendingUp, TrendingDown, Award, Minus, ArrowUpDown, Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import examAssignmentService from '../../services/examAssignmentService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import MathRenderer from '../../components/common/MathRenderer';
import './AssignmentList.css';

// Vietnamese labels for violation codes
const VIOLATION_LABELS = {
    TAB_SWITCH: 'Chuyển tab',
    FULLSCREEN_EXIT: 'Thoát toàn màn hình',
    WINDOW_BLUR: 'Rời cửa sổ thi',
    COPY_PASTE: 'Copy/Paste',
    NETWORK_OFFLINE: 'Mất mạng',
    BACK_BUTTON: 'Nhấn nút quay lại',
    SCREEN_OFF: 'Tắt màn hình',
    IDLE: 'Không hoạt động',
};
const translateViolation = (code) => VIOLATION_LABELS[code] || code;

const fmtDateVN = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const pad = (n) => String(n).padStart(2, '0');
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let h = d.getHours();
    const p = h >= 12 ? 'chiều' : 'sáng';
    h = h % 12 || 12;
    return `${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)} lúc ${h}:${pad(d.getMinutes())} ${p}`;
};

const fmtDuration = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p${s > 0 ? ` ${s}s` : ''}`;
};

/* ── Status config ── */
const STATUS_MAP = {
    SCHEDULED: { label: 'Chưa bắt đầu', icon: Clock, color: '#94a3b8', bg: '#f1f5f9' },
    ACTIVE: { label: 'Đang diễn ra', icon: Activity, color: '#16a34a', bg: '#dcfce7' },
    ENDED: { label: 'Đã kết thúc', icon: CheckCircle, color: '#6366f1', bg: '#e0e7ff' },
};

/** Compute status from time — replaces stale DB status */
const computeStatus = (a) => {
    const now = new Date();
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);
    if (now < start) return 'SCHEDULED';
    if (now > end) return 'ENDED';
    return 'ACTIVE';
};

/* ═══════════════════════════════════════════════════════════════════ */
const AssignmentList = () => {
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Results modal
    const [selectedId, setSelectedId] = useState(null);
    const [results, setResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [sortField, setSortField] = useState('score');
    const [sortDir, setSortDir] = useState('desc');

    // Violation logs
    const [violationLogs, setViolationLogs] = useState([]);
    const [showViolations, setShowViolations] = useState(false);

    // Highlight newly assigned exams from URL param
    const location = useLocation();
    const highlightIds = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const h = params.get('highlight');
        if (!h) return new Set();
        return new Set(h.split(',').map(id => Number(id)));
    }, [location.search]);
    const highlightRef = React.useRef(null);

    /* ── Load assignments ── */
    const loadAssignments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await examAssignmentService.getTeacherAssignments();
            setAssignments(Array.isArray(data) ? data : []);
        } catch {
            showErrorToast('Không thể tải danh sách bài đã giao');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAssignments(); }, [loadAssignments]);

    // Auto-scroll to highlighted assignment after loading
    useEffect(() => {
        if (!loading && highlightIds.size > 0 && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [loading, highlightIds]);

    /* ── Filter ── */
    const filtered = useMemo(() => {
        let list = assignments;
        if (filterStatus) list = list.filter(a => computeStatus(a) === filterStatus);
        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            list = list.filter(a =>
                a.examTitle?.toLowerCase().includes(t) ||
                a.className?.toLowerCase().includes(t) ||
                a.examCode?.toLowerCase().includes(t) ||
                a.accessCode?.toLowerCase().includes(t)
            );
        }
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [assignments, filterStatus, searchTerm]);

    /* ── Stats (use computed status) ── */
    const stats = useMemo(() => ({
        total: assignments.length,
        active: assignments.filter(a => computeStatus(a) === 'ACTIVE').length,
        ended: assignments.filter(a => computeStatus(a) === 'ENDED').length,
        totalSubmissions: assignments.reduce((s, a) => s + (a.submittedCount || 0), 0),
    }), [assignments]);

    /* ── Copy access code ── */
    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        showSuccessToast(`Đã copy mã: ${code}`);
    };

    /* ── Open results ── */
    const openResults = async (assignment) => {
        setSelectedAssignment(assignment);
        setSelectedId(assignment.assignmentId);
        setResultsLoading(true);
        setViolationLogs([]);
        setShowViolations(false);
        try {
            const data = await examAssignmentService.getAssignmentResults(assignment.assignmentId);
            setResults(Array.isArray(data) ? data : []);
            // Also load violation logs
            try {
                const logs = await examAssignmentService.getViolationLogs(assignment.assignmentId);
                setViolationLogs(Array.isArray(logs) ? logs : []);
            } catch { setViolationLogs([]); }
        } catch {
            showErrorToast('Không thể tải kết quả');
            setResults([]);
        } finally {
            setResultsLoading(false);
        }
    };

    const closeResults = () => {
        setSelectedId(null);
        setResults([]);
        setSelectedAssignment(null);
    };

    /* ── Sort results ── */
    const sortedResults = useMemo(() => {
        const sorted = [...results];
        sorted.sort((a, b) => {
            let va, vb;
            switch (sortField) {
                case 'name': va = a.studentName || ''; vb = b.studentName || ''; return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
                case 'score': va = Number(a.score || 0); vb = Number(b.score || 0); break;
                case 'percentage': va = Number(a.percentage || 0); vb = Number(b.percentage || 0); break;
                case 'time': va = a.timeTakenSeconds || 0; vb = b.timeTakenSeconds || 0; break;
                case 'tabSwitch': va = a.tabSwitchCount || 0; vb = b.tabSwitchCount || 0; break;
                default: va = 0; vb = 0;
            }
            return sortDir === 'asc' ? va - vb : vb - va;
        });
        return sorted;
    }, [results, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    /* ── Results stats ── */
    const resultStats = useMemo(() => {
        if (results.length === 0) return null;
        const scores = results.map(r => Number(r.percentage || 0));
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const passed = results.filter(r => r.status === 'PASSED').length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        return { avg, passed, total: results.length, passRate: (passed / results.length * 100), highest, lowest };
    }, [results]);

    const [activeTab, setActiveTab] = useState('assignments');

    /* ═══════════ RENDER ═══════════ */
    return (
        <div className="al-page">
            {/* Header */}
            <div className="al-header">
                <div>
                    <h1 className="al-title"><BarChart2 size={24} /> Thống kê</h1>
                    <p className="al-sub">Theo dõi bài thi đã giao và quản lý điểm học sinh</p>
                </div>
                {activeTab === 'assignments' && (
                    <button className="al-btn al-btn-outline" onClick={loadAssignments} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'al-spin' : ''} /> Làm mới
                    </button>
                )}
            </div>

            {/* Sub-tabs */}
            <div className="al-subtabs">
                <button
                    className={`al-subtab ${activeTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    <ClipboardCheck size={16} />
                    Bài đã giao
                </button>
                <button
                    className={`al-subtab ${activeTab === 'grades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grades')}
                >
                    <Trophy size={16} />
                    Quản lý điểm
                </button>
            </div>

            {activeTab === 'grades' ? (
                <GradeManagementTab />
            ) : (
            <>


            {/* Stats */}
            <div className="al-stats">
                <div className="al-stat-card">
                    <div className="al-stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}><ClipboardCheck size={20} /></div>
                    <div><p className="al-stat-label">Tổng bài giao</p><h3 className="al-stat-value">{stats.total}</h3></div>
                </div>
                <div className="al-stat-card">
                    <div className="al-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Activity size={20} /></div>
                    <div><p className="al-stat-label">Đang diễn ra</p><h3 className="al-stat-value">{stats.active}</h3></div>
                </div>
                <div className="al-stat-card">
                    <div className="al-stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><Trophy size={20} /></div>
                    <div><p className="al-stat-label">Bài nộp</p><h3 className="al-stat-value">{stats.totalSubmissions}</h3></div>
                </div>
                <div className="al-stat-card">
                    <div className="al-stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}><CheckCircle size={20} /></div>
                    <div><p className="al-stat-label">Đã kết thúc</p><h3 className="al-stat-value">{stats.ended}</h3></div>
                </div>
            </div>

            {/* Filters */}
            <div className="al-filters">
                <div className="al-search">
                    <Search size={16} />
                    <input
                        placeholder="Tìm theo tên đề, lớp, mã đề..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && <button className="al-search-clear" onClick={() => setSearchTerm('')}><X size={14} /></button>}
                </div>
                <div className="al-chip-row">
                    <button className={`al-chip ${!filterStatus ? 'active' : ''}`} onClick={() => setFilterStatus('')}>Tất cả</button>
                    {Object.entries(STATUS_MAP).map(([key, cfg]) => (
                        <button key={key} className={`al-chip ${filterStatus === key ? 'active' : ''}`} onClick={() => setFilterStatus(key)}>
                            <cfg.icon size={13} /> {cfg.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="al-card">
                {loading ? (
                    <div className="al-loading"><RefreshCw size={22} className="al-spin" /><span>Đang tải...</span></div>
                ) : filtered.length === 0 ? (
                    <div className="al-empty">
                        <ClipboardCheck size={48} opacity={0.25} />
                        <h3>Chưa có bài nào được giao</h3>
                        <p>Hãy giao đề thi từ <strong>Quản lý đề thi</strong> hoặc <strong>Tạo đề thi</strong></p>
                    </div>
                ) : (
                    <div className="al-table-wrap">
                        <table className="al-table">
                            <thead>
                                <tr>
                                    <th>Tên đề thi</th>
                                    <th>Lớp</th>
                                    <th>Mã vào thi</th>
                                    <th>Thời gian</th>
                                    <th>Trạng thái</th>
                                    <th className="center">Nộp bài</th>
                                    <th className="center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(a => {
                                    const status = computeStatus(a);
                                    const cfg = STATUS_MAP[status] || STATUS_MAP.SCHEDULED;
                                    const StatusIcon = cfg.icon;
                                        const isHighlighted = highlightIds.has(a.assignmentId);
                                        return (
                                        <tr
                                            key={a.assignmentId}
                                            className={isHighlighted ? 'al-highlight' : ''}
                                            ref={isHighlighted && !highlightRef.current ? (el) => { highlightRef.current = el; } : undefined}
                                        >
                                            <td>
                                                <div className="al-exam-name">
                                                    <strong>{a.examTitle}</strong>
                                                    <span className="al-exam-code">{a.examCode}</span>
                                                </div>
                                            </td>
                                            <td><span className="al-class-badge">{a.className}</span></td>
                                            <td>
                                                <div className="al-code-cell">
                                                    <span className="al-access-code">{a.accessCode}</span>
                                                    <button className="al-copy-btn" onClick={() => copyCode(a.accessCode)} title="Copy mã">
                                                        <Copy size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="al-time-cell">
                                                    <span>{fmtDateVN(a.startTime)}</span>
                                                    <span className="al-time-arrow">→</span>
                                                    <span>{fmtDateVN(a.endTime)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="al-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                                                    <StatusIcon size={13} /> {cfg.label}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <span className="al-submit-count">
                                                    {a.submittedCount || 0}/{a.totalStudents || '?'}
                                                </span>
                                            </td>
                                            <td className="center">
                                                <div className="al-actions">
                                                    <button
                                                        className="al-action-text-btn al-action-results"
                                                        onClick={() => openResults(a)}
                                                    >
                                                        <BarChart2 size={14} />
                                                        Xem kết quả
                                                    </button>
                                                    <button
                                                        className="al-action-text-btn al-action-monitor"
                                                        onClick={() => navigate(`/teacher/exam-monitor/${a.assignmentId}`)}
                                                    >
                                                        <Eye size={14} />
                                                        Giám sát
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ═══════ RESULTS MODAL ═══════ */}
            {selectedId && (
                <div className="al-overlay" onClick={closeResults}>
                    <div className="al-modal" onClick={e => e.stopPropagation()}>
                        <div className="al-modal-header">
                            <div>
                                <h2><BarChart2 size={20} /> Kết quả — {selectedAssignment?.examTitle}</h2>
                                <p className="al-modal-meta">
                                    Lớp {selectedAssignment?.className} · Mã đề {selectedAssignment?.examCode}
                                </p>
                            </div>
                            <button className="al-close" onClick={closeResults}><X size={20} /></button>
                        </div>

                        <div className="al-modal-body">
                            {resultsLoading ? (
                                <div className="al-loading"><RefreshCw size={22} className="al-spin" /><span>Đang tải kết quả...</span></div>
                            ) : results.length === 0 ? (
                                <div className="al-empty">
                                    <Trophy size={48} opacity={0.25} />
                                    <h3>Chưa có học sinh nào nộp bài</h3>
                                    <p>Kết quả sẽ hiển thị tại đây khi học sinh hoàn thành bài thi.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary cards */}
                                    {resultStats && (
                                        <div className="al-result-stats">
                                            <div className="al-rs-card">
                                                <TrendingUp size={18} color="#16a34a" />
                                                <div>
                                                    <span className="al-rs-label">Điểm TB</span>
                                                    <span className="al-rs-val">{resultStats.avg.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="al-rs-card">
                                                <Award size={18} color="#6366f1" />
                                                <div>
                                                    <span className="al-rs-label">Tỷ lệ đạt</span>
                                                    <span className="al-rs-val">{resultStats.passRate.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <div className="al-rs-card">
                                                <TrendingUp size={18} color="#0ea5e9" />
                                                <div>
                                                    <span className="al-rs-label">Cao nhất</span>
                                                    <span className="al-rs-val">{resultStats.highest.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="al-rs-card">
                                                <TrendingDown size={18} color="#ef4444" />
                                                <div>
                                                    <span className="al-rs-label">Thấp nhất</span>
                                                    <span className="al-rs-val">{resultStats.lowest.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Results table */}
                                    <div className="al-table-wrap">
                                        <table className="al-table al-result-table">
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th className="sortable" onClick={() => toggleSort('name')}>
                                                        Học sinh <ArrowUpDown size={12} />
                                                    </th>
                                                    <th className="sortable center" onClick={() => toggleSort('score')}>
                                                        Điểm <ArrowUpDown size={12} />
                                                    </th>
                                                    <th className="sortable center" onClick={() => toggleSort('percentage')}>
                                                        Tỷ lệ <ArrowUpDown size={12} />
                                                    </th>
                                                    <th className="center">Kết quả</th>
                                                    <th className="sortable center" onClick={() => toggleSort('time')}>
                                                        Thời gian <ArrowUpDown size={12} />
                                                    </th>
                                                    <th className="sortable center" onClick={() => toggleSort('tabSwitch')}>
                                                        Vi phạm <ArrowUpDown size={12} />
                                                    </th>
                                                    <th>Nguồn nộp</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedResults.map((r, idx) => {
                                                    const pct = Number(r.percentage || 0);
                                                    const isPass = r.status === 'PASSED';
                                                    const hasViolation = (r.tabSwitchCount || 0) > 0;
                                                    return (
                                                        <tr key={r.resultId} className={hasViolation ? 'al-row-warn' : ''}>
                                                            <td className="center">{idx + 1}</td>
                                                            <td><strong>{r.studentName || 'N/A'}</strong></td>
                                                            <td className="center mono">
                                                                {Number(r.score || 0).toFixed(1)}/{Number(r.maxScore || 0).toFixed(1)}
                                                            </td>
                                                            <td className="center">
                                                                <div className="al-pct-bar">
                                                                    <div className="al-pct-fill" style={{
                                                                        width: `${Math.min(pct, 100)}%`,
                                                                        background: pct >= 50 ? '#16a34a' : '#ef4444'
                                                                    }} />
                                                                    <span>{pct.toFixed(1)}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="center">
                                                                <span className={`al-result-badge ${isPass ? 'pass' : 'fail'}`}>
                                                                    {isPass ? '✅ ĐẠT' : '❌ CHƯA ĐẠT'}
                                                                </span>
                                                            </td>
                                                            <td className="center mono">{fmtDuration(r.timeTakenSeconds)}</td>
                                                            <td className="center">
                                                                {hasViolation ? (
                                                                    <span className="al-violation-badge">
                                                                        <AlertTriangle size={13} /> {r.tabSwitchCount}
                                                                    </span>
                                                                ) : (
                                                                    <span className="al-clean-badge"><CheckCircle size={13} /> 0</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className="al-source-badge">{r.submissionSource === 'MANUAL' ? '📝 Thủ công' : '⏰ Tự động'}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Violation Logs Section */}
                                    {violationLogs.length > 0 && (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <button
                                                className="al-btn al-btn-outline"
                                                onClick={() => setShowViolations(!showViolations)}
                                                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                                            >
                                                <AlertTriangle size={16} />
                                                {showViolations ? 'Ẩn' : 'Xem'} nhật ký vi phạm ({violationLogs.length} lượt)
                                                {showViolations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            {showViolations && (
                                                <div className="al-table-wrap" style={{ marginTop: '0.75rem' }}>
                                                    <table className="al-table">
                                                        <thead>
                                                            <tr>
                                                                <th>STT</th>
                                                                <th>Học sinh</th>
                                                                <th>Loại vi phạm</th>
                                                                <th>Thời gian</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {violationLogs.map((log, idx) => (
                                                                <tr key={log.id || idx}>
                                                                    <td className="center">{idx + 1}</td>
                                                                    <td><strong>{log.studentName || 'N/A'}</strong></td>
                                                                    <td>
                                                                        <span className="al-violation-badge">
                                                                            <AlertTriangle size={13} /> {translateViolation(log.violationType)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="mono">
                                                                        {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '—'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
};

/* ═══════════ GRADE MANAGEMENT TAB  ═══════════ */

const GradeManagementTab = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [grades, setGrades] = useState(null);
    const [loadingGrades, setLoadingGrades] = useState(false);

    // Result detail modal
    const [detailResult, setDetailResult] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailStudent, setDetailStudent] = useState('');

    useEffect(() => {
        examAssignmentService.getTeacherClasses?.()
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setClasses(list);
                if (list.length > 0) setSelectedClass(list[0].classId);
            })
            .catch(() => setClasses([]));
    }, []);

    useEffect(() => {
        if (!selectedClass) return;
        setLoadingGrades(true);
        examAssignmentService.getClassGrades(selectedClass)
            .then(data => setGrades(data))
            .catch(() => setGrades(null))
            .finally(() => setLoadingGrades(false));
    }, [selectedClass]);

    const openResultDetail = async (resultId, studentName) => {
        setDetailLoading(true);
        setDetailStudent(studentName);
        setDetailResult(null);
        try {
            const data = await examAssignmentService.getResult(resultId);
            setDetailResult(data);
        } catch {
            showErrorToast('Không thể tải chi tiết bài thi');
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setDetailResult(null);
        setDetailLoading(false);
        setDetailStudent('');
    };

    return (
        <div>
            {/* Class selector */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>Chọn lớp:</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0',
                        fontSize: '0.95rem', minWidth: 200, background: 'white',
                    }}
                >
                    {classes.map(c => (
                        <option key={c.classId} value={c.classId}>{c.className}</option>
                    ))}
                </select>
            </div>

            {loadingGrades ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải bảng điểm...</p>
                </div>
            ) : !grades || !grades.students || grades.students.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '3rem', color: '#94a3b8',
                    background: 'white', borderRadius: 16, border: '1px dashed #e2e8f0',
                }}>
                    <Trophy size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>Chưa có dữ liệu điểm cho lớp này</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ minWidth: 'max-content' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={thStyle}>STT</th>
                                <th style={thStyle}>Mã HS</th>
                                <th style={thStyle}>Họ tên</th>
                                {(grades.exams || []).map((exam, i) => (
                                    <th key={i} style={{ ...thStyle, minWidth: 100 }} title={exam.examTitle}>
                                        {exam.examTitle?.length > 15
                                            ? exam.examTitle.substring(0, 15) + '...'
                                            : exam.examTitle}
                                    </th>
                                ))}
                                <th style={{ ...thStyle, background: '#eef2ff', fontWeight: 700 }}>Điểm TB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.students.map((student, idx) => (
                                <tr key={student.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>{idx + 1}</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.82rem' }}>{student.studentCode}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{student.fullName}</td>
                                    {(grades.exams || []).map((exam, i) => {
                                        const score = student.scores?.[exam.assignmentId];
                                        const resultId = student.resultIds?.[exam.assignmentId];
                                        const hasResult = score != null && resultId;
                                        return (
                                            <td key={i} style={{
                                                ...tdStyle,
                                                color: score == null ? '#cbd5e1' : score >= 5 ? '#16a34a' : '#ef4444',
                                                fontWeight: score != null ? 600 : 400,
                                                cursor: hasResult ? 'pointer' : 'default',
                                                position: 'relative',
                                            }}
                                            onClick={hasResult ? () => openResultDetail(resultId, student.fullName) : undefined}
                                            title={hasResult ? 'Kích để xem chi tiết bài thi' : ''}
                                            >
                                                {score != null ? (
                                                    <span style={{
                                                        ...(hasResult ? {
                                                            borderBottom: '2px dashed currentColor',
                                                            paddingBottom: '1px',
                                                        } : {}),
                                                    }}>
                                                        {Number(score).toFixed(1)}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                        );
                                    })}
                                    <td style={{
                                        ...tdStyle, fontWeight: 700, background: '#f8faff',
                                        color: student.average >= 5 ? '#16a34a' : student.average != null ? '#ef4444' : '#94a3b8',
                                    }}>
                                        {student.average != null ? Number(student.average).toFixed(2) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* ── Result Detail Modal ── */}
            {(detailResult || detailLoading) && (
                <ResultDetailModal
                    result={detailResult}
                    loading={detailLoading}
                    studentName={detailStudent}
                    onClose={closeDetail}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   Result Detail Modal — shows full exam result with math rendering
   ═══════════════════════════════════════════════════════════════ */

const RenderContent = ({ content }) => <MathRenderer content={content} />;

/** Render AI text with **bold** and line breaks */
const FormatAIText = ({ text }) => {
    if (!text) return null;
    // Split by newlines, then render **bold** within each line
    const lines = text.split(/\n/);
    return (
        <div style={{ lineHeight: 1.7, fontSize: '0.88rem', color: '#475569' }}>
            {lines.map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                // Convert **text** to <strong>text</strong>
                const parts = line.split(/(\*\*[^*]+\*\*)/);
                return (
                    <p key={i} style={{ margin: '0.3rem 0' }}>
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} style={{ color: '#1e293b' }}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

const ResultDetailModal = ({ result, loading, studentName, onClose }) => {
    if (loading && !result) return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Đang tải chi tiết bài thi...</p>
            </div>
        </div>
    );

    if (!result) return null;

    const isPass = result.status === 'PASSED' || Number(result.percentage) >= 50;
    const pct = Number(result.percentage || 0);
    const correct = result.questionResults?.filter(q => q.correct || q.isCorrect).length || 0;
    const total = result.questionResults?.length || 0;

    const fmtDuration = (s) => {
        if (!s) return '—';
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}p${sec > 0 ? ` ${sec}s` : ''}`;
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '20px', width: '100%', maxWidth: '750px',
                maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    background: isPass
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    padding: '1.5rem 2rem', color: 'white', position: 'relative', flexShrink: 0,
                }}>
                    <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 800 }}>
                        {isPass ? '✅' : '❌'} {result.examTitle || 'Kết quả bài thi'}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>
                        Học sinh: <strong>{studentName}</strong>
                    </p>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: 'white',
                    }}><X size={18} /></button>
                </div>

                {/* Body — scrollable */}
                <div style={{ overflowY: 'auto', padding: '1.5rem 2rem', flex: 1 }}>
                    {/* Score summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={summaryCard}>
                            <div style={summaryLabel}>Điểm</div>
                            <div style={{ ...summaryValue, color: isPass ? '#16a34a' : '#ef4444' }}>
                                {Number(result.score || 0).toFixed(1)}/{Number(result.maxScore || 0).toFixed(1)}
                            </div>
                        </div>
                        <div style={summaryCard}>
                            <div style={summaryLabel}>Phần trăm</div>
                            <div style={{ ...summaryValue, color: isPass ? '#16a34a' : '#ef4444' }}>
                                {pct.toFixed(0)}%
                            </div>
                        </div>
                        <div style={summaryCard}>
                            <div style={summaryLabel}>Câu đúng</div>
                            <div style={summaryValue}>{correct}/{total}</div>
                        </div>
                        <div style={summaryCard}>
                            <div style={summaryLabel}>Thời gian</div>
                            <div style={{ ...summaryValue, fontSize: '1rem' }}>{fmtDuration(result.timeTakenSeconds)}</div>
                        </div>
                    </div>

                    {/* Violations */}
                    {result.tabSwitchCount > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 10,
                            padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.85rem',
                        }}>
                            <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            Vi phạm: <strong>{result.tabSwitchCount}</strong> lần thoát tab
                        </div>
                    )}

                    {/* AI Analysis for teacher */}
                    {result.aiAnalysisTeacher && (
                        <div style={{
                            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                            borderRadius: 14, padding: '1.25rem', marginBottom: '1rem',
                            border: '1px solid rgba(99,102,241,0.12)',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                fontWeight: 700, color: '#4338ca', marginBottom: '0.6rem', fontSize: '0.92rem',
                            }}>
                                <Sparkles size={18} style={{ color: '#6366f1' }} />
                                Phân tích AI cho giáo viên
                            </div>
                            <FormatAIText text={result.aiAnalysisTeacher} />
                        </div>
                    )}

                    {/* Question details */}
                    {result.questionResults && result.questionResults.length > 0 && (
                        <div>
                            <h4 style={{ margin: '0 0 0.75rem', color: '#334155', fontSize: '0.95rem' }}>
                                📝 Chi tiết từng câu ({total} câu)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {result.questionResults.map((q, idx) => {
                                    const qCorrect = q.correct || q.isCorrect;
                                    return (
                                        <div key={idx} style={{
                                            background: '#f8fafc', borderRadius: 10, padding: '0.85rem',
                                            borderLeft: `4px solid ${qCorrect ? '#16a34a' : '#ef4444'}`,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                                                    Câu {q.orderNumber || idx + 1}
                                                </span>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                                                    background: qCorrect ? '#dcfce7' : '#fee2e2',
                                                    color: qCorrect ? '#16a34a' : '#dc2626',
                                                }}>
                                                    {qCorrect ? '✓ Đúng' : '✗ Sai'}
                                                    {q.points != null && ` · ${Number(q.points).toFixed(1)} đ`}
                                                </span>
                                            </div>
                                            <div style={{ color: '#334155', margin: '0.4rem 0', lineHeight: 1.5, fontSize: '0.88rem' }}>
                                                <RenderContent content={q.questionText} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>Đáp án HS</div>
                                                    <div style={{
                                                        fontWeight: 600, fontSize: '0.85rem',
                                                        color: qCorrect ? '#16a34a' : '#ef4444',
                                                    }}>
                                                        <RenderContent content={q.selectedAnswer || '(Không trả lời)'} />
                                                    </div>
                                                </div>
                                                {!qCorrect && (
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>Đáp án đúng</div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#16a34a' }}>
                                                            <RenderContent content={q.correctAnswer} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {q.explanation && (
                                                <div style={{
                                                    marginTop: '0.4rem', padding: '0.5rem', background: '#fffbeb',
                                                    borderRadius: 6, fontSize: '0.8rem', color: '#92400e', lineHeight: 1.4,
                                                }}>
                                                    💡 <RenderContent content={q.explanation} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const summaryCard = {
    background: '#f8fafc', borderRadius: 10, padding: '0.75rem',
    textAlign: 'center', border: '1px solid #f1f5f9',
};
const summaryLabel = { fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' };
const summaryValue = { fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' };

const thStyle = { padding: '0.75rem 0.6rem', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' };
const tdStyle = { padding: '0.65rem 0.6rem', color: '#334155' };

export default AssignmentList;
