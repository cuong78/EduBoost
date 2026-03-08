import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

            <div className="detail-card glass">
                <h3>Điểm số &amp; kết quả kiểm tra</h3>
                {scoresLoading ? (
                    <div className="empty-state">
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        <p>Đang tải điểm số...</p>
                    </div>
                ) : scores.length === 0 ? (
                    <p>Chưa có dữ liệu điểm số cho học sinh này.</p>
                ) : (
                    <>
                        <div className="scores-table-wrapper">
                            <table className="scores-table">
                                <thead>
                                    <tr>
                                        <th>Bài kiểm tra</th>
                                        <th>Môn</th>
                                        <th>Chương</th>
                                        <th>Học kỳ</th>
                                        <th>Năm học</th>
                                        <th>Ngày làm bài</th>
                                        <th>Điểm</th>
                                        <th>Nguồn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scores.map((item) => (
                                        <tr key={item.resultId}>
                                            <td>{item.examTitle}</td>
                                            <td>{item.subjectName}</td>
                                            <td>{item.chapterName ?? '—'}</td>
                                            <td>{item.semester ?? '—'}</td>
                                            <td>{item.schoolYear ?? '—'}</td>
                                            <td>{item.takenAt ? new Date(item.takenAt).toLocaleString('vi-VN') : '—'}</td>
                                            <td>
                                                {item.score}
                                                {item.maxScore ? ` / ${item.maxScore}` : ''}{' '}
                                                {item.percentage != null && (
                                                    <span className="percentage">({item.percentage}%)</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge-source ${item.sourceType === 'ONLINE_EXAM' ? 'online' : 'manual'}`}>
                                                    {item.sourceType === 'ONLINE_EXAM' ? 'Thi online' : 'GV nhập'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {scoresTotalPages > 1 && (
                            <div className="scores-pagination">
                                <button
                                    className="btn btn-sm"
                                    disabled={scoresPage <= 0}
                                    onClick={() => loadScores(scoresPage - 1)}
                                >
                                    Trang trước
                                </button>
                                <span>
                                    Trang {scoresPage + 1} / {scoresTotalPages}
                                </span>
                                <button
                                    className="btn btn-sm"
                                    disabled={scoresPage >= scoresTotalPages - 1}
                                    onClick={() => loadScores(scoresPage + 1)}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

           
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
                .scores-table-wrapper { width: 100%; overflow-x: auto; }
                .scores-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                .scores-table th, .scores-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(148,163,184,0.2); text-align: left; }
                .scores-table th { font-weight: 600; color: var(--color-text-secondary); background: rgba(15,23,42,0.02); }
                .scores-table tr:hover { background: rgba(148,163,184,0.08); }
                .percentage { color: var(--color-text-secondary); font-size: 0.8rem; }
                .badge-source { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }
                .badge-source.manual { background: rgba(59,130,246,0.1); color: #1d4ed8; }
                .badge-source.online { background: rgba(34,197,94,0.12); color: #15803d; }
                .scores-pagination { margin-top: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; }
                .empty-state { text-align: center; padding: 1rem 0; color: var(--color-text-secondary); }
            `}</style>
        </div>
    );
}
