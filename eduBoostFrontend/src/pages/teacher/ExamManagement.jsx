import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
    Plus, Search, Filter, Eye, Edit, Trash2, Copy, Download, 
    CheckCircle, Clock, FileText, Sparkles, BarChart, 
    ChevronDown, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { examService } from '../../services/examService';
import { knowledgeService } from '../../services/knowledgeService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const EXAM_STATUS = {
    DRAFT: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
    PENDING_REVIEW: { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    APPROVED: { label: 'Đã duyệt', color: '#10b981', bg: '#d1fae5' },
    PUBLISHED: { label: 'Đã xuất bản', color: '#3b82f6', bg: '#dbeafe' },
    ARCHIVED: { label: 'Lưu trữ', color: '#9ca3af', bg: '#e5e7eb' },
};

const GRADE_OPTIONS = [10, 11, 12];

const ExamManagement = () => {
    // List state
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    // Filter state
    const [subjects, setSubjects] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [filterSubject, setFilterSubject] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [selectedExam, setSelectedExam] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatisticsModal, setShowStatisticsModal] = useState(false);
    const [examStatistics, setExamStatistics] = useState(null);

    // Load initial data
    useEffect(() => {
        loadSubjects();
        loadExamTypes();
    }, []);

    useEffect(() => {
        loadExams();
    }, [currentPage, filterSubject, filterGrade, filterType, filterStatus]);

    const loadSubjects = async () => {
        try {
            const data = await knowledgeService.getSubjects();
            setSubjects(Array.isArray(data) ? data : data?.data || []);
        } catch (err) {
            console.error('Error loading subjects:', err);
        }
    };

    const loadExamTypes = async () => {
        try {
            const data = await examService.getExamTypes();
            setExamTypes(Array.isArray(data) ? data : data?.data || []);
        } catch (err) {
            console.error('Error loading exam types:', err);
        }
    };

    const loadExams = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: 10,
                ...(filterSubject && { subjectId: filterSubject }),
                ...(filterGrade && { gradeLevel: filterGrade }),
                ...(filterType && { examTypeId: filterType }),
                ...(filterStatus && { status: filterStatus }),
            };
            const response = await examService.getExams(params);
            setExams(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            showErrorToast('Không thể tải danh sách đề thi');
            console.error('Error loading exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewExam = (exam) => {
        setSelectedExam(exam);
        setShowDetailModal(true);
    };

    const handleDeleteExam = (exam) => {
        if (exam.status !== 'DRAFT') {
            showErrorToast('Chỉ có thể xóa đề thi ở trạng thái Nháp');
            return;
        }
        setSelectedExam(exam);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedExam) return;
        try {
            await examService.deleteExam(selectedExam.id);
            showSuccessToast('Đã xóa đề thi');
            setShowDeleteConfirm(false);
            setSelectedExam(null);
            loadExams();
        } catch (err) {
            showErrorToast('Không thể xóa đề thi');
        }
    };

    const handleCloneExam = async (exam) => {
        try {
            await examService.cloneExam(exam.id);
            showSuccessToast('Đã sao chép đề thi');
            loadExams();
        } catch (err) {
            showErrorToast('Không thể sao chép đề thi');
        }
    };

    const handleApproveExam = async (exam) => {
        try {
            const result = await examService.approveExam(exam.id);
            showSuccessToast(`Đã duyệt đề thi. ${result.savedToBank || 0} câu hỏi mới được lưu vào ngân hàng.`);
            loadExams();
        } catch (err) {
            showErrorToast('Không thể duyệt đề thi');
        }
    };

    const handleChangeStatus = async (exam, newStatus) => {
        try {
            await examService.changeExamStatus(exam.id, { newStatus });
            showSuccessToast(`Đã chuyển trạng thái thành ${EXAM_STATUS[newStatus]?.label}`);
            loadExams();
        } catch (err) {
            showErrorToast('Không thể thay đổi trạng thái');
        }
    };

    const handleExportExam = async (exam, format = 'pdf') => {
        try {
            const blob = await examService.exportExam(exam.id, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exam.examCode}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showSuccessToast('Đã tải xuống đề thi');
        } catch (err) {
            showErrorToast('Không thể xuất đề thi');
        }
    };

    const handleViewStatistics = async (exam) => {
        try {
            const stats = await examService.getExamStatistics(exam.id);
            setExamStatistics(stats);
            setSelectedExam(exam);
            setShowStatisticsModal(true);
        } catch (err) {
            showErrorToast('Không thể tải thống kê');
        }
    };

    const filteredExams = useMemo(() => {
        if (!searchTerm) return exams;
        const term = searchTerm.toLowerCase();
        return exams.filter(e => 
            e.examTitle?.toLowerCase().includes(term) || 
            e.examCode?.toLowerCase().includes(term)
        );
    }, [exams, searchTerm]);

    const renderStatusBadge = (status) => {
        const config = EXAM_STATUS[status] || EXAM_STATUS.DRAFT;
        return (
            <span 
                className="status-badge" 
                style={{ background: config.bg, color: config.color }}
            >
                {config.label}
            </span>
        );
    };

    const renderActions = (exam) => {
        return (
            <div className="action-buttons">
                <button className="btn-icon" title="Xem chi tiết" onClick={() => handleViewExam(exam)}>
                    <Eye size={16} />
                </button>
                <button className="btn-icon" title="Thống kê" onClick={() => handleViewStatistics(exam)}>
                    <BarChart size={16} />
                </button>
                <button className="btn-icon" title="Sao chép" onClick={() => handleCloneExam(exam)}>
                    <Copy size={16} />
                </button>
                <button className="btn-icon" title="Tải xuống" onClick={() => handleExportExam(exam)}>
                    <Download size={16} />
                </button>
                {exam.status === 'DRAFT' && (
                    <>
                        <button className="btn-icon success" title="Duyệt đề" onClick={() => handleApproveExam(exam)}>
                            <CheckCircle size={16} />
                        </button>
                        <button className="btn-icon danger" title="Xóa" onClick={() => handleDeleteExam(exam)}>
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
                {exam.status === 'APPROVED' && (
                    <button 
                        className="btn-icon primary" 
                        title="Xuất bản" 
                        onClick={() => handleChangeStatus(exam, 'PUBLISHED')}
                    >
                        <FileText size={16} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="exam-management">
            <div className="page-header">
                <div className="header-left">
                    <h1><FileText size={24} /> Quản lý đề thi</h1>
                    <p className="subtitle">Tạo, chỉnh sửa và quản lý đề thi</p>
                </div>
                <div className="header-right">
                    <a href="/teacher/create-exam" className="btn btn-primary">
                        <Plus size={16} /> Tạo đề mới
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="filters glass">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm đề thi..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(0); }}>
                        <option value="">Tất cả môn học</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.subjectCode} - {s.description || s.subjectName}</option>
                        ))}
                    </select>
                    <select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); setCurrentPage(0); }}>
                        <option value="">Tất cả khối</option>
                        {GRADE_OPTIONS.map(g => (
                            <option key={g} value={g}>Khối {g}</option>
                        ))}
                    </select>
                    <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(0); }}>
                        <option value="">Tất cả loại đề</option>
                        {examTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.typeName}</option>
                        ))}
                    </select>
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }}>
                        <option value="">Tất cả trạng thái</option>
                        {Object.entries(EXAM_STATUS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                    <button className="btn btn-outline" onClick={loadExams}>
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Exam List */}
            <div className="exam-list glass">
                {loading ? (
                    <div className="loading-state">
                        <RefreshCw className="spin" size={24} />
                        <span>Đang tải...</span>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>Chưa có đề thi nào</h3>
                        <p>Bắt đầu tạo đề thi đầu tiên của bạn</p>
                        <a href="/teacher/create-exam" className="btn btn-primary">
                            <Plus size={16} /> Tạo đề mới
                        </a>
                    </div>
                ) : (
                    <>
                        <table className="exam-table">
                            <thead>
                                <tr>
                                    <th>Mã đề</th>
                                    <th>Tên đề thi</th>
                                    <th>Môn học</th>
                                    <th>Loại</th>
                                    <th>Số câu</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.map(exam => (
                                    <tr key={exam.id}>
                                        <td className="exam-code">{exam.examCode}</td>
                                        <td className="exam-name">{exam.examTitle}</td>
                                        <td>{exam.subjectCode} - Khối {exam.gradeLevel}</td>
                                        <td>{exam.examTypeName}</td>
                                        <td className="center">{exam.totalQuestions}</td>
                                        <td>{renderStatusBadge(exam.status)}</td>
                                        <td className="date">
                                            {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td>{renderActions(exam)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                >
                                    Trước
                                </button>
                                <span>Trang {currentPage + 1} / {totalPages}</span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa đề thi "${selectedExam?.examTitle}"?`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />

            {/* Statistics Modal */}
            {showStatisticsModal && examStatistics && (
                <div className="modal-overlay" onClick={() => setShowStatisticsModal(false)}>
                    <div className="modal statistics-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><BarChart size={20} /> Thống kê đề thi</h2>
                            <button className="close-btn" onClick={() => setShowStatisticsModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="stat-grid">
                                <div className="stat-card">
                                    <div className="stat-value">{examStatistics.totalQuestions}</div>
                                    <div className="stat-label">Tổng số câu</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{examStatistics.fromQuestionBank}</div>
                                    <div className="stat-label">Từ ngân hàng</div>
                                </div>
                                <div className="stat-card ai">
                                    <div className="stat-value">{examStatistics.aiGenerated}</div>
                                    <div className="stat-label">AI tạo</div>
                                </div>
                                <div className="stat-card edited">
                                    <div className="stat-value">{examStatistics.teacherEdited}</div>
                                    <div className="stat-label">GV chỉnh sửa</div>
                                </div>
                            </div>
                            
                            <h3>Phân bố theo mức độ nhận thức</h3>
                            <div className="distribution-list">
                                {examStatistics.byCognitiveLevel?.map((item, idx) => (
                                    <div key={idx} className="dist-item">
                                        <span className="dist-name">{item.cognitiveLevelName}</span>
                                        <div className="dist-bar-container">
                                            <div 
                                                className="dist-bar" 
                                                style={{ 
                                                    width: `${(item.count / examStatistics.totalQuestions) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="dist-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>

                            <h3>Phân bố theo bài học</h3>
                            <div className="distribution-list">
                                {examStatistics.byLesson?.map((item, idx) => (
                                    <div key={idx} className="dist-item">
                                        <span className="dist-name">{item.lessonName}</span>
                                        <div className="dist-bar-container">
                                            <div 
                                                className="dist-bar lesson" 
                                                style={{ 
                                                    width: `${(item.count / examStatistics.totalQuestions) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="dist-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedExam && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Eye size={20} /> Chi tiết đề thi</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Mã đề:</label>
                                    <span>{selectedExam.examCode}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Tên đề:</label>
                                    <span>{selectedExam.examTitle}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Môn học:</label>
                                    <span>{selectedExam.subjectName} ({selectedExam.subjectCode})</span>
                                </div>
                                <div className="detail-item">
                                    <label>Khối:</label>
                                    <span>Khối {selectedExam.gradeLevel}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Loại đề:</label>
                                    <span>{selectedExam.examTypeName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Thời gian:</label>
                                    <span>{selectedExam.durationMinutes} phút</span>
                                </div>
                                <div className="detail-item">
                                    <label>Số câu hỏi:</label>
                                    <span>{selectedExam.totalQuestions} câu</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạng thái:</label>
                                    {renderStatusBadge(selectedExam.status)}
                                </div>
                                <div className="detail-item full">
                                    <label>Mô tả:</label>
                                    <span>{selectedExam.description || 'Không có mô tả'}</span>
                                </div>
                            </div>

                            {selectedExam.questions?.length > 0 && (
                                <>
                                    <h3>Danh sách câu hỏi ({selectedExam.questions.length} câu)</h3>
                                    <div className="question-list">
                                        {selectedExam.questions.map((q, idx) => (
                                            <div key={q.id || idx} className="question-item">
                                                <div className="q-header">
                                                    <span className="q-num">Câu {q.orderNumber || idx + 1}</span>
                                                    <span className={`source-badge ${q.sourceFlag?.toLowerCase()}`}>
                                                        {q.sourceFlag === 'AI_GENERATED' ? 'AI' : 
                                                         q.sourceFlag === 'TEACHER_EDITED' ? 'Đã sửa' : 'Ngân hàng'}
                                                    </span>
                                                    {q.cognitiveLevelName && (
                                                        <span className="level-badge">{q.cognitiveLevelName}</span>
                                                    )}
                                                </div>
                                                <div className="q-text">{q.questionText}</div>
                                                {(q.wrongAnswer1 || q.wrongAnswer2 || q.wrongAnswer3) && (
                                                    <div className="q-answers">
                                                        <div className="answer correct">✓ {q.correctAnswer}</div>
                                                        {q.wrongAnswer1 && <div className="answer wrong">✗ {q.wrongAnswer1}</div>}
                                                        {q.wrongAnswer2 && <div className="answer wrong">✗ {q.wrongAnswer2}</div>}
                                                        {q.wrongAnswer3 && <div className="answer wrong">✗ {q.wrongAnswer3}</div>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => handleExportExam(selectedExam)}>
                                <Download size={16} /> Tải xuống
                            </button>
                            {selectedExam.status === 'DRAFT' && (
                                <button className="btn btn-primary" onClick={() => handleApproveExam(selectedExam)}>
                                    <CheckCircle size={16} /> Duyệt đề
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .exam-management { max-width: 1400px; margin: 0 auto; }

                .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
                .header-left h1 { display: flex; align-items: center; gap: 10px; margin: 0 0 0.25rem; }
                .subtitle { color: var(--color-text-secondary); margin: 0; }

                .filters { padding: 1rem; border-radius: 16px; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
                .search-box { flex: 1; min-width: 250px; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.6); padding: 0.65rem 1rem; border-radius: 10px; }
                .search-box input { border: none; background: none; flex: 1; outline: none; }
                .filter-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .filter-group select { padding: 0.65rem 1rem; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8); min-width: 140px; }

                .exam-list { padding: 1.25rem; border-radius: 16px; }
                .exam-table { width: 100%; border-collapse: collapse; }
                .exam-table th { text-align: left; padding: 0.75rem 1rem; border-bottom: 2px solid rgba(0,0,0,0.08); font-weight: 700; font-size: 0.85rem; color: var(--color-text-secondary); }
                .exam-table td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.04); }
                .exam-table tr:hover td { background: rgba(99,102,241,0.03); }
                .exam-code { font-weight: 700; font-family: monospace; }
                .exam-name { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .center { text-align: center; }
                .date { font-size: 0.9rem; color: var(--color-text-secondary); }

                .status-badge { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

                .action-buttons { display: flex; gap: 4px; }
                .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(0,0,0,0.04); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
                .btn-icon:hover { background: rgba(99,102,241,0.1); color: var(--color-accent-1); }
                .btn-icon.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
                .btn-icon.success:hover { background: rgba(16,185,129,0.1); color: #10b981; }
                .btn-icon.primary:hover { background: rgba(59,130,246,0.1); color: #3b82f6; }

                .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.06); }
                .pagination button { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: white; cursor: pointer; }
                .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

                .loading-state, .empty-state { padding: 3rem; text-align: center; color: var(--color-text-secondary); }
                .loading-state .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .empty-state h3 { margin: 1rem 0 0.5rem; }
                .empty-state p { margin: 0 0 1.5rem; }

                /* Modals */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal { background: white; border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
                .modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 1.15rem; }
                .close-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(0,0,0,0.04); font-size: 1.25rem; cursor: pointer; }
                .modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
                .modal-footer { padding: 1rem 1.25rem; border-top: 1px solid rgba(0,0,0,0.08); display: flex; justify-content: flex-end; gap: 0.75rem; }

                /* Statistics Modal */
                .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
                .stat-card { padding: 1rem; border-radius: 12px; background: #f3f4f6; text-align: center; }
                .stat-card.ai { background: rgba(99,102,241,0.1); }
                .stat-card.edited { background: rgba(245,158,11,0.1); }
                .stat-value { font-size: 1.5rem; font-weight: 800; }
                .stat-label { font-size: 0.85rem; color: var(--color-text-secondary); }
                
                .distribution-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
                .dist-item { display: flex; align-items: center; gap: 1rem; }
                .dist-name { width: 120px; font-weight: 600; font-size: 0.9rem; }
                .dist-bar-container { flex: 1; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
                .dist-bar { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 10px; transition: width 0.3s; }
                .dist-bar.lesson { background: linear-gradient(90deg, #10b981, #34d399); }
                .dist-count { width: 32px; text-align: right; font-weight: 700; }

                /* Detail Modal */
                .detail-modal { max-width: 900px; }
                .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
                .detail-item { display: flex; flex-direction: column; gap: 4px; }
                .detail-item.full { grid-column: span 2; }
                .detail-item label { font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase; }

                .question-list { display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; }
                .question-item { padding: 1rem; border-radius: 12px; background: #f9fafb; border: 1px solid rgba(0,0,0,0.04); }
                .q-header { display: flex; gap: 8px; align-items: center; margin-bottom: 0.5rem; }
                .q-num { font-weight: 800; }
                .source-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
                .source-badge.ai_generated { background: rgba(99,102,241,0.1); color: #6366f1; }
                .source-badge.teacher_edited { background: rgba(245,158,11,0.1); color: #f59e0b; }
                .source-badge.existing_bank { background: rgba(107,114,128,0.1); color: #6b7280; }
                .level-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; background: rgba(16,185,129,0.1); color: #10b981; }
                .q-text { margin-bottom: 0.75rem; }
                .q-answers { display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; }
                .answer { padding: 6px 10px; border-radius: 8px; }
                .answer.correct { background: rgba(16,185,129,0.1); color: #10b981; }
                .answer.wrong { background: rgba(239,68,68,0.05); color: #6b7280; }

                h3 { margin: 1rem 0 0.75rem; font-size: 1rem; }

                @media (max-width: 768px) {
                    .stat-grid { grid-template-columns: repeat(2, 1fr); }
                    .detail-grid { grid-template-columns: 1fr; }
                    .detail-item.full { grid-column: span 1; }
                }
            `}</style>
        </div>
    );
};

export default ExamManagement;
