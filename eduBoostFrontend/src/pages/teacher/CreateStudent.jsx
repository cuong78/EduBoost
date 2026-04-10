import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, UserPlus, Copy, CheckCircle, Calendar } from 'lucide-react';
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

// Utility date conversion removed globally, handling via DatePicker

export default function CreateStudentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const classIdFromQuery = searchParams.get('classId');

    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        classId: classIdFromQuery || '',
        dateOfBirth: '',
        gender: 'OTHER',
        address: '',
        contact: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState(null);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        teacherService.getClasses().then((data) => {
            const list = Array.isArray(data) ? data : [];
            setClasses(list);
            if (list.length && !form.classId && classIdFromQuery) setForm((f) => ({ ...f, classId: classIdFromQuery }));
            else if (list.length && !form.classId) setForm((f) => ({ ...f, classId: list[0]?.classId ?? '' }));
        }).catch(() => setClasses([])).finally(() => setLoadingClasses(false));
    }, [classIdFromQuery]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
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
        if (!form.email?.trim()) next.email = 'Email không được để trống';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email không hợp lệ';
        if (!form.fullName?.trim()) next.fullName = 'Họ tên không được để trống';
        if (!form.classId) next.classId = 'Vui lòng chọn lớp';
        if (form.password && form.password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';

        // Date is validated by DatePicker naturally
        if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) {
            next.dateOfBirth = 'Ngày sinh không thể lớn hơn hiện tại';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const [existingStudentData, setExistingStudentData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                email: form.email.trim(),
                fullName: form.fullName.trim(),
                phone: form.phone?.trim() || undefined,
                classId: form.classId,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender,
                address: form.address?.trim() || undefined,
                contact: form.contact?.trim() || undefined,
            };
            if (form.password?.trim()) payload.password = form.password.trim();
            const data = await teacherService.createStudent(payload);
            // Check if backend returned existing student flag
            if (data.existingStudent) {
                setExistingStudentData(data);
                return;
            }
            setCreated(data);
            showSuccessToast('Học sinh đã được tạo thành công');
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Tạo học sinh thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddExisting = async () => {
        if (!existingStudentData?.existingUserId) return;
        setSubmitting(true);
        try {
            const data = await teacherService.addExistingStudentToClass(
                existingStudentData.existingUserId,
                form.classId
            );
            setCreated(data);
            setExistingStudentData(null);
            showSuccessToast('Đã thêm học sinh vào lớp thành công');
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Thêm học sinh thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    if (created) {
        const inv = created.invitation;
        const cred = created.credentials;
        return (
            <div className="create-student-page">
                <div className="success-card glass">
                    <div className="success-icon">
                        <CheckCircle size={48} color="#16a34a" />
                    </div>
                    <h2>Tạo học sinh thành công</h2>
                    <div className="created-info">
                        <p><strong>Mã HS:</strong> {created.student?.studentCode}</p>
                        <p><strong>Họ tên:</strong> {created.student?.fullName}</p>
                        <p><strong>Email:</strong> {created.student?.email}</p>
                        {inv && (
                            <div className="invitation-box">
                                <p><strong>Mã mời:</strong></p>
                                <div className="copy-row">
                                    <code>{inv.invitationCode}</code>
                                    <button type="button" className="btn btn-sm btn-glass" onClick={() => copyToClipboard(inv.invitationCode, 'code')}>
                                        {copied === 'code' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                                {inv.expiresAt && <p className="small">Hết hạn: {new Date(inv.expiresAt).toLocaleString('vi-VN')}</p>}
                            </div>
                        )}
                        {cred && (
                            <div className="credentials-box">
                                <p><strong>Thông tin đăng nhập (gửi cho HS):</strong></p>
                                <div className="copy-row">
                                    <span>Email: {cred.email}</span>
                                    <button type="button" className="btn btn-sm btn-glass" onClick={() => copyToClipboard(cred.email, 'email')}>
                                        {copied === 'email' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                                {cred.temporaryPassword && (
                                    <div className="copy-row">
                                        <span>Mật khẩu tạm: {cred.temporaryPassword}</span>
                                        <button type="button" className="btn btn-sm btn-glass" onClick={() => copyToClipboard(cred.temporaryPassword, 'pw')}>
                                            {copied === 'pw' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="success-actions">

                        <Link to={`/teacher/classes/${form.classId}/students`} className="btn btn-glass">
                            Về danh sách lớp
                        </Link>
                    </div>
                </div>
                <style>{`
                    .success-card { max-width: 520px; margin: 0 auto; padding: 2rem; border-radius: 16px; text-align: center; }
                    .success-icon { margin-bottom: 1rem; }
                    .success-card h2 { margin-bottom: 1.5rem; }
                    .created-info { text-align: left; margin-bottom: 1.5rem; }
                    .invitation-box, .credentials-box { margin-top: 1rem; padding: 1rem; background: rgba(99,102,241,0.08); border-radius: 12px; }
                    .copy-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
                    .copy-row code { font-size: 1.1rem; letter-spacing: 2px; }
                    .small { font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 0.25rem; }
                    .success-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
                `}</style>
            </div>
        );
    }

    // ── Existing student confirmation dialog ──────────────────────
    if (existingStudentData) {
        const es = existingStudentData.student;
        return (
            <div className="create-student-page">
                <div className="existing-dialog glass" style={{
                    maxWidth: 520, margin: '2rem auto', padding: '2rem', borderRadius: 16, textAlign: 'center'
                }}>
                    <div style={{ fontSize: 48, marginBottom: '1rem' }}>👤</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Học sinh đã tồn tại</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                        Học sinh này đã có tài khoản trên hệ thống. Bạn có thể thêm trực tiếp vào lớp của bạn mà không cần tạo tài khoản mới.
                    </p>
                    <div style={{
                        background: 'rgba(99,102,241,0.08)', borderRadius: 12, padding: '1.25rem',
                        textAlign: 'left', marginBottom: '1.5rem'
                    }}>
                        <p><strong>Họ tên:</strong> {es?.fullName || '—'}</p>
                        <p><strong>Email:</strong> {es?.email || '—'}</p>
                        <p><strong>SĐT:</strong> {es?.phone || '—'}</p>
                        {es?.className && <p><strong>Lớp hiện tại:</strong> {es.className}</p>}
                        {es?.studentCode && <p><strong>Mã HS:</strong> {es.studentCode}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn btn-glass"
                            onClick={() => setExistingStudentData(null)}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAddExisting}
                            disabled={submitting}
                        >
                            {submitting
                                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang thêm...</>
                                : <><UserPlus size={18} /> Thêm vào lớp</>}
                        </button>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="create-student-page">
            <nav className="breadcrumb">
                <Link to="/teacher/classes">Lớp học</Link>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <span>Thêm học sinh</span>
            </nav>
            <h2>Thêm học sinh</h2>
            <p className="subtitle">Điền thông tin và tùy chọn tạo mã mời</p>

            <form onSubmit={handleSubmit} className="form-card glass">
                <div className="form-row">
                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="student@school.edu.vn"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Họ tên <span className="required">*</span></label>
                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className={errors.fullName ? 'error' : ''}
                        />
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="0987654321"
                        />
                    </div>
                    <div className="form-group">
                        <label>Lớp <span className="required">*</span></label>
                        <select
                            name="classId"
                            value={form.classId}
                            onChange={handleChange}
                            className={errors.classId ? 'error' : ''}
                            disabled={true}
                        >
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
                    <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Địa chỉ (tùy chọn)"
                    />
                </div>

                <div className="form-group">
                    <label>Thông Tin Phụ Huynh</label>
                    <input
                        name="contact"
                        value={form.contact}
                        onChange={handleChange}
                        placeholder="Nhập email phụ huynh"
                    />
                </div>



                <div className="form-actions">
                    <Link to={form.classId ? `/teacher/classes/${form.classId}/students` : '/teacher/classes'} className="btn btn-glass">
                        Hủy
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang tạo...</> : <><UserPlus size={18} /> Tạo học sinh</>}
                    </button>
                </div>
            </form>

            <style>{`
                .create-student-page { max-width: 720px; }
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
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    font-family: inherit;
                }
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
                .form-group input.error, .form-group select.error { border-color: var(--ds-error-text); }
                .checkbox-group { margin-top: 1rem; }
                .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 500; }
                .invitation-options { margin-left: 1.5rem; margin-top: 0.5rem; padding: 1rem; background: rgba(99,102,241,0.06); border-radius: 12px; }
                .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
                .required { color: var(--ds-error-text); }
                .error-message { font-size: 0.875rem; color: var(--ds-error-text); margin-top: 0.25rem; display: block; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
