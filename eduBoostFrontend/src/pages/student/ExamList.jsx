import { useState, useEffect, useMemo } from 'react';
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
    RefreshCw,
    X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import examAssignmentService from '../../services/examAssignmentService';

/* ── Helper: format datetime to Vietnamese locale ── */
const fmtDateVN = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    let h = d.getHours();
    const period = h >= 12 ? 'chiều' : 'sáng';
    h = h % 12 || 12;
    return `${day}/${month} lúc ${h}:${pad(d.getMinutes())} ${period}`;
};

/* ── Helper: determine display status from assignment data ── */
const getExamStatus = (assignment) => {
    const now = new Date();
    const start = new Date(assignment.startTime);
    const end = new Date(assignment.endTime);
    const status = assignment.status;

    // If student already submitted (check via result presence — we mark on client side)
    if (assignment._submitted) return 'Completed';

    if (status === 'ENDED' || now > end) return 'Missed';
    if (status === 'ACTIVE' || (now >= start && now <= end)) return 'Available';
    if (status === 'SCHEDULED' || now < start) return 'Upcoming';
    return 'Available';
};

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

const ExamCard = ({ title, course, duration, deadline, status, assignmentId, accessCode, gradeLevel }) => {
    const statusConfig = {
        'Available': {
            class: 'status-available',
            icon: Clock,
            label: 'Đang mở',
            action: 'Làm bài ngay',
            btnClass: 'btn-primary'
        },
        'Upcoming': {
            class: 'status-upcoming',
            icon: Calendar,
            label: 'Sắp diễn ra',
            action: 'Chưa đến giờ',
            btnClass: 'btn-disabled'
        },
        'Completed': {
            class: 'status-completed',
            icon: CheckCircle,
            label: 'Đã hoàn thành',
            action: 'Đã nộp bài',
            btnClass: 'btn-secondary'
        },
        'Missed': {
            class: 'status-missed',
            icon: AlertCircle,
            label: 'Đã kết thúc',
            action: 'Hết hạn',
            btnClass: 'btn-disabled'
        },
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
                    {gradeLevel && (
                        <div className="meta-item">
                            <BookOpen size={16} />
                            <span>Khối {gradeLevel}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="exam-actions">
                {status === 'Available' ? (
                    <Link to={`/student/take-exam/${assignmentId}`} className={`btn ${config.btnClass} full-width`}>
                        {config.action} <ArrowRight size={18} />
                    </Link>
                ) : (
                    <button className={`btn ${config.btnClass} full-width`} disabled={status === 'Missed' || status === 'Upcoming'}>
                        {config.action} {status === 'Completed' && <CheckCircle size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

const ExamList = () => {
    const [filter, setFilter] = useState('All');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Fetch assignments from API
    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await examAssignmentService.getStudentAssignments();
            setAssignments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load assignments:', err);
            setError('Không thể tải danh sách bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    // Map assignments to display items
    const allExams = useMemo(() => {
        return assignments.map(a => ({
            assignmentId: a.assignmentId,
            title: a.examTitle || 'Bài kiểm tra',
            course: a.subjectName || 'Chưa xác định',
            duration: a.durationMinutes || 0,
            deadline: fmtDateVN(a.endTime),
            status: getExamStatus(a),
            accessCode: a.accessCode,
            gradeLevel: a.gradeLevel,
        }));
    }, [assignments]);

    // Compute stats
    const stats = useMemo(() => {
        const pending = allExams.filter(e => e.status === 'Available' || e.status === 'Upcoming').length;
        const completed = allExams.filter(e => e.status === 'Completed').length;
        const missed = allExams.filter(e => e.status === 'Missed').length;
        return [
            { label: 'Bài tập đang chờ', value: String(pending), icon: Clock, colorClass: 'text-green' },
            { label: 'Đã hoàn thành', value: String(completed), icon: CheckCircle, colorClass: 'text-indigo' },
            { label: 'Đã kết thúc', value: String(missed), icon: AlertCircle, colorClass: 'text-yellow' },
        ];
    }, [allExams]);

    // Filter and search
    const filteredExams = useMemo(() => {
        let result = filter === 'All'
            ? allExams
            : allExams.filter(exam => exam.status === filter);

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(e =>
                e.title.toLowerCase().includes(term) ||
                e.course.toLowerCase().includes(term)
            );
        }

        return result;
    }, [allExams, filter, searchTerm]);

    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'Available', label: 'Đang mở' },
        { id: 'Upcoming', label: 'Sắp thi' },
        { id: 'Completed', label: 'Đã xong' },
        { id: 'Missed', label: 'Đã kết thúc' },
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
                    <button className="btn btn-outline" onClick={() => setShowSearch(!showSearch)}>
                        {showSearch ? <X size={18} /> : <Search size={18} />} {showSearch ? 'Đóng' : 'Tìm kiếm'}
                    </button>
                    <button className="btn btn-outline" onClick={loadAssignments} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} /> Làm mới
                    </button>
                </div>
            </div>

            {/* Search bar */}
            {showSearch && (
                <div className="search-bar-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên bài kiểm tra hoặc môn học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        autoFocus
                    />
                    {searchTerm && (
                        <button className="search-clear" onClick={() => setSearchTerm('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}

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

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <RefreshCw size={32} className="spin" />
                    <p>Đang tải bài kiểm tra...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <h3>{error}</h3>
                    <button className="btn btn-primary" onClick={loadAssignments}>
                        <RefreshCw size={16} /> Thử lại
                    </button>
                </div>
            ) : filteredExams.length > 0 ? (
                <div className="exam-grid">
                    {filteredExams.map(exam => (
                        <ExamCard key={exam.assignmentId} {...exam} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">
                        {allExams.length === 0 ? <BookOpen size={32} /> : <Search size={32} />}
                    </div>
                    <h3>{allExams.length === 0 ? 'Chưa có bài kiểm tra nào' : 'Không tìm thấy bài kiểm tra nào'}</h3>
                    <p>{allExams.length === 0 ? 'Giáo viên chưa giao bài cho lớp bạn.' : 'Thử thay đổi bộ lọc hoặc tìm kiếm lại.'}</p>
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

                /* Search bar */
                .search-bar-container {
                    position: relative;
                    margin-bottom: 1.5rem;
                }
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    pointer-events: none;
                }
                .search-input {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 48px;
                    border: 2px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                    background: white;
                    box-sizing: border-box;
                }
                .search-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .search-clear {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #94a3b8;
                    padding: 4px;
                    border-radius: 6px;
                }
                .search-clear:hover { background: #f1f5f9; }

                /* Loading */
                .loading-state {
                    text-align: center;
                    padding: 4rem 1rem;
                    color: var(--color-text-secondary);
                }
                .loading-state p {
                    margin-top: 1rem;
                    font-size: 1rem;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Error state */
                .error-state {
                    text-align: center;
                    padding: 4rem 1rem;
                    color: #ef4444;
                }
                .error-state h3 {
                    margin: 1rem 0;
                }
                .error-state .btn {
                    margin-top: 0.5rem;
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
                    background: #e0e7ff;
                    color: var(--ds-primary-hover);
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
                    flex-direction: column;
                    justify-content: space-between;
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
                .status-upcoming { background: #fef3c7; color: #92400e; }
                .status-completed { background: #e0e7ff; color: #4338ca; }
                .status-missed { background: var(--ds-error-bg); color: #b91c1c; }

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
                    flex-wrap: wrap;
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
