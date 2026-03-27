import { useMemo, useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, ArrowRight, Calendar, BookOpen, Trophy, Loader2, Lock, Filter, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { showErrorToast } from '../../utils/show-toast';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="stat-card glass">
        <div className={`stat-icon ${colorClass}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="stat-label">{label}</p>
            <h3 className="stat-value">{value}</h3>
        </div>
    </div>
);

const ExamCard = ({ title, course, duration, deadline, status, onOpenDetail }) => {
    const statusConfig = {
        'Available': {
            class: 'status-available',
            icon: Clock,
            label: 'Đang mở',
            action: 'Xem chi tiết',
            btnClass: 'btn-primary'
        },
        'Completed': {
            class: 'status-completed',
            icon: CheckCircle,
            label: 'Đã hoàn thành',
            action: 'Xem chi tiết',
            btnClass: 'btn-secondary'
        },
        'SubmittedPending': {
            class: 'status-completed',
            icon: CheckCircle,
            label: 'Đã nộp — chờ công bố điểm',
            action: 'Xem chi tiết',
            btnClass: 'btn-secondary'
        },
        'Missed': {
            class: 'status-missed',
            icon: AlertCircle,
            label: 'Đã bỏ lỡ',
            action: 'Không khả dụng',
            btnClass: 'btn-disabled'
        },
        'Upcoming': {
            class: 'status-upcoming',
            icon: Calendar,
            label: 'Sắp mở',
            action: 'Xem chi tiết',
            btnClass: 'btn-secondary'
        },
        'Late': {
            class: 'status-missed',
            icon: AlertCircle,
            label: 'Đã trễ',
            action: 'Xem chi tiết',
            btnClass: 'btn-secondary'
        }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    const Icon = config.icon;

    return (
        <div className={`exam-card glass ${status}`}>
            <div className="exam-card-content">
                <div className="exam-header">
                    <span className={`status-badge ${config.class}`}>
                        <Icon size={14} /> {config.label}
                    </span>
                    <span className="course-badge">
                        {course}
                    </span>
                </div>

                <h3 className="exam-title">
                    {title}
                </h3>

                <div className="exam-meta">
                    <div className="meta-item">
                        <Clock size={16} />
                        <span>{duration} phút</span>
                    </div>
                    <div className="meta-item">
                        <Calendar size={16} />
                        <span>{deadline}</span>
                    </div>
                </div>
            </div>

            <div className="exam-actions">
                <button className={`btn ${config.btnClass} full-width`} onClick={onOpenDetail}>
                    {config.action} <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

const ExamList = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [allExams, setAllExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [attempts, setAttempts] = useState([]);
    const [password, setPassword] = useState('');

    useEffect(() => {
        setLoading(true);
        examService.getUpcomingExams()
            .then((data) => {
                // Map API schedule response to ExamCard props
                const mapped = (data || []).map((schedule) => {
                    const now = new Date();
                    const start = new Date(schedule.startTime);
                    const end = new Date(schedule.endTime);
                    const allowLateMinutes = schedule.allowLateMinutes || 0;
                    const latestStart = new Date(start.getTime() + allowLateMinutes * 60000);
                    const isDemo = (schedule.title || schedule.examTitle || '').includes('Demo');

                    let status;
                    if (schedule.studentSubmitted) {
                        status = schedule.scoresPendingAnnouncement ? 'SubmittedPending' : 'Completed';
                    } else if (now > end) {
                        status = 'Missed';
                    } else if (now >= start && now <= end) {
                        if (!isDemo && allowLateMinutes > 0 && now > latestStart) {
                            status = 'Late';
                        } else {
                            status = 'Available';
                        }
                    } else {
                        status = 'Upcoming';
                    }
                    return {
                        id: schedule.id,
                        examId: schedule.examId,
                        title: schedule.title || schedule.examTitle,
                        course: schedule.className || 'Lớp học',
                        duration: schedule.durationMinutes,
                        deadline: new Intl.DateTimeFormat('vi-VN', {
                            day: '2-digit', month: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        }).format(end),
                        status,
                        submittedAttemptCode: schedule.submittedAttemptCode,
                        scoreRevealMode: schedule.scoreRevealMode,
                        maxAttempts: schedule.maxAttempts || 1,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        resultsAnnouncedAt: schedule.resultsAnnouncedAt,
                        needsPassword: Boolean(schedule.hasPassword),
                        raw: schedule,
                    };
                });
                setAllExams(mapped);
            })
            .catch((err) => {
                console.error('Failed to load upcoming exams:', err);
                setError('Không thể tải danh sách bài kiểm tra.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedExam?.id) return;
        setAttemptsLoading(true);
        examService.getStudentScheduleAttempts(selectedExam.id)
            .then((res) => setAttempts(Array.isArray(res) ? res : []))
            .catch(() => {
                setAttempts([]);
                showErrorToast('Không tải được lịch sử lần làm bài');
            })
            .finally(() => setAttemptsLoading(false));
    }, [selectedExam?.id]);

    const available = allExams.filter(e => e.status === 'Available').length;
    const completed = allExams.filter(e => e.status === 'Completed' || e.status === 'SubmittedPending').length;

    const stats = [
        { label: 'Bài tập đang mở', value: String(available), icon: Clock, colorClass: 'text-green' },
        { label: 'Đã hoàn thành', value: String(completed), icon: CheckCircle, colorClass: 'text-indigo' },
        { label: 'Tổng lịch thi', value: String(allExams.length), icon: Trophy, colorClass: 'text-yellow' },
    ];

    const filteredExams = filter === 'All'
        ? allExams
        : allExams.filter(exam => {
            if (filter === 'Missed') return exam.status === 'Missed' || exam.status === 'Late';
            if (filter === 'Completed') return exam.status === 'Completed' || exam.status === 'SubmittedPending';
            return exam.status === filter;
        });

    const attemptCountText = useMemo(() => {
        if (!selectedExam) return '0/0';
        return `${attempts.length}/${selectedExam.maxAttempts || 1}`;
    }, [attempts, selectedExam]);

    const handleTakeExam = () => {
        if (!selectedExam) return;
        const hasPassword = password.trim().length > 0;
        const query = hasPassword
            ? `?scheduleId=${selectedExam.id}&password=${encodeURIComponent(password.trim())}`
            : `?scheduleId=${selectedExam.id}`;
        navigate(`/student/exam/${selectedExam.examId}${query}`);
    };

    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'Available', label: 'Đang mở' },
        { id: 'Upcoming', label: 'Sắp tới' },
        { id: 'Missed', label: 'Đã qua' },
    ];

    return (
        <div className="exam-page-container">
            {/* Header Section */}
            <div className="page-header">
                <div>
                    <h1>
                        <BookOpen className="header-icon" /> Bài kiểm tra của tôi
                    </h1>
                    <p>Quản lý và theo dõi tiến độ học tập của bạn.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline">
                        <Filter size={18} /> Lọc
                    </button>
                    <button className="btn btn-outline">
                        <Search size={18} /> Tìm kiếm
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`tab-btn ${filter === tab.id ? 'active' : ''}`}
                    >
                        {tab.label}
                        {filter === tab.id && (
                            <div className="active-indicator"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Exam Grid */}
            {loading ? (
                <div className="empty-state">
                    <Loader2 size={32} className="spin" />
                    <p>Đang tải bài kiểm tra...</p>
                </div>
            ) : error ? (
                <div className="empty-state">
                    <AlertCircle size={32} />
                    <h3>Lỗi</h3>
                    <p>{error}</p>
                </div>
            ) : filteredExams.length > 0 ? (
                <div className="exam-grid">
                    {filteredExams.map(exam => (
                        <ExamCard key={exam.id} {...exam} onOpenDetail={() => setSelectedExam(exam)} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">
                        <Search size={32} />
                    </div>
                    <h3>Không tìm thấy bài kiểm tra nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc tìm kiếm lại.</p>
                </div>
            )}

            {selectedExam && (
                <div className="ds-modal-overlay" onClick={() => setSelectedExam(null)}>
                    <div className="ds-modal ds-modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="ds-modal-header">
                            <h3 className="ds-modal-title">{selectedExam.title}</h3>
                            <button className="ds-modal-close" onClick={() => setSelectedExam(null)}>x</button>
                        </div>
                        <div className="ds-kpi-grid" style={{ marginBottom: '1rem' }}>
                            <div className="ds-kpi-card ds-kpi-accent-info"><div className="ds-kpi-card-label">Lớp</div><div className="ds-kpi-card-value">{selectedExam.course}</div></div>
                            <div className="ds-kpi-card ds-kpi-accent-primary"><div className="ds-kpi-card-label">Thời lượng</div><div className="ds-kpi-card-value">{selectedExam.duration}p</div></div>
                            <div className="ds-kpi-card ds-kpi-accent-warning"><div className="ds-kpi-card-label">Lần làm</div><div className="ds-kpi-card-value">{attemptCountText}</div></div>
                        </div>
                        <p className="ds-page-subtitle">
                            Mở thi: {new Date(selectedExam.startTime).toLocaleString()} - {new Date(selectedExam.endTime).toLocaleString()}
                        </p>
                        <p className="ds-page-subtitle" style={{ marginBottom: '1rem' }}>
                            Công bố điểm: {selectedExam.scoreRevealMode === 'AFTER_ANNOUNCE'
                                ? (selectedExam.resultsAnnouncedAt ? 'Đã công bố' : 'Chờ giáo viên công bố')
                                : 'Ngay khi nộp bài'}
                        </p>

                        {selectedExam.needsPassword && (
                            <div className="ds-form-group">
                                <label className="ds-label"><Lock size={14} /> Mật khẩu bài thi</label>
                                <input className="ds-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu để vào thi" />
                            </div>
                        )}

                        <div className="ds-card" style={{ marginBottom: '1rem' }}>
                            <div className="ds-card-header">Lịch sử lần làm</div>
                            <div className="ds-card-body ds-card-body-compact">
                                {attemptsLoading ? (
                                    <div className="ds-loading"><Loader2 className="ds-spinner" size={20} /> Đang tải...</div>
                                ) : attempts.length === 0 ? (
                                    <div className="ds-empty-state">Chưa có lần làm nào.</div>
                                ) : (
                                    <table className="ds-table">
                                        <thead>
                                            <tr><th>Lần</th><th>Trạng thái</th><th>Điểm</th><th>Nộp lúc</th><th></th></tr>
                                        </thead>
                                        <tbody>
                                            {attempts.map((a) => (
                                                <tr key={a.attemptCode}>
                                                    <td>{a.attemptNumber}</td>
                                                    <td>{a.status}</td>
                                                    <td>{a.scoresHidden ? 'Chờ công bố' : (a.score ?? '-')}</td>
                                                    <td>{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '-'}</td>
                                                    <td>{a.attemptCode ? <Link to={`/student/exam-review/${a.attemptCode}`}>Xem chi tiết</Link> : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="ds-modal-footer">
                            <button className="ds-btn ds-btn-secondary" onClick={() => setSelectedExam(null)}>Đóng</button>
                            <button
                                className="ds-btn ds-btn-primary"
                                onClick={handleTakeExam}
                                disabled={selectedExam.needsPassword && !password.trim()}
                            >
                                Vào làm bài
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .exam-page-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Header */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .page-header h1 {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .header-icon {
                    color: var(--color-accent-1);
                }

                .page-header p {
                    color: var(--color-text-secondary);
                    font-size: 1.1rem;
                }

                .header-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                /* Buttons */
                .btn-outline {
                    background: white;
                    border: 1px solid var(--ds-border);
                    color: var(--color-text-secondary);
                    gap: 0.5rem;
                }
                
                .btn-outline:hover {
                    background: var(--ds-bg-subtle);
                }

                .btn-secondary {
                    background: #e0e7ff; /* indigo-100 */
                    color: var(--ds-primary-hover); /* indigo-600 */
                }
                
                .btn-secondary:hover {
                    background: #c7d2fe;
                }

                .btn-disabled {
                    background: var(--ds-border-light);
                    color: var(--ds-text-muted);
                    cursor: not-allowed;
                }

                .full-width {
                    width: 100%;
                    gap: 0.5rem;
                }

                /* Stat Cards */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    padding: 1.5rem;
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                }

                .stat-icon {
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background: rgba(255, 255, 255, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .text-green { color: var(--ds-success); background: var(--ds-success-bg); }
                .text-indigo { color: var(--ds-primary); background: #e0e7ff; }
                .text-yellow { color: var(--ds-warning); background: var(--ds-warning-bg); }

                .stat-label {
                    color: var(--color-text-secondary);
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--color-text-primary);
                }

                /* Tabs */
                .tabs-container {
                    display: flex;
                    gap: 0.5rem;
                    border-bottom: 1px solid var(--ds-border);
                    margin-bottom: 2rem;
                    overflow-x: auto;
                }

                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                    border-radius: 0.5rem 0.5rem 0 0;
                }

                .tab-btn:hover {
                    background: rgba(0,0,0,0.02);
                    color: var(--color-text-primary);
                }

                .tab-btn.active {
                    color: var(--color-accent-1);
                    background: white;
                    font-weight: 600;
                }

                .active-indicator {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--color-accent-1);
                }

                /* Exam Grid */
                .exam-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 1.5rem;
                }

                .exam-card {
                    border-radius: 1rem;
                    padding: 1.5rem;
                    display: flex;
                    flex-col;
                    justify-content: space-between;
                    flex-direction: column;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255,255,255,0.5);
                    position: relative;
                    overflow: hidden;
                    min-height: 220px;
                }

                .exam-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    border-color: white;
                }

                .exam-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .status-available { background: #dcfce7; color: #15803d; }
                .status-completed { background: #e0e7ff; color: #4338ca; }
                .status-missed { background: var(--ds-error-bg); color: #b91c1c; }
                .status-upcoming { background: var(--ds-info-bg); color: var(--ds-info-text); }

                .course-badge {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    background: rgba(255,255,255,0.6);
                    padding: 0.25rem 0.75rem;
                    border-radius: 0.5rem;
                    backdrop-filter: blur(4px);
                }

                .exam-title {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    color: var(--color-text-primary);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .exam-meta {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: rgba(243, 244, 246, 0.5);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.375rem;
                }

                .exam-actions {
                    border-top: 1px solid rgba(0,0,0,0.05);
                    padding-top: 1rem;
                    margin-top: auto;
                }

                /* Empty state */
                .empty-state {
                    text-align: center;
                    padding: 4rem 1rem;
                    background: rgba(255,255,255,0.4);
                    border-radius: 1.5rem;
                    border: 2px dashed var(--ds-border);
                }

                .empty-icon {
                    background: white;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    color: var(--color-text-secondary);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .empty-state h3 {
                    font-size: 1.1rem;
                    color: var(--color-text-primary);
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: var(--color-text-secondary);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .exam-page-container {
                        padding: 1rem;
                    }
                    
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExamList;
