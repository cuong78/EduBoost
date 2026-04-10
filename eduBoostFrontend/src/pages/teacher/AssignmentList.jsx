import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Search, RefreshCw, Calendar, Clock, Users, Copy, Eye, X,
    CheckCircle, AlertTriangle, ClipboardCheck, Trophy, BarChart2,
    ChevronDown, ChevronUp, ExternalLink, Activity, Timer,
    TrendingUp, TrendingDown, Award, Minus, ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import examAssignmentService from '../../services/examAssignmentService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import './AssignmentList.css';

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

    /* ═══════════ RENDER ═══════════ */
    return (
        <div className="al-page">
            {/* Header */}
            <div className="al-header">
                <div>
                    <h1 className="al-title"><ClipboardCheck size={24} /> Bài đã giao</h1>
                    <p className="al-sub">Quản lý đề thi đã giao cho học sinh và theo dõi kết quả</p>
                </div>
                <button className="al-btn al-btn-outline" onClick={loadAssignments} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'al-spin' : ''} /> Làm mới
                </button>
            </div>

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
                                    return (
                                        <tr key={a.assignmentId}>
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
                                                    <button className="al-icon-btn" title="Xem kết quả" onClick={() => openResults(a)}>
                                                        <BarChart2 size={15} />
                                                    </button>
                                                    <button className="al-icon-btn" title="Giám sát realtime"
                                                        onClick={() => navigate(`/teacher/exam-monitor/${a.assignmentId}`)}>
                                                        <Eye size={15} />
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
                                                                            <AlertTriangle size={13} /> {log.violationType}
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
        </div>
    );
};

export default AssignmentList;
