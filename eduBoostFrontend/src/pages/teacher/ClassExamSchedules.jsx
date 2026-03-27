import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, Loader2, Plus, ChevronRight, List as ListIcon, Megaphone, X, Pencil } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { examService } from '../../services/examService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import ExamScheduleDetailModal from './ExamScheduleDetailModal';

export default function ClassExamSchedules() {
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [scheduleModalMode, setScheduleModalMode] = useState('create'); // 'create' | 'edit'
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [exams, setExams] = useState([]);
    const [selectedScheduleForDetail, setSelectedScheduleForDetail] = useState(null);

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
        scoreRevealMode: 'IMMEDIATE',
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

    const resetFormForCreate = () => {
        setForm({
            examId: '',
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            durationMinutes: 45,
            allowLateMinutes: 0,
            maxAttempts: 1,
            password: '',
            scoreRevealMode: 'IMMEDIATE',
        });
    };

    const formatDateTimeLocal = (value) => {
        if (!value) return '';
        const str = String(value);
        // Backend LocalDateTime is serialized as `YYYY-MM-DDTHH:mm:ss` (no timezone),
        // so we can safely trim to the `datetime-local` expected format.
        return str.length >= 16 ? str.substring(0, 16) : str;
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
                scoreRevealMode: form.scoreRevealMode || 'IMMEDIATE',
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
            setIsCreateModalOpen(false);
            setScheduleModalMode('create');
            setEditingScheduleId(null);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không thể tạo lịch thi');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingScheduleId) return;
        if (!form.startTime || !form.endTime) {
            showErrorToast('Vui lòng nhập thời gian bắt đầu và kết thúc.');
            return;
        }
        setCreating(true);
        try {
            const payload = {
                title: form.title?.trim() ? form.title.trim() : null,
                description: form.description?.trim() ? form.description.trim() : null,
                startTime: form.startTime,
                endTime: form.endTime,
                durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
                allowLateMinutes: form.allowLateMinutes !== '' ? Number(form.allowLateMinutes) : null,
                maxAttempts: form.maxAttempts !== '' ? Number(form.maxAttempts) : null,
                password: form.password?.trim() ? form.password.trim() : null,
                scoreRevealMode: form.scoreRevealMode || null,
            };

            await teacherService.updateExamSchedule(editingScheduleId, payload);
            showSuccessToast('Đã cập nhật lịch thi');
            resetFormForCreate();
            setIsCreateModalOpen(false);
            setScheduleModalMode('create');
            setEditingScheduleId(null);
            loadData();
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không thể cập nhật lịch thi');
        } finally {
            setCreating(false);
        }
    };

    const openCreateModal = () => {
        setScheduleModalMode('create');
        setEditingScheduleId(null);
        resetFormForCreate();
        setIsCreateModalOpen(true);
    };

    const openEditModal = async (scheduleId) => {
        try {
            const detail = await teacherService.getExamScheduleDetail(scheduleId);
            setScheduleModalMode('edit');
            setEditingScheduleId(scheduleId);
            setForm((prev) => ({
                ...prev,
                examId: detail?.examId != null ? String(detail.examId) : '',
                title: detail?.title ?? '',
                description: '',
                startTime: formatDateTimeLocal(detail?.startTime),
                endTime: formatDateTimeLocal(detail?.endTime),
                durationMinutes: detail?.durationMinutes ?? 45,
                allowLateMinutes: detail?.allowLateMinutes ?? 0,
                maxAttempts: detail?.maxAttempts ?? 1,
                password: '',
                scoreRevealMode: detail?.scoreRevealMode ?? 'IMMEDIATE',
            }));
            setIsCreateModalOpen(true);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không thể tải thông tin lịch thi');
        }
    };

    const handleAnnounce = async (scheduleId) => {
        if (!window.confirm('Công bố kết quả cho học sinh? Họ sẽ thấy điểm và đáp án đúng khi xem lại bài.')) return;
        try {
            await teacherService.announceExamScheduleResults(scheduleId);
            showSuccessToast('Đã công bố kết quả');
            loadData();
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không thể công bố');
        }
    };

    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s) => (s.status || 'SCHEDULED') === 'SCHEDULED').length;
    const announcedSchedules = schedules.filter((s) => s.resultsAnnouncedAt).length;

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

            <div className="schedule-toolbar glass">
                <h3 style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                    <Calendar size={18} /> Danh sách lịch thi
                </h3>
                <button type="button" className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} /> Tạo lịch thi mới
                </button>
            </div>

            <div className="schedule-stats">
                <div className="schedule-stat-card glass">
                    <span>Tổng lịch thi</span>
                    <strong>{totalSchedules}</strong>
                </div>
                <div className="schedule-stat-card glass">
                    <span>Đang hiệu lực</span>
                    <strong>{activeSchedules}</strong>
                </div>
                <div className="schedule-stat-card glass">
                    <span>Đã công bố điểm</span>
                    <strong>{announcedSchedules}</strong>
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content schedule-modal-content">
                        <div className="modal-header">
                            <h2>{scheduleModalMode === 'edit' ? 'Chỉnh sửa lịch thi' : 'Tạo lịch thi mới'}</h2>
                            <button
                                className="btn-icon"
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setScheduleModalMode('create');
                                    setEditingScheduleId(null);
                                    resetFormForCreate();
                                }}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form className="exam-schedule-form" onSubmit={scheduleModalMode === 'edit' ? handleUpdate : handleCreate}>
                            <div className="schedule-form-subtitle">
                                {scheduleModalMode === 'edit'
                                    ? 'Cập nhật thông tin lịch thi và thời gian làm bài cho lớp.'
                                    : 'Thiết lập đề thi, mốc thời gian và quy định làm bài cho lịch thi mới.'}
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Đề thi</label>
                                    <select
                                        name="examId"
                                        value={form.examId}
                                        onChange={handleChange}
                                        disabled={scheduleModalMode === 'edit'}
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
                                <div className="form-group">
                                    <label>Hiển thị điểm cho học sinh</label>
                                    <select
                                        name="scoreRevealMode"
                                        value={form.scoreRevealMode}
                                        onChange={handleChange}
                                    >
                                        <option value="IMMEDIATE">Ngay khi nộp bài</option>
                                        <option value="AFTER_ANNOUNCE">Sau khi giáo viên công bố</option>
                                    </select>
                                </div>
                            </div>

                            <div className="schedule-form-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setScheduleModalMode('create');
                                        setEditingScheduleId(null);
                                        resetFormForCreate();
                                    }}
                                >
                                    Huỷ
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? <Loader2 size={18} className="spin" /> : <Plus size={18} />}{' '}
                                    {scheduleModalMode === 'edit' ? 'Cập nhật lịch thi' : 'Tạo lịch thi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                <div className="schedule-grid">
                    {schedules.map((s) => {
                        const scoreLabel =
                            s.scoreRevealMode === 'AFTER_ANNOUNCE'
                                ? s.resultsAnnouncedAt
                                    ? 'Đã công bố'
                                    : 'Chờ công bố'
                                : 'Ngay khi nộp';

                        return (
                            <div
                                key={s.id}
                                className="glass schedule-card"
                                onClick={() => setSelectedScheduleForDetail(s)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setSelectedScheduleForDetail(s);
                                }}
                            >
                                <div className="schedule-card-header">
                                    <div className="schedule-card-title-group">
                                        <span style={{ fontWeight: 700 }}>{s.title || s.examTitle}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            Exam ID: {s.examId}
                                        </span>
                                    </div>
                                    <span className="status-badge">{s.status || 'SCHEDULED'}</span>
                                </div>

                                <div className="schedule-card-body">
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                        <Clock size={14} style={{ marginRight: 6, display: 'inline-block' }} />
                                        {s.durationMinutes} phút
                                    </div>
                                    <div style={{ fontSize: '0.9rem' }}>
                                        {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>{scoreLabel}</div>
                                </div>

                                {s.scoreRevealMode === 'AFTER_ANNOUNCE' && !s.resultsAnnouncedAt && s.status !== 'CANCELLED' && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAnnounce(s.id);
                                        }}
                                        style={{ marginTop: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    >
                                        <Megaphone size={14} /> Công bố kết quả
                                    </button>
                                )}

                                {!s.resultsAnnouncedAt && s.status !== 'CANCELLED' && (
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(s.id);
                                        }}
                                        style={{ marginTop: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    >
                                        <Pencil size={14} /> Sửa
                                    </button>
                                )}

                                <div className="schedule-card-footer">
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Click để xem chi tiết</span>
                                    <ListIcon size={16} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedScheduleForDetail && (
                <ExamScheduleDetailModal
                    schedule={selectedScheduleForDetail}
                    onClose={() => setSelectedScheduleForDetail(null)}
                    onAnnounce={handleAnnounce}
                />
            )}

            <style>{`
                .schedule-toolbar {
                    padding: 1rem 1.25rem;
                    margin-bottom: 1rem;
                    border-radius: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }
                .schedule-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .schedule-stat-card {
                    border-radius: 0.85rem;
                    padding: 0.85rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .schedule-stat-card span {
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                }
                .schedule-stat-card strong {
                    font-size: 1.35rem;
                    line-height: 1.1;
                }
                .schedule-modal-content {
                    max-width: 960px;
                    width: 95%;
                }
                .schedule-form-subtitle {
                    font-size: 0.92rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.8rem;
                    padding: 0.65rem 0.8rem;
                    border-radius: 0.7rem;
                    background: rgba(255, 255, 255, 0.35);
                }
                .schedule-form-actions {
                    margin-top: 1rem;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.65rem;
                }
                .schedule-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1rem;
                }
                .schedule-card {
                    padding: 1rem;
                    border-radius: 1rem;
                    cursor: pointer;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .schedule-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(31, 41, 55, 0.08);
                }
                .schedule-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                }
                .schedule-card-title-group {
                    display: flex;
                    flex-direction: column;
                }
                .schedule-card-body {
                    margin-top: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                }
                .schedule-card-footer {
                    margin-top: 0.75rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 0.5rem;
                    padding-top: 0.65rem;
                    border-top: 1px dashed var(--glass-border);
                }
                @media (max-width: 768px) {
                    .schedule-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .schedule-toolbar .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}

