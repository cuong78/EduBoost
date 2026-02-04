import { Users, BookOpen, Star, TrendingUp, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, trend, colorClass }) => (
    <div className="stat-card glass">
        <div className="stat-header">
            <div>
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div className={`stat-icon-wrapper ${colorClass}`}>
                <Icon size={24} color="white" />
            </div>
        </div>
        <div className="stat-trend">
            <span className="trend-value positive">
                <TrendingUp size={16} /> {trend}
            </span>
            <span className="trend-label">so với tháng trước</span>
        </div>
    </div>
);

const TeacherDashboard = () => {
    const stats = [
        { icon: Users, label: "Tổng số học sinh", value: "156", trend: "+12%", colorClass: "bg-indigo" },
        { icon: Star, label: "Đánh giá trung bình", value: "4.8", trend: "+0.2", colorClass: "bg-yellow" },
    ];

    const recentActivity = [
        { id: 1, user: "Minh Anh", initial: "M", action: "đã nộp bài tập", target: "Đại số II Cuối kỳ", time: "2 giờ trước" },
        { id: 2, user: "Hoàng Nam", initial: "H", action: "đã đặt câu hỏi trong", target: "Vật lý 101", time: "4 giờ trước" },
        { id: 3, user: "Hệ thống", initial: "S", action: "đã tạo báo cáo cho", target: "Tương tác tuần", time: "1 ngày trước" },
    ];

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Bảng điều khiển Giáo viên</h1>
                    <p className="page-subtitle">Chào mừng trở lại, Cô Lan! Dưới đây là hoạt động hôm nay.</p>
                </div>
                <Link to="/teacher/create-question" className="btn btn-primary create-quiz-btn">
                    + Tạo bài kiểm tra mới
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="content-grid">
                {/* Recent Activity */}
                <div className="glass card-panel">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Clock size={20} className="icon-indigo" /> Hoạt động gần đây
                        </h3>
                        <button className="btn-link">Xem tất cả</button>
                    </div>
                    <div className="activity-list">
                        {recentActivity.map(item => (
                            <div key={item.id} className="activity-item">
                                <div className="activity-avatar">{item.initial}</div>
                                <div>
                                    <p className="activity-text">
                                        <span className="user-name">{item.user}</span> {item.action} <span className="target-name">{item.target}</span>
                                    </p>
                                    <p className="activity-time">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

               
            </div>

            <style>{`
        :root {
            --color-text-primary: #1f2937; /* gray-800 */
            --color-text-secondary: #6b7280; /* gray-500 */
            --color-accent-1: #6366f1; /* indigo-500 */
            --color-accent-2: #a855f7; /* purple-500 */
            --color-accent-3: #f59e0b; /* yellow-500 */
        }

        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--color-text-primary);
            margin-bottom: 0.25rem;
        }

        .page-subtitle {
            color: var(--color-text-secondary);
        }

        .create-quiz-btn {
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
            text-decoration: none;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            padding: 1.5rem;
            border-radius: 16px;
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            font-weight: 500;
            margin-bottom: 0.25rem;
        }

        .stat-value {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--color-text-primary);
            margin: 0;
        }

        .stat-icon-wrapper {
            padding: 0.75rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .bg-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .bg-purple { background: linear-gradient(135deg, #a855f7, #9333ea); }
        .bg-yellow { background: linear-gradient(135deg, #f59e0b, #d97706); }

        .stat-trend {
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }

        .trend-value {
            color: #22c55e;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .trend-label {
            color: #94a3b8;
        }

        /* Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        @media (min-width: 1024px) {
            .content-grid {
                grid-template-columns: 1fr 1fr;
            }
        }

        .card-panel {
            padding: 1.5rem;
            border-radius: 16px;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .card-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--color-text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0;
        }

        .icon-indigo { color: var(--color-accent-1); }
        .icon-purple { color: var(--color-accent-2); }

        .btn-link {
            background: none;
            border: none;
            color: var(--color-accent-1);
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
        }
        .btn-link:hover { text-decoration: underline; }

        /* Activity List */
        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .activity-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 0.75rem;
            border-radius: 12px;
            transition: background 0.2s;
        }
        .activity-item:hover {
            background: rgba(255,255,255,0.5);
        }

        .activity-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0e7ff;
            color: var(--color-accent-1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .activity-text {
            font-size: 0.95rem;
            color: var(--color-text-primary);
            margin: 0;
        }
        .user-name { font-weight: 600; }
        .target-name { color: var(--color-accent-1); font-weight: 500; }
        .activity-time { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }

        /* Schedule List */
        .schedule-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .schedule-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: rgba(255,255,255,0.4);
            border-right: 1px solid rgba(255,255,255,0.5);
            border-radius: 0 12px 12px 0;
            border-left: 4px solid var(--color-accent-1);
        }

        .schedule-time {
            text-align: center;
            min-width: 60px;
        }

        .day-label {
            font-size: 0.7rem;
            text-transform: uppercase;
            font-weight: 700;
            color: #94a3b8;
        }

        .time-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-accent-1);
        }

        .class-name {
            margin: 0;
            font-weight: 700;
            color: var(--color-text-primary);
            font-size: 1rem;
        }

        .class-meta {
            margin: 0;
            font-size: 0.875rem;
            color: var(--color-text-secondary);
        }
      `}</style>
        </div>
    );
};

export default TeacherDashboard;
