import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Unlink } from 'lucide-react';
import { parentService } from '../../services/parentService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function ParentStudentDetail() {
    const { studentId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUnlinkModal, setShowUnlinkModal] = useState(false);
    const [unlinking, setUnlinking] = useState(false);

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

    useEffect(() => {
        loadData();
    }, [studentId]);

    

    if (loading) {
        return (
            <div className="empty-state glass">
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Đang tải...</p>
                <style>{`.empty-state { text-align: center; padding: 3rem; border-radius: 16px; } .empty-state svg { color: var(--color-text-secondary); margin-bottom: 1rem; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="empty-state glass">
                <p>Không tìm thấy thông tin học sinh.</p>
                <Link to="/parent/students" className="btn btn-primary">Về danh sách</Link>
                <style>{`.empty-state { text-align: center; padding: 3rem; border-radius: 16px; }`}</style>
            </div>
        );
    }

    const student = data.student ?? data;
    const classInfo = data.class ?? student.class;
    const teacher = classInfo?.teacher;

    return (
        <div className="parent-student-detail-page">
            <nav className="breadcrumb">
                <Link to="/parent/students">Con của tôi</Link>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <span>{student.fullName}</span>
            </nav>

           
            <div className="detail-card glass">
                <h3>Thông tin học sinh</h3>
                <dl className="info-grid">
                    <dt>Mã HS</dt><dd>{student.studentCode ?? student.studentId}</dd>
                    <dt>Họ tên</dt><dd>{student.fullName}</dd>
                    <dt>Email</dt><dd>{student.email ?? '—'}</dd>
                    <dt>Ngày sinh</dt><dd>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : '—'}</dd>
                    <dt>Giới tính</dt><dd>{student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</dd>
                </dl>
            </div>

            {classInfo && (
                <div className="detail-card glass">
                    <h3>Lớp học</h3>
                    <dl className="info-grid">
                        <dt>Lớp</dt><dd>{classInfo.className ?? classInfo.name ?? classInfo.classId}</dd>
                        <dt>Khối</dt><dd>{classInfo.gradeLevel ?? '—'}</dd>
                        {teacher && (
                            <>
                                <dt>Giáo viên</dt><dd>{teacher.fullName ?? teacher.name ?? teacher.email}</dd>
                                {teacher.email && <><dt>Email GV</dt><dd>{teacher.email}</dd></>}
                            </>
                        )}
                    </dl>
                </div>
            )}

           
            <style>{`
                .parent-student-detail-page { max-width: 720px; }
                .breadcrumb { margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--color-text-secondary); }
                .breadcrumb a { color: var(--color-accent-1); }
                .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .detail-header h2 { margin: 0; }
                .danger-btn { background: rgba(239,68,68,0.1); color: #b91c1c; border: none; }
                .danger-btn:hover { background: rgba(239,68,68,0.2); }
                .detail-card { padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; }
                .detail-card h3 { margin-bottom: 1rem; font-size: 1.1rem; }
                .info-grid { display: grid; grid-template-columns: 120px 1fr; gap: 0.75rem 1.5rem; }
                .info-grid dt { color: var(--color-text-secondary); font-weight: 500; }
            `}</style>
        </div>
    );
}
