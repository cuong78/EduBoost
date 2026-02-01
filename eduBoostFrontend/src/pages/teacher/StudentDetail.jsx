import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Loader2, Pencil, Trash2, Mail, ChevronRight } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function StudentDetail() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadStudent = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const data = await teacherService.getStudentById(studentId);
            setStudent(data);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được thông tin học sinh');
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudent();
    }, [studentId]);

    const handleDelete = async () => {
        if (!studentId) return;
        setDeleting(true);
        try {
            await teacherService.deleteStudent(studentId);
            showSuccessToast('Đã xóa học sinh');
            setShowDeleteModal(false);
            navigate('/teacher/classes');
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Xóa thất bại');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="empty-state glass">
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Đang tải...</p>
                <style>{`.empty-state { text-align: center; padding: 3rem; border-radius: 16px; } .empty-state svg { color: var(--color-text-secondary); margin-bottom: 1rem; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="empty-state glass">
                <p>Không tìm thấy học sinh.</p>
                <Link to="/teacher/classes" className="btn btn-primary">Về danh sách lớp</Link>
                <style>{`.empty-state { text-align: center; padding: 3rem; border-radius: 16px; }`}</style>
            </div>
        );
    }

    return (
        <div className="student-detail-page">
            <nav className="breadcrumb">
                <Link to="/teacher/classes">Lớp học</Link>
                <ChevronRight size={16} />
                <span>Học sinh</span>
                <ChevronRight size={16} />
                <span>{student.fullName}</span>
            </nav>

            <div className="detail-header">
                <div>
                    <h2>{student.fullName}</h2>
                    <p className="meta">Mã HS: {student.studentCode ?? student.studentId} · {student.email}</p>
                </div>
                <div className="header-actions">
                    <Link to={`/teacher/students/${studentId}/invitations`} className="btn btn-primary btn-sm">
                        <Mail size={16} /> Mã mời
                    </Link>
                    <Link to={`/teacher/students/${studentId}/edit`} className="btn btn-glass btn-sm">
                        <Pencil size={16} /> Sửa
                    </Link>
                    <button type="button" className="btn btn-sm danger-btn" onClick={() => setShowDeleteModal(true)}>
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            <div className="detail-card glass">
                <h3>Thông tin cá nhân</h3>
                <dl className="info-grid">
                    <dt>Họ tên</dt><dd>{student.fullName}</dd>
                    <dt>Email</dt><dd>{student.email}</dd>
                    <dt>Mã học sinh</dt><dd>{student.studentCode ?? '—'}</dd>
                    <dt>Số điện thoại</dt><dd>{student.phone ?? '—'}</dd>
                    <dt>Ngày sinh</dt><dd>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : '—'}</dd>
                    <dt>Giới tính</dt><dd>{student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</dd>
                    <dt>Địa chỉ</dt><dd>{student.address ?? '—'}</dd>
                    <dt>Lớp</dt><dd>{student.className ?? student.classId ?? '—'}</dd>
                </dl>
            </div>

            

            <ConfirmModal
                open={showDeleteModal}
                title="Xóa học sinh"
                message="Bạn có chắc muốn xóa học sinh này? Hành động không thể hoàn tác."
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                loading={deleting}
                variant="danger"
            />

            <style>{`
                .student-detail-page { max-width: 800px; }
                .breadcrumb { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--color-text-secondary); }
                .breadcrumb a { color: var(--color-accent-1); }
                .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .detail-header h2 { margin-bottom: 0.25rem; }
                .meta { color: var(--color-text-secondary); font-size: 0.95rem; }
                .header-actions { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
                .danger-btn { background: rgba(239,68,68,0.1); color: #b91c1c; border: none; cursor: pointer; padding: 0.5rem 1rem; border-radius: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; }
                .danger-btn:hover { background: rgba(239,68,68,0.2); }
                .detail-card { padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; }
                .detail-card h3 { margin-bottom: 1rem; font-size: 1.1rem; }
                .info-grid { display: grid; grid-template-columns: 140px 1fr; gap: 0.75rem 1.5rem; }
                .info-grid dt { color: var(--color-text-secondary); font-weight: 500; }
                .invitation-cta { padding: 1.5rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
                .invitation-cta p { margin: 0; color: var(--color-text-secondary); }
            `}</style>
        </div>
    );
}
