import { useState, useEffect } from 'react';
import {
    Clock,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    Calendar,
    Search,
    Filter,
    BookOpen,
    Trophy,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { examService } from '../../services/examService';

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

const ExamCard = ({ title, course, duration, deadline, status, id, examId, submittedAttemptCode }) => {
    const statusConfig = {
        'Available': {
            class: 'status-available',
            icon: Clock,
            label: 'Đang mở',
            action: 'Làm bài ngay',
            btnClass: 'btn-primary'
        },
        'Completed': {
            class: 'status-completed',
            icon: CheckCircle,
            label: 'Đã hoàn thành',
            action: 'Xem lại bài',
            btnClass: 'btn-secondary'
        },
        'SubmittedPending': {
            class: 'status-completed',
            icon: CheckCircle,
            label: 'Đã nộp — chờ công bố điểm',
            action: 'Xem lại bài',
            btnClass: 'btn-secondary'
        },
        'Missed': {
            class: 'status-missed',
            icon: AlertCircle,
            label: 'Đã bỏ lỡ',
            action: 'Không khả dụng',
            btnClass: 'btn-disabled'
        },
    };

    const config = statusConfig[status] || statusConfig['Available'];
    const Icon = config.icon;
    const reviewTo = submittedAttemptCode ? `/student/exam-review/${submittedAttemptCode}` : null;

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
                {status === 'Available' ? (
                    <Link to={`/student/exam/${examId}?scheduleId=${id}`} className={`btn ${config.btnClass} full-width`}>
                        {config.action} <ArrowRight size={18} />
                    </Link>
                ) : status === 'Completed' || status === 'SubmittedPending' ? (
                    reviewTo ? (
                        <Link to={reviewTo} className={`btn ${config.btnClass} full-width`}>
                            {config.action} <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <button className={`btn ${config.btnClass} full-width`} disabled>
                            {config.action}
                        </button>
                    )
                ) : (
                    <button className={`btn ${config.btnClass} full-width`} disabled={true}>
                        {status === 'Missed' ? 'Kỳ thi đã qua' : status === 'Late' ? 'Bạn đã trễ kì thi' : config.action}
                    </button>
                )}
            </div>
        </div>
    );
};

const ExamList = () => {
    const [filter, setFilter] = useState('All');
    const [allExams, setAllExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        <ExamCard key={exam.id} {...exam} />
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
                    border: 1px solid #e5e7eb;
                    color: var(--color-text-secondary);
                    gap: 0.5rem;
                }
                
                .btn-outline:hover {
                    background: #f9fafb;
                }

                .btn-secondary {
                    background: #e0e7ff; /* indigo-100 */
                    color: #4f46e5; /* indigo-600 */
                }
                
                .btn-secondary:hover {
                    background: #c7d2fe;
                }

                .btn-disabled {
                    background: #f3f4f6;
                    color: #9ca3af;
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

                .text-green { color: #10b981; background: #d1fae5; }
                .text-indigo { color: #6366f1; background: #e0e7ff; }
                .text-yellow { color: #f59e0b; background: #fef3c7; }

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
                    border-bottom: 1px solid #e5e7eb;
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
                .status-missed { background: #fee2e2; color: #b91c1c; }

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
                    border: 2px dashed #e5e7eb;
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
