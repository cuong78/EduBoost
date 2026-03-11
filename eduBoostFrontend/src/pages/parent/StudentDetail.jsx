import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Loader2, ArrowLeft, User, GraduationCap, Mail, Calendar,
    BookOpen, Award, TrendingUp, ChevronLeft, ChevronRight,
    FileText, Users, Clock
} from 'lucide-react';
import { parentService } from '../../services/parentService';
import { showErrorToast } from '../../utils/show-toast';

export default function ParentStudentDetail() {
    const { studentId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scoresLoading, setScoresLoading] = useState(true);
    const [scores, setScores] = useState([]);
    const [scoresPage, setScoresPage] = useState(0);
    const [scoresTotalPages, setScoresTotalPages] = useState(0);

    const loadData = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const res = await parentService.getStudentById(studentId);
            setData(res);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được thông tin');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const loadScores = async (page = 0) => {
        if (!studentId) return;
        setScoresLoading(true);
        try {
            const res = await parentService.getStudentScores(studentId, { page, limit: 10 });
            const pageData = res?.content ?? res?.data?.content ?? [];
            setScores(pageData);
            setScoresPage(res?.number ?? page);
            setScoresTotalPages(res?.totalPages ?? 1);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được điểm số');
            setScores([]);
        } finally {
            setScoresLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        loadScores(0);
    }, [studentId]);

    if (loading) {
        return (
            <div className="psd-loading">
                <div className="psd-spinner-box">
                    <Loader2 size={30} className="psd-spinner" />
                </div>
                <p>Đang tải thông tin...</p>
                <style>{spinStyle}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="psd-notfound">
                <div className="psd-notfound-icon"><User size={40} /></div>
                <h3>Không tìm thấy học sinh</h3>
                <Link to="/parent/students" className="psd-back-btn">
                    <ArrowLeft size={16} /> Về danh sách
                </Link>
                <style>{spinStyle}</style>
            </div>
        );
    }

    const student = data.student ?? data;
    const classInfo = data.class ?? student.class;
    const teacher = classInfo?.teacher;

    const getInitials = (name) => {
        if (!name) return 'HS';
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
    };

    const getScoreColor = (score, maxScore) => {
        if (!maxScore) return '#6c3fff';
        const pct = (score / maxScore) * 100;
        if (pct >= 80) return '#10b981';
        if (pct >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreBg = (score, maxScore) => {
        if (!maxScore) return 'rgba(108,63,255,0.1)';
        const pct = (score / maxScore) * 100;
        if (pct >= 80) return 'rgba(16,185,129,0.1)';
        if (pct >= 60) return 'rgba(245,158,11,0.1)';
        return 'rgba(239,68,68,0.1)';
    };

    const avgScore = scores.length
        ? (scores.reduce((s, x) => s + (x.score ?? 0), 0) / scores.length).toFixed(1)
        : null;
    const maxScoreVal = scores.length ? Math.max(...scores.map(x => x.score ?? 0)) : null;
    const minScoreVal = scores.length ? Math.min(...scores.map(x => x.score ?? 0)) : null;
    const passedCount = scores.filter(x => x.status === 'PASSED' || (x.maxScore && x.score / x.maxScore >= 0.5)).length;

    return (
        <div className="psd-page">
            {/* Breadcrumb */}
            <nav className="psd-breadcrumb">
                <Link to="/parent/students" className="psd-breadcrumb-link">
                    <ArrowLeft size={15} />
                    <span>Con của tôi</span>
                </Link>
                <span className="psd-breadcrumb-sep">/</span>
                <span className="psd-breadcrumb-current">{student.fullName}</span>
            </nav>

            {/* 2-column body */}
            <div className="psd-body-layout">
            <div className="psd-body-main">

            {/* Profile Hero */}
            <div className="psd-hero">
                <div className="psd-hero-bg" />
                <div className="psd-hero-content">
                    <div className="psd-hero-avatar">
                        {getInitials(student.fullName)}
                    </div>
                    <div className="psd-hero-info">
                        <h1 className="psd-hero-name">{student.fullName}</h1>
                        <div className="psd-hero-meta">
                            <span className="psd-meta-chip">
                                <FileText size={13} />
                                {student.studentCode ?? `ID: ${student.studentId}`}
                            </span>
                            {classInfo && (
                                <span className="psd-meta-chip">
                                    <GraduationCap size={13} />
                                    {classInfo.className ?? classInfo.name}
                                </span>
                            )}
                            {student.gender && (
                                <span className="psd-meta-chip">
                                    {student.gender === 'MALE' ? '♂ Nam' : student.gender === 'FEMALE' ? '♀ Nữ' : '⚧ Khác'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-col info */}
            <div className="psd-info-grid">
                {/* Student info */}
                <div className="psd-info-card">
                    <div className="psd-card-header">
                        <div className="psd-card-icon purple">
                            <User size={18} />
                        </div>
                        <h3>Thông tin học sinh</h3>
                    </div>
                    <div className="psd-info-rows">
                        <InfoRow icon={<FileText size={15} />} label="Mã HS" value={student.studentCode ?? student.studentId} />
                        <InfoRow icon={<User size={15} />} label="Họ tên" value={student.fullName} />
                        <InfoRow icon={<Mail size={15} />} label="Email" value={student.email ?? '—'} />
                        <InfoRow
                            icon={<Calendar size={15} />}
                            label="Ngày sinh"
                            value={student.dateOfBirth
                                ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
                                : '—'}
                        />
                        <InfoRow
                            icon={<Users size={15} />}
                            label="Giới tính"
                            value={student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                        />
                    </div>
                </div>

                {/* Class info */}
                {classInfo && (
                    <div className="psd-info-card">
                        <div className="psd-card-header">
                            <div className="psd-card-icon green">
                                <GraduationCap size={18} />
                            </div>
                            <h3>Lớp học</h3>
                        </div>
                        <div className="psd-info-rows">
                            <InfoRow icon={<BookOpen size={15} />} label="Lớp" value={classInfo.className ?? classInfo.name ?? classInfo.classId} />
                            <InfoRow icon={<Award size={15} />} label="Khối" value={classInfo.gradeLevel ?? '—'} />
                            {teacher && (
                                <>
                                    <InfoRow icon={<User size={15} />} label="Giáo viên" value={teacher.fullName ?? teacher.name ?? teacher.email} />
                                    {teacher.email && <InfoRow icon={<Mail size={15} />} label="Email GV" value={teacher.email} />}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Scores section */}
            <div className="psd-scores-card">
                <div className="psd-card-header">
                    <div className="psd-card-icon amber">
                        <TrendingUp size={18} />
                    </div>
                    <h3>Kết quả kiểm tra</h3>
                </div>

                {scoresLoading ? (
                    <div className="psd-scores-loading">
                        <Loader2 size={24} className="psd-spinner" />
                        <span>Đang tải điểm số...</span>
                    </div>
                ) : scores.length === 0 ? (
                    <div className="psd-scores-empty">
                        <BookOpen size={36} />
                        <p>Chưa có dữ liệu điểm số cho học sinh này.</p>
                    </div>
                ) : (
                    <>
                        <div className="psd-table-wrap">
                            <table className="psd-table">
                                <thead>
                                    <tr>
                                        <th>Bài kiểm tra</th>
                                        <th>Môn học</th>
                                        <th>Chương</th>
                                        <th>Học kỳ</th>
                                        <th>Năm học</th>
                                        <th><Clock size={13} /> Ngày làm</th>
                                        <th>Điểm</th>
                                        <th>Nguồn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scores.map((item) => (
                                        <tr key={item.resultId}>
                                            <td className="psd-td-exam">{item.examTitle}</td>
                                            <td>{item.subjectName}</td>
                                            <td>{item.chapterName ?? '—'}</td>
                                            <td>{item.semester ?? '—'}</td>
                                            <td>{item.schoolYear ?? '—'}</td>
                                            <td className="psd-td-date">
                                                {item.takenAt
                                                    ? new Date(item.takenAt).toLocaleDateString('vi-VN')
                                                    : '—'}
                                            </td>
                                            <td>
                                                <span
                                                    className="psd-score-badge"
                                                    style={{
                                                        color: getScoreColor(item.score, item.maxScore),
                                                        background: getScoreBg(item.score, item.maxScore),
                                                    }}
                                                >
                                                    {item.score}
                                                    {item.maxScore ? `/${item.maxScore}` : ''}
                                                    {item.percentage != null && (
                                                        <span className="psd-pct"> ({item.percentage}%)</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`psd-source-badge ${item.sourceType === 'ONLINE_EXAM' ? 'online' : 'manual'}`}>
                                                    {item.sourceType === 'ONLINE_EXAM' ? 'Thi online' : 'GV nhập'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {scoresTotalPages > 1 && (
                            <div className="psd-pagination">
                                <button
                                    className="psd-page-btn"
                                    disabled={scoresPage <= 0}
                                    onClick={() => loadScores(scoresPage - 1)}
                                >
                                    <ChevronLeft size={16} /> Trước
                                </button>
                                <span className="psd-page-info">
                                    {scoresPage + 1} / {scoresTotalPages}
                                </span>
                                <button
                                    className="psd-page-btn"
                                    disabled={scoresPage >= scoresTotalPages - 1}
                                    onClick={() => loadScores(scoresPage + 1)}
                                >
                                    Sau <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>{/* end psd-scores-card */}

            </div>{/* end psd-body-main */}

            <aside className="psd-sidebar">
                <div className="psd-side-card">
                    <div className="psd-side-title"><TrendingUp size={15} /> Tóm tắt điểm số</div>
                    {scores.length === 0 ? (
                        <p className="psd-side-empty">Chưa có dữ liệu điểm.</p>
                    ) : (
                        <>
                        <div className="psd-score-summary">
                            <div className="psd-sum-item purple"><span className="psd-sum-val">{avgScore}</span><span className="psd-sum-lab">Điểm TB</span></div>
                            <div className="psd-sum-item green"><span className="psd-sum-val">{maxScoreVal}</span><span className="psd-sum-lab">Cao nhất</span></div>
                            <div className="psd-sum-item amber"><span className="psd-sum-val">{minScoreVal}</span><span className="psd-sum-lab">Thấp nhất</span></div>
                            <div className="psd-sum-item teal"><span className="psd-sum-val">{Math.round(passedCount / scores.length * 100)}%</span><span className="psd-sum-lab">Tỷ lệ đạt</span></div>
                        </div>
                        <div className="psd-side-stat-row"><span>Tổng bài thi</span><strong>{scores.length}</strong></div>
                        <div className="psd-side-stat-row"><span>Bài đạt</span><strong style={{color:'#10b981'}}>{passedCount}</strong></div>
                        </>
                    )}
                </div>
            </aside>

            </div>{/* end psd-body-layout */}

            <style>{`
                ${spinStyle}

                .psd-page {
                    width: 100%;
                    padding-bottom: 2rem;
                }

                /* 2-COL BODY LAYOUT */
                .psd-body-layout {
                    display: grid;
                    grid-template-columns: 1fr 260px;
                    gap: 1.5rem;
                    align-items: start;
                    margin-top: 1.5rem;
                }
                .psd-body-main { display: flex; flex-direction: column; gap: 1.5rem; }

                /* SIDEBAR */
                .psd-sidebar { display: flex; flex-direction: column; gap: 1rem; }
                .psd-side-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 1.15rem;
                }
                .psd-side-title {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 0.85rem; font-weight: 700; color: #6c3fff;
                    margin-bottom: 0.9rem;
                    padding-bottom: 0.6rem;
                    border-bottom: 1px solid rgba(108,63,255,0.12);
                }
                .psd-score-summary {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 0.5rem; margin-bottom: 0.85rem;
                }
                .psd-sum-item {
                    border-radius: 10px; padding: 0.6rem;
                    text-align: center; display: flex;
                    flex-direction: column; gap: 3px;
                }
                .psd-sum-item.purple { background: rgba(108,63,255,0.08); }
                .psd-sum-item.green  { background: rgba(16,185,129,0.08); }
                .psd-sum-item.amber  { background: rgba(245,158,11,0.08); }
                .psd-sum-item.teal   { background: rgba(20,184,166,0.08); }
                .psd-sum-val {
                    font-size: 1.35rem; font-weight: 800; line-height: 1;
                    color: var(--color-text);
                }
                .psd-sum-lab { font-size: 0.7rem; color: var(--color-text-secondary); font-weight: 600; }
                .psd-side-stat-row {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0.45rem 0;
                    border-bottom: 1px solid rgba(108,63,255,0.06);
                    font-size: 0.82rem;
                }
                .psd-side-stat-row:last-child { border-bottom: none; }
                .psd-side-stat-row span { color: var(--color-text-secondary); }
                .psd-side-stat-row strong { color: var(--color-text); font-weight: 700; }
                .psd-side-empty { font-size: 0.85rem; color: var(--color-text-secondary); text-align: center; margin: 0.5rem 0; }
                .psd-back-side {
                    display: flex; align-items: center; gap: 6px;
                    padding: 0.65rem 1rem;
                    background: rgba(108,63,255,0.08);
                    border: 1px solid rgba(108,63,255,0.18);
                    border-radius: 12px;
                    font-size: 0.85rem; font-weight: 700; color: #6c3fff;
                    text-decoration: none; transition: all 0.2s;
                }
                .psd-back-side:hover { background: rgba(108,63,255,0.15); color: #6c3fff; }

                @media (max-width: 900px) {
                    .psd-body-layout { grid-template-columns: 1fr; }
                    .psd-sidebar { order: -1; }
                    .psd-score-summary { grid-template-columns: repeat(4, 1fr); }
                }

                /* BREADCRUMB */
                .psd-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                }

                .psd-breadcrumb-link {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: #7c3aed;
                    font-weight: 600;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .psd-breadcrumb-link:hover { opacity: 0.7; }

                .psd-breadcrumb-sep {
                    color: var(--color-text-secondary);
                }

                .psd-breadcrumb-current {
                    color: var(--color-text-secondary);
                    font-weight: 500;
                }

                /* HERO */
                .psd-hero {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                    padding: 2rem;
                    border: 1px solid var(--glass-border);
                }

                .psd-hero-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #6c3fff 0%, #a78bfa 60%, #c084fc 100%);
                    opacity: 1;
                }

                .psd-hero-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .psd-hero-avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 18px;
                    background: rgba(255,255,255,0.25);
                    backdrop-filter: blur(8px);
                    border: 2px solid rgba(255,255,255,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.4rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .psd-hero-name {
                    color: white;
                    font-size: 1.6rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem 0;
                }

                .psd-hero-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .psd-meta-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(6px);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 99px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                /* INFO GRID */
                .psd-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    margin-bottom: 1.25rem;
                }

                .psd-info-card,
                .psd-scores-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--glass-border);
                    border-radius: 18px;
                    padding: 1.5rem;
                }

                .psd-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid var(--glass-border);
                }

                .psd-card-header h3 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0;
                }

                .psd-card-icon {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .psd-card-icon.purple {
                    background: rgba(108, 63, 255, 0.12);
                    color: #6c3fff;
                }

                .psd-card-icon.green {
                    background: rgba(16, 185, 129, 0.12);
                    color: #10b981;
                }

                .psd-card-icon.amber {
                    background: rgba(245, 158, 11, 0.12);
                    color: #f59e0b;
                }

                /* INFO ROWS */
                .psd-info-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .psd-info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.6rem;
                }

                .psd-info-row-icon {
                    color: #a78bfa;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .psd-info-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    min-width: 80px;
                }

                .psd-info-value {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--color-text);
                    flex: 1;
                    word-break: break-word;
                }

                /* SCORES */
                .psd-scores-card {
                    margin-bottom: 0;
                }

                .psd-scores-loading {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1.5rem 0;
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .psd-scores-empty {
                    text-align: center;
                    padding: 2rem;
                    color: var(--color-text-secondary);
                }

                .psd-scores-empty svg {
                    margin: 0 auto 0.75rem;
                    opacity: 0.5;
                }

                .psd-table-wrap {
                    overflow-x: auto;
                    margin: 0 -0.25rem;
                }

                .psd-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.875rem;
                    min-width: 700px;
                }

                .psd-table th {
                    padding: 0.6rem 0.75rem;
                    text-align: left;
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: var(--color-text-secondary);
                    background: rgba(108, 63, 255, 0.04);
                    border-bottom: 2px solid rgba(108, 63, 255, 0.1);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                }

                .psd-table td {
                    padding: 0.65rem 0.75rem;
                    border-bottom: 1px solid var(--glass-border);
                    vertical-align: middle;
                }

                .psd-table tr:last-child td { border-bottom: none; }

                .psd-table tr:hover td {
                    background: rgba(108, 63, 255, 0.03);
                }

                .psd-td-exam {
                    font-weight: 600;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .psd-td-date {
                    white-space: nowrap;
                    color: var(--color-text-secondary);
                    font-size: 0.82rem;
                }

                .psd-score-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    padding: 3px 10px;
                    border-radius: 99px;
                    font-size: 0.82rem;
                    font-weight: 700;
                }

                .psd-pct {
                    font-weight: 500;
                    font-size: 0.75rem;
                }

                .psd-source-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 8px;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .psd-source-badge.online {
                    background: rgba(16, 185, 129, 0.1);
                    color: #059669;
                }

                .psd-source-badge.manual {
                    background: rgba(59, 130, 246, 0.1);
                    color: #1d4ed8;
                }

                /* PAGINATION */
                .psd-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid var(--glass-border);
                }

                .psd-page-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 0.45rem 0.9rem;
                    border-radius: 10px;
                    border: 1.5px solid rgba(108, 63, 255, 0.25);
                    background: transparent;
                    color: #7c3aed;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .psd-page-btn:hover:not(:disabled) {
                    background: rgba(108, 63, 255, 0.08);
                }

                .psd-page-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .psd-page-info {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                }

                /* LOADING / NOT FOUND */
                .psd-loading, .psd-notfound {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--color-text-secondary);
                }

                .psd-spinner-box {
                    width: 60px; height: 60px;
                    border-radius: 16px;
                    background: rgba(108, 63, 255, 0.1);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                }

                .psd-notfound-icon {
                    width: 72px; height: 72px;
                    border-radius: 20px;
                    background: rgba(108, 63, 255, 0.1);
                    color: #7c3aed;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                }

                .psd-notfound h3 {
                    font-size: 1.15rem;
                    margin-bottom: 1rem;
                }

                .psd-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.65rem 1.25rem;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6c3fff, #a78bfa);
                    color: white;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .psd-back-btn:hover {
                    transform: translateY(-1px);
                    color: white;
                }

                /* RESPONSIVE */
                @media (max-width: 640px) {
                    .psd-info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="psd-info-row">
            <span className="psd-info-row-icon">{icon}</span>
            <span className="psd-info-label">{label}</span>
            <span className="psd-info-value">{value || '—'}</span>
        </div>
    );
}

const spinStyle = `
    .psd-spinner {
        color: #7c3aed;
        animation: psd-spin 1s linear infinite;
    }
    @keyframes psd-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
