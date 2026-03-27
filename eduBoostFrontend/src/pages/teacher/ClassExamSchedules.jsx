import { useMemo, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Loader2,
    Plus,
    ChevronRight,
    Megaphone,
    X,
    Pencil,
    Search,
    LayoutGrid,
    Rows3,
    Eye,
    Filter,
} from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { examService } from '../../services/examService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import ExamScheduleDetailModal from './ExamScheduleDetailModal';
import './ClassExamSchedules.css';

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
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('grid');

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
    const pendingAnnounce = schedules.filter((s) => s.scoreRevealMode === 'AFTER_ANNOUNCE' && !s.resultsAnnouncedAt).length;

    const filteredSchedules = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (schedules || [])
            .filter((s) => {
                if (statusFilter !== 'ALL' && (s.status || 'SCHEDULED') !== statusFilter) return false;
                if (!q) return true;
                return [s.title, s.examTitle, String(s.examId)]
                    .filter(Boolean)
                    .some((x) => String(x).toLowerCase().includes(q));
            })
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }, [schedules, query, statusFilter]);

    const renderScheduleActions = (s) => (
        <div className="tes-actions">
            {s.scoreRevealMode === 'AFTER_ANNOUNCE' && !s.resultsAnnouncedAt && s.status !== 'CANCELLED' && (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAnnounce(s.id);
                    }}
                >
                    <Megaphone size={14} /> Công bố
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
                >
                    <Pencil size={14} /> Sửa
                </button>
            )}
            <button
                type="button"
                className="btn btn-outline"
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScheduleForDetail(s);
                }}
            >
                <Eye size={14} /> Chi tiết
            </button>
        </div>
    );

    return (
        <div className="tes-page">
            <nav className="tes-breadcrumb">
                <Link to="/teacher/classes">Lớp học</Link>
                <ChevronRight size={16} />
                <Link to={`/teacher/classes/${classId}/students`}>{classInfo?.className ?? 'Lớp'}</Link>
                <ChevronRight size={16} />
                <span>Lịch thi</span>
            </nav>

            <div className="tes-header">
                <div>
                    <h2 className="tes-title">Exam Schedule Space - {classInfo?.className ?? ''}</h2>
                    <p className="tes-subtitle">Quản lý toàn bộ lịch thi, công bố kết quả và theo dõi trạng thái trong một không gian thống nhất.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} /> Tạo lịch thi mới
                </button>
            </div>

            <div className="tes-kpis">
                <div className="tes-kpi">
                    <div className="tes-kpi-label">Tổng lịch thi</div>
                    <div className="tes-kpi-value">{totalSchedules}</div>
                </div>
                <div className="tes-kpi">
                    <div className="tes-kpi-label">Đang hiệu lực</div>
                    <div className="tes-kpi-value">{activeSchedules}</div>
                </div>
                <div className="tes-kpi">
                    <div className="tes-kpi-label">Đã công bố điểm</div>
                    <div className="tes-kpi-value">{announcedSchedules}</div>
                </div>
                <div className="tes-kpi">
                    <div className="tes-kpi-label">Chờ công bố</div>
                    <div className="tes-kpi-value">{pendingAnnounce}</div>
                </div>
            </div>

            <div className="tes-toolbar">
                <div className="tes-controls">
                    <div className="tes-search">
                        <Search size={16} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm theo tên lịch thi, đề thi hoặc exam ID..."
                        />
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Filter size={14} />
                        <select className="tes-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>
                </div>
                <div className="tes-view-toggle">
                    <button className={`tes-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                        <LayoutGrid size={16} />
                    </button>
                    <button className={`tes-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                        <Rows3 size={16} />
                    </button>
                </div>
            </div>

            {isCreateModalOpen && (
                <div className="tes-modal-overlay">
                    <div className="tes-modal">
                        <div className="tes-modal-header">
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

                        <form className="tes-modal-body" onSubmit={scheduleModalMode === 'edit' ? handleUpdate : handleCreate}>
                            <div className="tes-subtitle" style={{ marginBottom: '0.9rem' }}>
                                {scheduleModalMode === 'edit'
                                    ? 'Cập nhật thông tin lịch thi và thời gian làm bài cho lớp.'
                                    : 'Thiết lập đề thi, mốc thời gian và quy định làm bài cho lịch thi mới.'}
                            </div>
                            <div className="tes-form-grid">
                                <div className="tes-field">
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
                                <div className="tes-field">
                                    <label>Tiêu đề lịch thi (tuỳ chọn)</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Kiểm tra 1 tiết Chương 2"
                                    />
                                </div>
                                <div className="tes-field">
                                    <label>Thời gian bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={form.startTime}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="tes-field">
                                    <label>Thời gian kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={form.endTime}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="tes-field">
                                    <label>Thời lượng (phút)</label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        value={form.durationMinutes}
                                        onChange={handleChange}
                                        min={5}
                                    />
                                </div>
                                <div className="tes-field">
                                    <label>Cho phép trễ (phút, tuỳ chọn)</label>
                                    <input
                                        type="number"
                                        name="allowLateMinutes"
                                        value={form.allowLateMinutes}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                </div>
                                <div className="tes-field">
                                    <label>Số lần làm tối đa (tuỳ chọn)</label>
                                    <input
                                        type="number"
                                        name="maxAttempts"
                                        value={form.maxAttempts}
                                        onChange={handleChange}
                                        min={1}
                                    />
                                </div>
                                <div className="tes-field">
                                    <label>Mật khẩu bài thi (tuỳ chọn)</label>
                                    <input
                                        type="text"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Để trống nếu không dùng mật khẩu"
                                    />
                                </div>
                                <div className="tes-field">
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

                            <div className="tes-modal-actions">
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
                <div className="tes-empty">
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải lịch thi...</p>
                </div>
            ) : filteredSchedules.length === 0 ? (
                <div className="tes-empty">
                    <Calendar size={48} />
                    <p>Không có lịch thi nào phù hợp bộ lọc hiện tại.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="tes-grid">
                    {filteredSchedules.map((s) => {
                        const scoreLabel = s.scoreRevealMode === 'AFTER_ANNOUNCE'
                            ? (s.resultsAnnouncedAt ? 'Đã công bố' : 'Chờ công bố')
                            : 'Ngay khi nộp';
                        return (
                            <div key={s.id} className="tes-card">
                                <div className="tes-card-top">
                                    <div>
                                        <h4 className="tes-card-title">{s.title || s.examTitle}</h4>
                                        <div className="tes-subtitle" style={{ marginTop: '0.15rem' }}>Exam ID: {s.examId}</div>
                                    </div>
                                    <span className="status-badge">{s.status || 'SCHEDULED'}</span>
                                </div>
                                <div className="tes-meta">
                                    <div className="tes-meta-row"><Clock size={14} /> {s.durationMinutes} phút</div>
                                    <div className="tes-meta-row"><Calendar size={14} /> {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}</div>
                                    <div className="tes-meta-row">Điểm: {scoreLabel}</div>
                                </div>
                                {renderScheduleActions(s)}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="tes-table-wrap">
                    <table className="tes-table">
                        <thead>
                            <tr>
                                <th>Lịch thi</th>
                                <th>Exam ID</th>
                                <th>Thời gian</th>
                                <th>Thời lượng</th>
                                <th>Điểm</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedules.map((s) => {
                                const scoreLabel = s.scoreRevealMode === 'AFTER_ANNOUNCE'
                                    ? (s.resultsAnnouncedAt ? 'Đã công bố' : 'Chờ công bố')
                                    : 'Ngay khi nộp';
                                return (
                                    <tr key={s.id}>
                                        <td>{s.title || s.examTitle}</td>
                                        <td>{s.examId}</td>
                                        <td>{new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}</td>
                                        <td>{s.durationMinutes} phút</td>
                                        <td>{scoreLabel}</td>
                                        <td><span className="status-badge">{s.status || 'SCHEDULED'}</span></td>
                                        <td>{renderScheduleActions(s)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedScheduleForDetail && (
                <ExamScheduleDetailModal
                    schedule={selectedScheduleForDetail}
                    onClose={() => setSelectedScheduleForDetail(null)}
                    onAnnounce={handleAnnounce}
                />
            )}

        </div>
    );
}

