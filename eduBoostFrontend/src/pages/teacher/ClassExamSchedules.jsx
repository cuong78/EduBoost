import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, Loader2, Plus, ChevronRight } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { examService } from '../../services/examService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

export default function ClassExamSchedules() {
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [exams, setExams] = useState([]);

    const [form, setForm] = useState({
        examId: '',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        durationMinutes: 45,
        allowLateMinutes: 0,
        maxAttempts: 1,
        password: '',
    });

    const loadData = async () => {
        if (!classId) return;
        setLoading(true);
        try {
            const [classesData, schedulesPage, myExams] = await Promise.all([
                teacherService.getClasses(),
                teacherService.getClassExamSchedules(classId, { page: 0, size: 20 }),
                examService.getMyExams(),
            ]);
            const classes = Array.isArray(classesData) ? classesData : [];
            const cls = classes.find((c) => c.classId === classId);
            setClassInfo(cls || { className: 'Lớp', classId });

            const content = schedulesPage?.content ?? schedulesPage ?? [];
            setSchedules(content);

            const examList = myExams?.content ?? myExams ?? [];
            setExams(examList);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được lịch thi');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [classId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.examId || !form.startTime || !form.endTime) {
            showErrorToast('Vui lòng chọn đề thi, nhập thời gian bắt đầu và kết thúc.');
            return;
        }
        setCreating(true);
        try {
            const payload = {
                ...form,
                examId: Number(form.examId),
                classId,
                durationMinutes: Number(form.durationMinutes) || 45,
                allowLateMinutes: form.allowLateMinutes ? Number(form.allowLateMinutes) : null,
                maxAttempts: form.maxAttempts ? Number(form.maxAttempts) : null,
            };
            await teacherService.createExamSchedule(payload);
            showSuccessToast('Đã tạo lịch thi');
            setForm((prev) => ({
                ...prev,
                examId: '',
                title: '',
                description: '',
                password: '',
            }));
            loadData();
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không thể tạo lịch thi');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="class-students-page">
            <nav className="breadcrumb">
                <Link to="/teacher/classes">Lớp học</Link>
                <ChevronRight size={16} />
                <Link to={`/teacher/classes/${classId}/students`}>{classInfo?.className ?? 'Lớp'}</Link>
                <ChevronRight size={16} />
                <span>Lịch thi</span>
            </nav>

            <div className="page-header">
                <div>
                    <h2>Lịch thi - {classInfo?.className ?? ''}</h2>
                    <p>Quản lý lịch kiểm tra/thi cho lớp này.</p>
                </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '1rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Tạo lịch thi mới
                </h3>
                <form className="exam-schedule-form" onSubmit={handleCreate}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Đề thi</label>
                            <select
                                name="examId"
                                value={form.examId}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn đề thi --</option>
                                {exams.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.examTitle} {e.subjectName ? `- ${e.subjectName}` : ''} (ID: {e.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tiêu đề lịch thi (tuỳ chọn)</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Ví dụ: Kiểm tra 1 tiết Chương 2"
                            />
                        </div>
                        <div className="form-group">
                            <label>Thời gian bắt đầu</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Thời gian kết thúc</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Thời lượng (phút)</label>
                            <input
                                type="number"
                                name="durationMinutes"
                                value={form.durationMinutes}
                                onChange={handleChange}
                                min={5}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cho phép trễ (phút, tuỳ chọn)</label>
                            <input
                                type="number"
                                name="allowLateMinutes"
                                value={form.allowLateMinutes}
                                onChange={handleChange}
                                min={0}
                            />
                        </div>
                        <div className="form-group">
                            <label>Số lần làm tối đa (tuỳ chọn)</label>
                            <input
                                type="number"
                                name="maxAttempts"
                                value={form.maxAttempts}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu bài thi (tuỳ chọn)</label>
                            <input
                                type="text"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Để trống nếu không dùng mật khẩu"
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={creating}>
                            {creating ? <Loader2 size={18} className="spin" /> : <Plus size={18} />} Tạo lịch thi
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="empty-state glass">
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải lịch thi...</p>
                </div>
            ) : schedules.length === 0 ? (
                <div className="empty-state glass">
                    <Calendar size={48} />
                    <p>Chưa có lịch thi nào cho lớp này.</p>
                </div>
            ) : (
                <div className="students-table-wrap glass">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Đề thi</th>
                                <th>Thời gian</th>
                                <th>Thời lượng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((s) => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{s.title || s.examTitle}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                Exam ID: {s.examId}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{new Date(s.startTime).toLocaleString()}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                đến {new Date(s.endTime).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={14} /> {s.durationMinutes} phút
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge">
                                            {s.status || 'SCHEDULED'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

