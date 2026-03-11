import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, Calendar } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { showSuccessToast, showErrorToast } from '../../utils/show-toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

registerLocale('vi', vi);

const GENDER_OPTIONS = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' },
];

// Standard date formatting taken care of by react-datepicker

export default function EditStudent() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        classId: '',
        dateOfBirth: '',
        gender: 'OTHER',
        address: '',
    });
    const [classes, setClasses] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!studentId) return;
        setLoading(true);
        Promise.all([teacherService.getStudentById(studentId), teacherService.getClasses()])
            .then(([studentData, classesData]) => {
                setStudent(studentData);
                const list = Array.isArray(classesData) ? classesData : [];
                setClasses(list);
                const dateISO = studentData.dateOfBirth ? studentData.dateOfBirth.slice(0, 10) : '';
                setForm({
                    fullName: studentData.fullName ?? '',
                    phone: studentData.phone ?? '',
                    classId: studentData.classId ?? '',
                    dateOfBirth: dateISO,
                    gender: studentData.gender ?? 'OTHER',
                    address: studentData.address ?? '',
                });
            })
            .catch(() => {
                showErrorToast('Không tải được thông tin học sinh');
                setStudent(null);
            })
            .finally(() => setLoading(false));
    }, [studentId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleDateChange = (date) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            setForm((prev) => ({ ...prev, dateOfBirth: `${year}-${month}-${day}` }));
        } else {
            setForm((prev) => ({ ...prev, dateOfBirth: '' }));
        }
        if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.fullName?.trim()) next.fullName = 'Họ tên không được để trống';
        if (!form.classId) next.classId = 'Vui lòng chọn lớp';

        // Validated by DatePicker
        if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) {
            next.dateOfBirth = 'Ngày sinh không thể lớn hơn hiện tại';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                fullName: form.fullName.trim(),
                phone: form.phone?.trim() || undefined,
                classId: form.classId,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender,
                address: form.address?.trim() || undefined,
            };
            await teacherService.updateStudent(studentId, payload);
            showSuccessToast('Cập nhật học sinh thành công');
            navigate(`/teacher/students/${studentId}`);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSubmitting(false);
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
        <div className="edit-student-page">
            <nav className="breadcrumb">
                <Link to="/teacher/classes">Lớp học</Link>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <Link to={`/teacher/students/${studentId}`}>{student.fullName}</Link>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <span>Sửa</span>
            </nav>
            <h2>Sửa thông tin học sinh</h2>
            <p className="subtitle">Mã HS: {student.studentCode ?? student.studentId} · Email: {student.email}</p>

            <form onSubmit={handleSubmit} className="form-card glass">
                <div className="form-group">
                    <label>Họ tên <span className="required">*</span></label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" className={errors.fullName ? 'error' : ''} />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="0987654321" />
                    </div>
                    <div className="form-group">
                        <label>Lớp <span className="required">*</span></label>
                        <select name="classId" value={form.classId} onChange={handleChange} className={errors.classId ? 'error' : ''}>
                            <option value="">-- Chọn lớp --</option>
                            {classes.map((c) => (
                                <option key={c.classId} value={c.classId}>{c.className}</option>
                            ))}
                        </select>
                        {errors.classId && <span className="error-message">{errors.classId}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <div className="date-input-wrapper custom-datepicker">
                            <DatePicker
                                selected={form.dateOfBirth ? new Date(form.dateOfBirth) : null}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                locale="vi"
                                placeholderText="Ngày/Tháng/Năm (ví dụ: 20/12/1990)"
                                className={errors.dateOfBirth ? 'error' : ''}
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                maxDate={new Date()}
                            />
                        </div>
                        {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                    </div>
                    <div className="form-group">
                        <label>Giới tính</label>
                        <select name="gender" value={form.gender} onChange={handleChange}>
                            {GENDER_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Địa chỉ</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ (tùy chọn)" />
                </div>
                <div className="form-actions">
                    <Link to={`/teacher/students/${studentId}`} className="btn btn-glass">Hủy</Link>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang lưu...</> : <><Save size={18} /> Lưu</>}
                    </button>
                </div>
            </form>

            <style>{`
                .edit-student-page { max-width: 640px; }
                .breadcrumb { margin-bottom: 1rem; font-size: 0.9rem; color: var(--color-text-secondary); }
                .breadcrumb a { color: var(--color-accent-1); }
                .subtitle { color: var(--color-text-secondary); margin-bottom: 2rem; }
                .form-card { padding: 1.5rem; border-radius: 16px; }
                @media (min-width: 640px) {
                    .form-card { padding: 2rem; }
                }
                .form-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                @media (min-width: 640px) {
                    .form-row { grid-template-columns: 1fr 1fr; }
                }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                .form-group input, .form-group select { width: 100%; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--glass-border); font-family: inherit; }
                .date-input-wrapper {
                    position: relative;
                    width: 100%;
                }
                .custom-datepicker .react-datepicker-wrapper {
                    width: 100%;
                }
                .custom-datepicker input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    font-family: inherit;
                    background: transparent;
                }
                .form-group input.error, .form-group select.error { border-color: #dc2626; }
                .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
                .required { color: #dc2626; }
                .error-message { font-size: 0.875rem; color: #dc2626; margin-top: 0.25rem; display: block; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
