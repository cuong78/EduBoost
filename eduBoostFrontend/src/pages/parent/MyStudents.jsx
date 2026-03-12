import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Loader2, User, UserPlus, GraduationCap, Calendar,
    Star, BookOpen, ChevronRight, Info, KeyRound, TrendingUp, Bell
} from 'lucide-react';
import { parentService } from '../../services/parentService';
import { showErrorToast } from '../../utils/show-toast';

const RELATIONSHIP_LABELS = {
    father: 'Bố', mother: 'Mẹ', grandfather: 'Ông',
    grandmother: 'Bà', guardian: 'Người giám hộ', other: 'Khác',
};
const RELATIONSHIP_ICONS = {
    father: '👨', mother: '👩', grandfather: '👴',
    grandmother: '👵', guardian: '🤝', other: '👤',
};
const AVATAR_COLORS = [
    'linear-gradient(135deg, #6c3fff, #a78bfa)',
    'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #ef4444, #f87171)',
];

export default function MyStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters] = useState({ status: 'active', sortBy: 'linkedAt', order: 'desc' });

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await parentService.getMyStudents(filters);
            const list = Array.isArray(data) ? data : data?.data ?? data?.students ?? [];
            setStudents(list);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được danh sách');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStudents(); }, []);

    const list = Array.isArray(students) ? students : [];

    const getInitials = (name) => {
        if (!name) return 'HS';
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
    };

    const uniqueClasses = new Set(
        list.map(i => i.class?.classId ?? i.student?.class?.classId).filter(Boolean)
    ).size;

    return (
        <div className="my-students-page">

            {/* Page Header */}
            <div className="ms-header">
                <div className="ms-header-left">
                    <div className="ms-header-icon">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1>Con của tôi</h1>
                        <p>Theo dõi tiến độ học tập của con em</p>
                    </div>
                </div>
                <Link to="/parent/link" className="ms-add-btn">
                    <UserPlus size={18} />
                    <span>Thêm học sinh</span>
                </Link>
            </div>

            {/* 2-column layout */}
            <div className="ms-layout">

                {/* LEFT: main content */}
                <div className="ms-main-col">
                    {loading ? (
                        <div className="ms-loading-state">
                            <div className="ms-spinner-wrap">
                                <Loader2 size={36} className="ms-spinner" />
                            </div>
                            <p>Đang tải danh sách...</p>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="ms-empty-state">
                            <div className="ms-empty-icon">
                                <Users size={48} />
                            </div>
                            <h3>Chưa có học sinh nào</h3>
                            <p>Dùng mã mời từ giáo viên để kết nối với con em của bạn</p>
                            <Link to="/parent/link" className="ms-add-btn">
                                <UserPlus size={18} />
                                <span>Nhập mã mời</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="ms-count-bar">
                                <span className="ms-count-badge">{list.length} học sinh</span>
                            </div>
                            <div className="ms-grid">
                                {list.map((item, idx) => {
                                    const s = item.student ?? item;
                                    const rel = item.relationship?.toLowerCase?.() ?? item.relationship;
                                    const classInfo = item.class ?? s.class;
                                    const latestScore = item.latestScore;
                                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                                    return (
                                        <Link
                                            key={item.linkId ?? s.studentId}
                                            to={`/parent/students/${s.studentId}`}
                                            className="ms-card"
                                        >
                                            <div className="ms-card-accent" style={{ background: avatarColor }} />
                                            <div className="ms-card-body">
                                                <div className="ms-student-info">
                                                    <div className="ms-avatar" style={{ background: avatarColor }}>
                                                        {getInitials(s.fullName)}
                                                    </div>
                                                    <div className="ms-student-text">
                                                        <h3 className="ms-student-name">{s.fullName}</h3>
                                                        <span className="ms-student-code">
                                                            Mã: {s.studentCode ?? s.studentId}
                                                        </span>
                                                    </div>
                                                    {item.isPrimary && (
                                                        <span className="ms-primary-badge">
                                                            <Star size={11} /> Chính
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ms-info-rows">
                                                    <div className="ms-info-row">
                                                        <span className="ms-info-icon rel-icon">
                                                            {RELATIONSHIP_ICONS[rel] ?? '👤'}
                                                        </span>
                                                        <span className="ms-info-value">
                                                            {RELATIONSHIP_LABELS[rel] ?? rel ?? '—'}
                                                        </span>
                                                    </div>
                                                    {classInfo && (
                                                        <div className="ms-info-row">
                                                            <GraduationCap size={15} className="ms-info-icon" />
                                                            <span className="ms-info-value">
                                                                {classInfo.className ?? classInfo.name ?? classInfo}
                                                                {classInfo.gradeLevel ? ` · Khối ${classInfo.gradeLevel}` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.linkedAt && (
                                                        <div className="ms-info-row">
                                                            <Calendar size={15} className="ms-info-icon" />
                                                            <span className="ms-info-value">
                                                                Kết nối: {new Date(item.linkedAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {latestScore && (
                                                        <div className="ms-info-row">
                                                            <BookOpen size={15} className="ms-info-icon" />
                                                            <span className="ms-info-value">
                                                                Điểm gần nhất: <strong>
                                                                    {latestScore.score}{latestScore.maxScore ? `/${latestScore.maxScore}` : ''}
                                                                </strong>
                                                                {latestScore.subjectName ? ` (${latestScore.subjectName})` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ms-card-footer">
                                                    <span className="ms-view-detail">
                                                        <User size={14} /> Xem chi tiết
                                                    </span>
                                                    <ChevronRight size={16} className="ms-chevron" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT: sidebar */}
                <aside className="ms-sidebar">

                    {/* Stats */}
                    <div className="ms-side-card">
                        <div className="ms-side-card-title">
                            <TrendingUp size={16} /> Tổng quan
                        </div>
                        <div className="ms-stats-row">
                            <div className="ms-stat">
                                <span className="ms-stat-num">{list.length}</span>
                                <span className="ms-stat-label">Học sinh</span>
                            </div>
                            <div className="ms-stat">
                                <span className="ms-stat-num">{list.filter(i => i.isPrimary).length}</span>
                                <span className="ms-stat-label">Giám hộ chính</span>
                            </div>
                            <div className="ms-stat">
                                <span className="ms-stat-num">{uniqueClasses}</span>
                                <span className="ms-stat-label">Lớp học</span>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="ms-side-card tips">
                        <div className="ms-side-card-title">
                            <Info size={16} /> Mẹo hữu ích
                        </div>
                        <ul className="ms-tips-list">
                            <li><BookOpen size={13} /> Nhấn vào thẻ học sinh để xem chi tiết điểm số và kết quả học tập.</li>
                            <li><Bell size={13} /> Điểm thi trực tuyến được cập nhật ngay sau khi bài kiểm tra kết thúc.</li>
                            <li><Star size={13} /> Huy hiệu <strong>Chính</strong> cho thấy bạn là người giám hộ chính của học sinh.</li>
                        </ul>
                    </div>

                </aside>
            </div>

            <style>{`
                .my-students-page {
                    width: 100%;
                    padding-bottom: 2rem;
                }

                /* HEADER */
                .ms-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.75rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .ms-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .ms-header-icon {
                    width: 52px; height: 52px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #6c3fff, #a78bfa);
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    box-shadow: 0 6px 16px rgba(108, 63, 255, 0.28);
                    flex-shrink: 0;
                }
                .ms-header-left h1 {
                    font-size: 1.6rem; font-weight: 800;
                    margin: 0 0 0.2rem 0;
                    background: linear-gradient(135deg, #6c3fff, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .ms-header-left p { margin: 0; color: var(--color-text-secondary); font-size: 0.9rem; }

                .ms-add-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 0.65rem 1.25rem; border-radius: 12px;
                    background: linear-gradient(135deg, #6c3fff, #a78bfa);
                    color: white; font-weight: 700; font-size: 0.9rem;
                    text-decoration: none; border: none; cursor: pointer;
                    transition: all 0.25s;
                    box-shadow: 0 4px 12px rgba(108, 63, 255, 0.3);
                    white-space: nowrap;
                }
                .ms-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(108, 63, 255, 0.4);
                    color: white;
                }

                /* 2-COL LAYOUT */
                .ms-layout {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 1.5rem;
                    align-items: start;
                }

                /* COUNT BAR */
                .ms-count-bar { margin-bottom: 1.25rem; }
                .ms-count-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: rgba(108, 63, 255, 0.1);
                    color: #6c3fff;
                    border: 1px solid rgba(108, 63, 255, 0.2);
                    padding: 4px 12px; border-radius: 99px;
                    font-size: 0.82rem; font-weight: 700;
                }

                /* CARD GRID */
                .ms-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1.25rem;
                }

                /* STUDENT CARD */
                .ms-card {
                    border-radius: 20px; overflow: hidden;
                    text-decoration: none; color: inherit;
                    background: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--glass-border);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                    transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                    display: block;
                }
                .ms-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 32px rgba(108, 63, 255, 0.15);
                    border-color: rgba(108, 63, 255, 0.3);
                }
                .ms-card-accent { height: 5px; width: 100%; }
                .ms-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

                .ms-student-info { display: flex; align-items: center; gap: 0.9rem; }
                .ms-avatar {
                    width: 48px; height: 48px; border-radius: 13px;
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: 800; font-size: 0.95rem;
                    flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .ms-student-text { flex: 1; min-width: 0; }
                .ms-student-name {
                    font-size: 1rem; font-weight: 700; margin: 0 0 0.2rem 0;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .ms-student-code { font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 500; }
                .ms-primary-badge {
                    display: inline-flex; align-items: center; gap: 3px;
                    font-size: 0.72rem; font-weight: 700;
                    background: rgba(245, 158, 11, 0.12); color: #d97706;
                    border: 1px solid rgba(245, 158, 11, 0.25);
                    padding: 2px 8px; border-radius: 99px;
                    white-space: nowrap; flex-shrink: 0;
                }

                .ms-info-rows {
                    display: flex; flex-direction: column; gap: 0.5rem;
                    padding: 0.75rem; background: rgba(108, 63, 255, 0.04);
                    border-radius: 11px; border: 1px solid rgba(108, 63, 255, 0.08);
                }
                .ms-info-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--color-text-secondary); }
                .ms-info-icon { color: #7c3aed; flex-shrink: 0; }
                .rel-icon { font-size: 1rem; line-height: 1; }
                .ms-info-value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .ms-info-value strong { color: var(--color-text); font-weight: 700; }

                .ms-card-footer {
                    display: flex; align-items: center; justify-content: space-between;
                    padding-top: 0.5rem; border-top: 1px solid var(--glass-border);
                }
                .ms-view-detail { display: flex; align-items: center; gap: 5px; font-size: 0.85rem; font-weight: 600; color: #7c3aed; }
                .ms-chevron { color: #a78bfa; transition: transform 0.2s; }
                .ms-card:hover .ms-chevron { transform: translateX(4px); }

                /* EMPTY / LOADING */
                .ms-empty-state {
                    text-align: center; padding: 3.5rem 2rem;
                    border-radius: 20px;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    backdrop-filter: blur(12px);
                }
                .ms-empty-icon {
                    width: 72px; height: 72px; border-radius: 20px;
                    background: linear-gradient(135deg, #6c3fff, #a78bfa);
                    display: flex; align-items: center; justify-content: center;
                    color: white; margin: 0 auto 1.25rem;
                    box-shadow: 0 8px 24px rgba(108, 63, 255, 0.28);
                }
                .ms-empty-state h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
                .ms-empty-state p { color: var(--color-text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem; }
                .ms-loading-state { text-align: center; padding: 4rem 2rem; color: var(--color-text-secondary); }
                .ms-spinner-wrap {
                    width: 64px; height: 64px; border-radius: 18px;
                    background: rgba(108, 63, 255, 0.08);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                }
                .ms-spinner { color: #7c3aed; animation: ms-spin 1s linear infinite; }
                @keyframes ms-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* SIDEBAR */
                .ms-sidebar { display: flex; flex-direction: column; gap: 1rem; }
                .ms-side-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 1.25rem;
                }
                .ms-side-card.tips {
                    background: rgba(108, 63, 255, 0.04);
                    border-color: rgba(108, 63, 255, 0.12);
                }
                .ms-side-card-title {
                    display: flex; align-items: center; gap: 7px;
                    font-size: 0.875rem; font-weight: 700;
                    color: #6c3fff; margin-bottom: 1rem;
                    padding-bottom: 0.6rem;
                    border-bottom: 1px solid rgba(108, 63, 255, 0.12);
                }
                .ms-stats-row {
                    display: flex; gap: 0.5rem;
                }
                .ms-stat {
                    flex: 1; text-align: center;
                    padding: 0.75rem 0.5rem;
                    background: rgba(108, 63, 255, 0.06);
                    border-radius: 12px;
                }
                .ms-stat-num {
                    display: block;
                    font-size: 1.5rem; font-weight: 800;
                    color: #6c3fff; line-height: 1;
                    margin-bottom: 4px;
                }
                .ms-stat-label { font-size: 0.72rem; color: var(--color-text-secondary); font-weight: 600; }
                .ms-side-desc { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0 0 1rem 0; line-height: 1.6; }
                .ms-side-action {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: 0.85rem; font-weight: 700; color: #6c3fff;
                    background: rgba(108, 63, 255, 0.1);
                    border: 1px solid rgba(108, 63, 255, 0.2);
                    padding: 0.5rem 0.9rem; border-radius: 10px;
                    text-decoration: none; transition: all 0.2s;
                }
                .ms-side-action:hover {
                    background: rgba(108, 63, 255, 0.18);
                    color: #6c3fff;
                }
                .ms-tips-list {
                    list-style: none; padding: 0; margin: 0;
                    display: flex; flex-direction: column; gap: 0.65rem;
                }
                .ms-tips-list li {
                    display: flex; align-items: flex-start; gap: 7px;
                    font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.5;
                }
                .ms-tips-list li svg { flex-shrink: 0; color: #a78bfa; margin-top: 2px; }
                .ms-tips-list li strong { color: var(--color-text); }

                /* RESPONSIVE */
                @media (max-width: 900px) {
                    .ms-layout { grid-template-columns: 1fr; }
                    .ms-sidebar { order: -1; }
                }
            `}</style>
        </div>
    );
}