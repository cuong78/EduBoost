import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2, User, Unlink, UserPlus } from 'lucide-react';
import { parentService } from '../../services/parentService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const RELATIONSHIP_LABELS = {
    father: 'Bố',
    mother: 'Mẹ',
    grandfather: 'Ông',
    grandmother: 'Bà',
    guardian: 'Người giám hộ',
    other: 'Khác',
};

export default function MyStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unlinkTarget, setUnlinkTarget] = useState(null);
    const [unlinking, setUnlinking] = useState(false);
    const [filters, setFilters] = useState({ status: 'active', sortBy: 'linkedAt', order: 'desc' });

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

    useEffect(() => {
        loadStudents();
    }, [filters.status, filters.sortBy, filters.order]);

   

    const list = Array.isArray(students) ? students : [];

    return (
        <div className="my-students-page">
            <div className="page-header">
                <div>
                    <h2>Con của tôi</h2>
                    <p>Danh sách học sinh đã kết nối</p>
                </div>
                <Link to="/parent/link" className="btn btn-primary">
                    <UserPlus size={18} /> Thêm học sinh
                </Link>
            </div>

            {loading ? (
                <div className="empty-state glass">
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải...</p>
                </div>
            ) : list.length === 0 ? (
                <div className="empty-state glass">
                    <Users size={48} />
                    <p>Bạn chưa kết nối với học sinh nào. Dùng mã mời từ giáo viên để kết nối.</p>
                    <Link to="/parent/link" className="btn btn-primary">Nhập mã mời</Link>
                </div>
            ) : (
                <div className="students-grid">
                    {list.map((item) => {
                        const s = item.student ?? item;
                        const linkId = item.linkId ?? item.studentId;
                        const rel = item.relationship?.toLowerCase?.() ?? item.relationship;
                        const classInfo = item.class ?? s.class;
                        return (
                            <div key={linkId ?? s.studentId} className="student-card glass">
                                <div className="card-header">
                                    <div className="avatar">{s.fullName?.substring(0, 2).toUpperCase() ?? 'HS'}</div>
                                    <div>
                                        <h3>{s.fullName}</h3>
                                        <p className="meta">Mã HS: {s.studentCode ?? s.studentId}</p>
                                        {classInfo && (
                                            <p className="meta">Lớp: {classInfo.className ?? classInfo.name ?? classInfo}</p>
                                        )}
                                        {classInfo?.teacher && (
                                            <p className="meta">GV: {classInfo.teacher.fullName ?? classInfo.teacher.name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="card-meta">
                                    <span className="relationship">{RELATIONSHIP_LABELS[rel] ?? rel}</span>
                                    {item.isPrimary && <span className="badge-primary">Chính</span>}
                                    {item.linkedAt && <span className="linked-at">Kết nối: {new Date(item.linkedAt).toLocaleDateString('vi-VN')}</span>}
                                </div>
                                <div className="card-actions">
                                    <Link to={`/parent/students/${s.studentId}`} className="btn btn-primary btn-sm">
                                        <User size={14} /> Chi tiết
                                    </Link>
                                   
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

          

            <style>{`
                .my-students-page { max-width: 1000px; }
                .page-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
                .page-header h2 { margin-bottom: 0.25rem; }
                .page-header p { color: var(--color-text-secondary); font-size: 0.95rem; }
                .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
                .student-card { padding: 1.5rem; border-radius: 16px; }
                .card-header { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .card-header .avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--color-accent-1); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
                .card-header h3 { font-size: 1.15rem; margin: 0 0 0.25rem 0; }
                .meta { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }
                .card-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
                .relationship { font-weight: 600; color: var(--color-accent-1); }
                .badge-primary { font-size: 0.75rem; padding: 0.2rem 0.5rem; background: rgba(34,197,94,0.15); color: #15803d; border-radius: 9999px; }
                .linked-at { font-size: 0.85rem; color: var(--color-text-secondary); }
                .card-actions { display: flex; gap: 0.5rem; }
                .card-actions .btn.danger { background: rgba(239,68,68,0.1); color: #b91c1c; }
                .card-actions .btn.danger:hover { background: rgba(239,68,68,0.2); }
                .empty-state { text-align: center; padding: 3rem 2rem; border-radius: 16px; }
                .empty-state svg { color: var(--color-text-secondary); margin-bottom: 1rem; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
