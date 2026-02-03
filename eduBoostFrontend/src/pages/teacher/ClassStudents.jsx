import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, Loader2, ChevronRight, Mail, Pencil, Trash2, User, Upload, Download, X } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function ClassStudents() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const loadClassAndStudents = async () => {
        if (!classId) return;
        setLoading(true);
        try {
            const [classesData, studentsData] = await Promise.all([
                teacherService.getClasses(),
                teacherService.getStudentsByClass(classId),
            ]);
            const classes = Array.isArray(classesData) ? classesData : [];
            const cls = classes.find((c) => c.classId === classId);
            setClassInfo(cls || { className: 'Lớp', classId });
            setStudents(Array.isArray(studentsData) ? studentsData : []);
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Không tải được dữ liệu');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClassAndStudents();
    }, [classId]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await teacherService.deleteStudent(deleteTarget);
            showSuccessToast('Đã xóa học sinh');
            setDeleteTarget(null);
            loadClassAndStudents();
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Xóa thất bại');
        } finally {
            setDeleting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await teacherService.downloadTemplate();
            showSuccessToast('Đã tải template mẫu');
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Tải template thất bại');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv'
            ];
            if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
                showErrorToast('Vui lòng chọn file Excel hoặc CSV');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleImportExcel = async () => {
        if (!selectedFile || !classId) return;
        
        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            await teacherService.importStudents(classId, formData);
            showSuccessToast('Import học sinh thành công!');
            setShowImportModal(false);
            setSelectedFile(null);
            loadClassAndStudents();
        } catch (err) {
            showErrorToast(err?.response?.data?.message || 'Import thất bại');
        } finally {
            setImporting(false);
        }
    };

    const handleCloseImportModal = () => {
        setShowImportModal(false);
        setSelectedFile(null);
    };

    return (
        <div className="class-students-page">
            <nav className="breadcrumb">
                <Link to="/teacher/classes">Lớp học</Link>
                <ChevronRight size={16} />
                <span>{classInfo?.className ?? '...'}</span>
            </nav>

            <div className="page-header">
                <div>
                    <h2>Học sinh - {classInfo?.className ?? ''}</h2>
                    <p>{students.length} học sinh trong lớp</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-download"
                        onClick={handleDownloadTemplate}
                    >
                        <Download size={18} /> Tải template
                    </button>
                    <button
                        type="button"
                        className="btn btn-import"
                        onClick={() => setShowImportModal(true)}
                    >
                        <Upload size={18} /> Import từ Excel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate(`/teacher/students/new?classId=${classId}`)}
                    >
                        <Plus size={18} /> Thêm học sinh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state glass">
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <p>Đang tải...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="empty-state glass">
                    <Users size={48} />
                    <p>Chưa có học sinh nào. Thêm học sinh để bắt đầu.</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate(`/teacher/students/new?classId=${classId}`)}
                    >
                        Thêm học sinh
                    </button>
                </div>
            ) : (
                <div className="students-table-wrap glass">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Mã HS</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.studentId}>
                                    <td>{s.studentCode ?? s.studentId}</td>
                                    <td>{s.fullName}</td>
                                    <td>{s.email}</td>
                                    <td>
                                        <div className="action-btns">
                                            <Link to={`/teacher/students/${s.studentId}`} className="btn-icon" title="Chi tiết">
                                                <User size={16} />
                                            </Link>
                                            <Link to={`/teacher/students/${s.studentId}/invitations`} className="btn-icon" title="Mã mời">
                                                <Mail size={16} />
                                            </Link>
                                            <Link to={`/teacher/students/${s.studentId}/edit`} className="btn-icon" title="Sửa">
                                                <Pencil size={16} />
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn-icon danger"
                                                title="Xóa"
                                                onClick={() => setDeleteTarget(s.studentId)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmModal
                open={!!deleteTarget}
                title="Xóa học sinh"
                message="Bạn có chắc muốn xóa học sinh này? Hành động không thể hoàn tác."
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
                variant="danger"
            />

            {showImportModal && (
                <div className="modal-overlay" onClick={handleCloseImportModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Import học sinh từ Excel</h3>
                            <button className="btn-close" onClick={handleCloseImportModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-description">
                                Chọn file Excel hoặc CSV chứa danh sách học sinh. 
                                Tải template mẫu để đảm bảo định dạng đúng.
                            </p>
                            
                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    id="file-input"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-input" className="file-upload-label">
                                    <Upload size={32} />
                                    <span className="file-name">
                                        {selectedFile ? selectedFile.name : 'Chọn file Excel/CSV'}
                                    </span>
                                    <span className="file-hint">
                                        Hỗ trợ: .xlsx, .xls, .csv
                                    </span>
                                </label>
                            </div>

                            {selectedFile && (
                                <div className="file-info">
                                    <span>✓ Đã chọn: {selectedFile.name}</span>
                                    <span className="file-size">
                                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleCloseImportModal}
                                disabled={importing}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleImportExcel}
                                disabled={!selectedFile || importing}
                            >
                                {importing ? (
                                    <>
                                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                        Đang import...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Import
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .class-students-page { max-width: 1200px; }
                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                }
                .breadcrumb a { color: var(--color-accent-1); font-weight: 500; }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                }
                .page-header h2 { margin-bottom: 0.25rem; }
                .page-header p { color: var(--color-text-secondary); font-size: 0.95rem; }
                .students-table-wrap { border-radius: 16px; overflow: hidden; padding: 0; }
                .students-table { width: 100%; border-collapse: collapse; }
                .students-table th, .students-table td { padding: 1rem 1.25rem; text-align: left; }
                .students-table th {
                    background: rgba(99, 102, 241, 0.08);
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                }
                .students-table tbody tr { border-bottom: 1px solid var(--glass-border); }
                .students-table tbody tr:last-child { border-bottom: none; }
                .action-btns { display: flex; gap: 0.5rem; align-items: center; }
                .btn-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--color-accent-1);
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                }
                .btn-icon:hover { background: rgba(99, 102, 241, 0.2); }
                .btn-icon.danger { background: rgba(239, 68, 68, 0.1); color: #b91c1c; }
                .btn-icon.danger:hover { background: rgba(239, 68, 68, 0.2); }
                .empty-state { text-align: center; padding: 3rem 2rem; border-radius: 16px; }
                .empty-state svg { color: var(--color-text-secondary); margin-bottom: 1rem; }
                
                /* Button Styles */
                .btn-download {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    font-weight: 500;
                }
                .btn-download:hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }
                .btn-import {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    font-weight: 500;
                }
                .btn-import:hover {
                    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }
                
                /* Import Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .modal-content {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }
                .btn-close {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .btn-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text);
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .modal-description {
                    color: var(--color-text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                .file-upload-area {
                    margin-bottom: 1rem;
                }
                .file-upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    border: 2px dashed var(--glass-border);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: rgba(99, 102, 241, 0.05);
                }
                .file-upload-label:hover {
                    border-color: var(--color-accent-1);
                    background: rgba(99, 102, 241, 0.1);
                }
                .file-upload-label svg {
                    color: var(--color-accent-1);
                    margin-bottom: 0.75rem;
                }
                .file-name {
                    font-weight: 500;
                    color: var(--color-text);
                    margin-bottom: 0.25rem;
                }
                .file-hint {
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                }
                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: #22c55e;
                }
                .file-size {
                    color: var(--color-text-secondary);
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    padding: 1.5rem;
                    border-top: 1px solid var(--glass-border);
                }
                
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
