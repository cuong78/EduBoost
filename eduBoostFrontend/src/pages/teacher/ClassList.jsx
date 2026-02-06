import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Plus, Users, Loader2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function ClassList() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        className: '',
        classCode: '',
        schoolYear: '',
        gradeLevel: '',
        description: '',
    });
    const [errors, setErrors] = useState({});

    const loadClasses = async () => {
        setLoading(true);
        try {
            const data = await teacherService.getClasses();
            setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được danh sách lớp');
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.className?.trim()) next.className = 'Tên lớp không được để trống';
        if (!form.classCode?.trim()) next.classCode = 'Mã lớp không được để trống';
        if (!form.gradeLevel) next.gradeLevel = 'Khối lớp không được để trống';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await teacherService.createClass(form);
            showSuccessToast('Tạo lớp thành công');
            setShowCreateModal(false);
            setForm({ className: '', classCode: '', schoolYear: '', gradeLevel: '', description: '' });
            loadClasses();
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Tạo lớp thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="class-list-page">
            <div className="page-header">
                <div>
                    <h2>Lớp học</h2>
                    <p>Quản lý các lớp học của bạn</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> Tạo lớp
                </button>
            </div>

            {loading ? (
                <div className="empty-state glass">
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải...</p>
                </div>
            ) : classes.length === 0 ? (
                <div className="empty-state glass">
                    <GraduationCap size={48} />
                    <p>Chưa có lớp nào. Tạo lớp mới để bắt đầu.</p>
                    <button type="button" className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        Tạo lớp
                    </button>
                </div>
            ) : (
                <div className="class-grid">
                    {classes.map((c) => (
                        <div key={c.classId} className="class-card glass">
                            <div className="class-card-header">
                                <h3>{c.className}</h3>
                                <span className="class-code">{c.classCode}</span>
                            </div>
                            {c.schoolYear && <p className="class-meta">Năm học: {c.schoolYear}</p>}
                            <p className="class-count">
                                <Users size={16} /> {c.studentCount ?? 0} học sinh
                            </p>
                            <Link to={`/teacher/classes/${c.classId}/students`} className="btn btn-primary btn-sm full-width">
                                Xem học sinh
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowCreateModal(false)}>
                    <div className="modal glass" onClick={(e) => e.stopPropagation()}>
                        <h3>Tạo lớp mới</h3>
                        <form onSubmit={handleCreate} className="auth-form">
                            <div className="form-group">
                                <label>Tên lớp <span className="required">*</span></label>
                                <input
                                    name="className"
                                    value={form.className}
                                    onChange={handleChange}
                                    placeholder="VD: 10A1"
                                    className={errors.className ? 'error' : ''}
                                />
                                {errors.className && <span className="error-message">{errors.className}</span>}
                            </div>
                            <div className="form-group">
                                <label>Mã lớp <span className="required">*</span></label>
                                <input
                                    name="classCode"
                                    value={form.classCode}
                                    onChange={handleChange}
                                    placeholder="VD: 10A1"
                                    className={errors.classCode ? 'error' : ''}
                                />
                                {errors.classCode && <span className="error-message">{errors.classCode}</span>}
                            </div>
                            <div className="form-group">
                                <label>Năm học</label>
                                <input
                                    name="schoolYear"
                                    value={form.schoolYear}
                                    onChange={handleChange}
                                    placeholder="VD: 2024-2025"
                                />
                            </div>
                            <div className="form-group">
                                <label>Khối lớp <span className="required">*</span></label>
                                <select
                                    name="gradeLevel"
                                    value={form.gradeLevel}
                                    onChange={handleChange}
                                    className={errors.gradeLevel ? 'error' : ''}
                                >
                                    <option value="">-- Chọn khối --</option>
                                    <option value="10">Khối 10</option>
                                    <option value="11">Khối 11</option>
                                    <option value="12">Khối 12</option>
                                </select>
                                {errors.gradeLevel && <span className="error-message">{errors.gradeLevel}</span>}
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả ngắn (tùy chọn)"
                                    rows={2}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-glass" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Đang tạo...' : 'Tạo lớp'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .class-list-page { max-width: 1200px; }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                }
                .page-header h2 { margin-bottom: 0.25rem; }
                .page-header p { color: var(--color-text-secondary); font-size: 0.95rem; }
                .class-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .class-card {
                    padding: 1.5rem;
                    border-radius: 16px;
                }
                .class-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }
                .class-card-header h3 { font-size: 1.25rem; margin: 0; }
                .class-code { font-size: 0.875rem; color: var(--color-text-secondary); }
                .class-meta, .class-count { font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 0.5rem; }
                .class-card .btn { margin-top: 1rem; }
                .empty-state {
                    text-align: center;
                    padding: 3rem 2rem;
                    border-radius: 16px;
                }
                .empty-state svg { color: var(--color-text-secondary); margin-bottom: 1rem; }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    min-width: 400px;
                    max-width: 90vw;
                    padding: 2rem;
                    border-radius: 16px;
                }
                .modal h3 { margin-bottom: 1.5rem; }
                .modal .form-group { margin-bottom: 1rem; }
                .modal .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                .modal input, .modal textarea, .modal select {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    font-family: inherit;
                    background: var(--glass-bg);
                }
                .modal .error { border-color: #dc2626; }
                .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
                .required { color: #dc2626; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
