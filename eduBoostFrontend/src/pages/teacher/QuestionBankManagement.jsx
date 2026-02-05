import { useEffect, useState } from 'react';
import { BookOpen, Database, Edit2, Trash2, Eye, Search, Filter, Plus, Download, RefreshCw } from 'lucide-react';
import { knowledgeService } from '../../services/knowledgeService';
import { questionBankService } from '../../services/questionBankService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import MathRenderer from '../../components/common/MathRenderer';
import RichTextEditor from '../../components/common/RichTextEditor';
import { useNavigate } from 'react-router-dom';

const GRADE_OPTIONS = [10, 11, 12];

const QUESTION_TYPES = [
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
    { value: 'FILL_BLANK', label: 'Điền khuyết' },
];

const SOURCE_TYPES = [
    { value: '', label: 'Tất cả nguồn' },
    { value: 'MANUAL', label: 'Nhập tay' },
    { value: 'IMPORTED', label: 'Import từ file' },
    { value: 'AI_GENERATED', label: 'AI tạo' },
];

const QuestionBankManagement = () => {
    const navigate = useNavigate();
    
    // Filters
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [gradeLevel, setGradeLevel] = useState(10);
    
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [chapterId, setChapterId] = useState('');
    
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [lessonId, setLessonId] = useState('');
    
    const [sourceTypeFilter, setSourceTypeFilter] = useState('');
    const [cognitiveLevelFilter, setCognitiveLevelFilter] = useState('');
    const [showMyQuestionsOnly, setShowMyQuestionsOnly] = useState(false);
    
    // Data
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [cognitiveLevels, setCognitiveLevels] = useState([]);
    
    // Stats
    const [stats, setStats] = useState(null);
    
    // Edit modal
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [savingQuestion, setSavingQuestion] = useState(false);
    
    // View modal
    const [viewingQuestion, setViewingQuestion] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    
    // Delete confirm
    const [deletingQuestionId, setDeletingQuestionId] = useState(null);

    const loadSubjects = async () => {
        setLoadingSubjects(true);
        try {
            const data = await knowledgeService.getSubjects();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setSubjects(list);
            if (!subjectId && list.length > 0) setSubjectId(String(list[0].id));
        } catch (e) {
            setSubjects([]);
            showErrorToast('Không tải được danh sách môn học');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadChapters = async (sid, grade) => {
        if (!sid) return;
        setLoadingChapters(true);
        try {
            const data = await knowledgeService.getChaptersBySubject(sid, grade);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setChapters(list);
            setChapterId(''); // Reset to show all
        } catch (e) {
            setChapters([]);
            setChapterId('');
        } finally {
            setLoadingChapters(false);
        }
    };

    const loadLessons = async (cid) => {
        if (!cid) {
            setLessons([]);
            setLessonId('');
            return;
        }
        setLoadingLessons(true);
        try {
            const data = await knowledgeService.getLessonsByChapter(cid);
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setLessons(list);
            setLessonId(''); // Reset to show all
        } catch (e) {
            setLessons([]);
            setLessonId('');
        } finally {
            setLoadingLessons(false);
        }
    };

    const loadCognitiveLevels = async () => {
        try {
            const data = await questionBankService.getCognitiveLevels();
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setCognitiveLevels(list);
        } catch (e) {
            setCognitiveLevels([]);
        }
    };

    const loadQuestions = async () => {
        setLoadingQuestions(true);
        try {
            const filters = {};
            if (lessonId) filters.lessonId = Number(lessonId);
            if (cognitiveLevelFilter) filters.cognitiveLevelId = Number(cognitiveLevelFilter);
            if (sourceTypeFilter) filters.sourceType = sourceTypeFilter;
            
            const data = await questionBankService.getQuestions(filters);
            let list = Array.isArray(data) ? data : data?.data ?? [];
            
            // Client-side filter by chapter if no lesson selected
            if (chapterId && !lessonId && list.length > 0) {
                const lessonIdsInChapter = lessons.map(l => l.id);
                list = list.filter(q => lessonIdsInChapter.includes(q.lessonId));
            }
            
            setQuestions(list);
        } catch (e) {
            setQuestions([]);
            showErrorToast('Không tải được danh sách câu hỏi');
        } finally {
            setLoadingQuestions(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await questionBankService.getStats(subjectId || null, gradeLevel || null);
            setStats(data);
        } catch (e) {
            setStats(null);
        }
    };

    useEffect(() => {
        loadSubjects();
        loadCognitiveLevels();
    }, []);

    useEffect(() => {
        if (subjectId) loadChapters(subjectId, gradeLevel);
    }, [subjectId, gradeLevel]);

    useEffect(() => {
        if (chapterId) {
            loadLessons(chapterId);
        } else {
            setLessons([]);
            setLessonId('');
        }
    }, [chapterId]);

    useEffect(() => {
        loadQuestions();
    }, [lessonId, cognitiveLevelFilter, sourceTypeFilter]);

    useEffect(() => {
        loadStats();
    }, [subjectId, gradeLevel]);

    const handleViewQuestion = (question) => {
        setViewingQuestion(question);
        setShowViewModal(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion({
            ...question,
            cognitiveLevelId: question.cognitiveLevelId || question.cognitiveLevel?.id
        });
        setShowEditModal(true);
    };

    const handleSaveQuestion = async () => {
        if (!editingQuestion) return;
        setSavingQuestion(true);
        try {
            await questionBankService.updateQuestion(editingQuestion.id, {
                lessonId: editingQuestion.lessonId,
                questionText: editingQuestion.questionText,
                correctAnswer: editingQuestion.correctAnswer,
                explanation: editingQuestion.explanation,
                questionType: editingQuestion.questionType,
                cognitiveLevelId: editingQuestion.cognitiveLevelId,
                sourceType: editingQuestion.sourceType
            });
            showSuccessToast('Đã cập nhật câu hỏi');
            setShowEditModal(false);
            setEditingQuestion(null);
            loadQuestions();
        } catch (e) {
            showErrorToast('Cập nhật thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi'));
        } finally {
            setSavingQuestion(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        try {
            await questionBankService.deleteQuestion(id);
            showSuccessToast('Đã xóa câu hỏi');
            setDeletingQuestionId(null);
            loadQuestions();
        } catch (e) {
            showErrorToast('Xóa thất bại: ' + (e?.response?.data?.message || e?.message || 'Lỗi'));
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await questionBankService.downloadTemplate();
            showSuccessToast('Đã tải template');
        } catch (e) {
            showErrorToast('Tải template thất bại');
        }
    };

    return (
        <div className="question-bank-page">
            <div className="page-header">
                <h2><Database size={24} /> Ngân hàng câu hỏi</h2>
                <p>Quản lý tất cả câu hỏi theo môn học, khối, bài học</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-row glass">
                    <div className="stat-card">
                        <span className="stat-value">{stats.totalQuestions || 0}</span>
                        <span className="stat-label">Tổng câu hỏi</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.aiGeneratedCount || 0}</span>
                        <span className="stat-label">AI tạo</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.manualCount || 0}</span>
                        <span className="stat-label">Nhập tay</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.importedCount || 0}</span>
                        <span className="stat-label">Import</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section glass">
                <h3><Filter size={18} /> Bộ lọc</h3>
                <div className="filters-grid">
                    <div className="field">
                        <label>Môn học</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={loadingSubjects}>
                            <option value="">Chọn môn...</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={String(s.id)}>
                                    {s.subjectCode} {s.description ? `- ${s.description}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Khối</label>
                        <select value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))}>
                            {GRADE_OPTIONS.map((g) => (
                                <option key={g} value={g}>Lớp {g}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Chương</label>
                        <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={loadingChapters || chapters.length === 0}>
                            <option value="">Tất cả chương</option>
                            {chapters.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    Chương {c.chapterNumber}: {c.chapterName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Bài học</label>
                        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} disabled={loadingLessons || lessons.length === 0}>
                            <option value="">Tất cả bài</option>
                            {lessons.map((l) => (
                                <option key={l.id} value={String(l.id)}>
                                    Bài {l.lessonNumber}: {l.lessonName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Nguồn</label>
                        <select value={sourceTypeFilter} onChange={(e) => setSourceTypeFilter(e.target.value)}>
                            {SOURCE_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Mức độ nhận thức</label>
                        <select value={cognitiveLevelFilter} onChange={(e) => setCognitiveLevelFilter(e.target.value)}>
                            <option value="">Tất cả mức độ</option>
                            {cognitiveLevels.map((l) => (
                                <option key={l.id} value={String(l.id)}>{l.level}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="filter-actions">
                    <button className="btn btn-secondary" onClick={loadQuestions}>
                        <RefreshCw size={16} /> Làm mới
                    </button>
                    <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
                        <Download size={16} /> Tải Template
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/teacher/create-question')}>
                        <Plus size={16} /> Tạo câu hỏi mới
                    </button>
                </div>
            </div>

            {/* Questions list */}
            <div className="questions-section glass">
                <h3><BookOpen size={18} /> Danh sách câu hỏi ({questions.length})</h3>
                
                {loadingQuestions ? (
                    <p className="muted">Đang tải...</p>
                ) : questions.length === 0 ? (
                    <p className="muted">Không có câu hỏi nào. Hãy chọn bộ lọc hoặc tạo câu hỏi mới.</p>
                ) : (
                    <div className="questions-list">
                        {questions.map((q) => (
                            <div key={q.id} className="question-card">
                                <div className="question-header">
                                    <span className="question-id">#{q.id}</span>
                                    <span className="question-type-badge">
                                        {QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}
                                    </span>
                                    <span className={`source-badge ${q.sourceType?.toLowerCase()}`}>
                                        {SOURCE_TYPES.find(t => t.value === q.sourceType)?.label || q.sourceType}
                                    </span>
                                    {q.cognitiveLevel && (
                                        <span className="cognitive-badge">{q.cognitiveLevel.level || q.cognitiveLevelName}</span>
                                    )}
                                </div>
                                <div className="question-text">
                                    <MathRenderer content={(q.questionText || '').substring(0, 200) + (q.questionText?.length > 200 ? '...' : '')} />
                                </div>
                                <div className="question-meta">
                                    <span>Bài: {q.lessonName || q.lesson?.lessonName || 'N/A'}</span>
                                    <span>Tạo: {new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="question-actions">
                                    <button className="icon-btn" onClick={() => handleViewQuestion(q)} title="Xem chi tiết">
                                        <Eye size={16} />
                                    </button>
                                    <button className="icon-btn" onClick={() => handleEditQuestion(q)} title="Sửa">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="icon-btn danger" onClick={() => setDeletingQuestionId(q.id)} title="Xóa">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {showViewModal && viewingQuestion && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <h3>Chi tiết câu hỏi #{viewingQuestion.id}</h3>
                        <div className="view-section">
                            <label>Câu hỏi</label>
                            <div className="view-content"><MathRenderer content={viewingQuestion.questionText || '—'} /></div>
                        </div>
                        <div className="view-section">
                            <label>Đáp án đúng</label>
                            <div className="view-content answer"><MathRenderer content={viewingQuestion.correctAnswer || '—'} /></div>
                        </div>
                        {viewingQuestion.explanation && (
                            <div className="view-section">
                                <label>Giải thích</label>
                                <div className="view-content explanation"><MathRenderer content={viewingQuestion.explanation} /></div>
                            </div>
                        )}
                        <div className="view-meta">
                            <span><strong>Dạng:</strong> {QUESTION_TYPES.find(t => t.value === viewingQuestion.questionType)?.label}</span>
                            <span><strong>Mức độ:</strong> {viewingQuestion.cognitiveLevel?.level || viewingQuestion.cognitiveLevelName || 'N/A'}</span>
                            <span><strong>Nguồn:</strong> {SOURCE_TYPES.find(t => t.value === viewingQuestion.sourceType)?.label}</span>
                            <span><strong>Bài:</strong> {viewingQuestion.lessonName || viewingQuestion.lesson?.lessonName}</span>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Đóng</button>
                            <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEditQuestion(viewingQuestion); }}>
                                <Edit2 size={16} /> Sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingQuestion && (
                <div className="modal-overlay" onClick={() => !savingQuestion && setShowEditModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <h3>Sửa câu hỏi #{editingQuestion.id}</h3>
                        <div className="field">
                            <label>Câu hỏi</label>
                            <RichTextEditor
                                value={editingQuestion.questionText || ''}
                                onChange={(value) => setEditingQuestion({ ...editingQuestion, questionText: value })}
                            />
                        </div>
                        <div className="field">
                            <label>Đáp án đúng</label>
                            <RichTextEditor
                                value={editingQuestion.correctAnswer || ''}
                                onChange={(value) => setEditingQuestion({ ...editingQuestion, correctAnswer: value })}
                            />
                        </div>
                        <div className="field">
                            <label>Giải thích</label>
                            <RichTextEditor
                                value={editingQuestion.explanation || ''}
                                onChange={(value) => setEditingQuestion({ ...editingQuestion, explanation: value })}
                            />
                        </div>
                        <div className="row">
                            <div className="field">
                                <label>Dạng câu hỏi</label>
                                <select
                                    value={editingQuestion.questionType || 'MULTIPLE_CHOICE'}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionType: e.target.value })}
                                >
                                    {QUESTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Mức độ nhận thức</label>
                                <select
                                    value={editingQuestion.cognitiveLevelId || ''}
                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, cognitiveLevelId: e.target.value ? Number(e.target.value) : null })}
                                >
                                    <option value="">Chọn mức độ...</option>
                                    {cognitiveLevels.map((l) => (
                                        <option key={l.id} value={l.id}>{l.level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)} disabled={savingQuestion}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSaveQuestion} disabled={savingQuestion}>
                                {savingQuestion ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deletingQuestionId && (
                <div className="modal-overlay" onClick={() => setDeletingQuestionId(null)}>
                    <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa câu hỏi #{deletingQuestionId}? Hành động này không thể hoàn tác.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeletingQuestionId(null)}>Hủy</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteQuestion(deletingQuestionId)}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .question-bank-page { max-width: 1200px; margin: 0 auto; }
                .page-header { margin-bottom: 1.5rem; }
                .page-header h2 { display: flex; gap: 10px; align-items: center; margin: 0 0 6px; font-size: 1.75rem; }
                .page-header p { margin: 0; color: var(--color-text-secondary); }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1.25rem;
                }
                .stat-card {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255,255,255,0.5);
                    border-radius: 12px;
                }
                .stat-value {
                    display: block;
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-accent-1);
                }
                .stat-label {
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                }

                .filters-section {
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .filters-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                }
                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .filter-actions {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }

                .questions-section {
                    padding: 1.5rem;
                }
                .questions-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                }
                .questions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .question-card {
                    background: rgba(255,255,255,0.7);
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .question-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                }
                .question-id {
                    font-weight: 700;
                    color: var(--color-accent-1);
                }
                .question-type-badge,
                .source-badge,
                .cognitive-badge {
                    font-size: 0.75rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-weight: 500;
                }
                .question-type-badge {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }
                .source-badge {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-text-secondary);
                }
                .source-badge.ai_generated {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }
                .source-badge.imported {
                    background: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                }
                .cognitive-badge {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                }
                .question-text {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 0.75rem;
                }
                .question-meta {
                    display: flex;
                    gap: 1.5rem;
                    font-size: 0.8rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.75rem;
                }
                .question-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .icon-btn {
                    padding: 6px 10px;
                    border: none;
                    background: rgba(0,0,0,0.05);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    background: rgba(96, 78, 255, 0.1);
                    color: var(--color-accent-1);
                }
                .icon-btn.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }
                .modal-content {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .modal-content.small {
                    width: 400px;
                }
                .modal-content.large {
                    width: 700px;
                }
                .modal-content h3 {
                    margin: 0 0 1.5rem;
                    font-size: 1.25rem;
                }
                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }
                .view-section {
                    margin-bottom: 1.25rem;
                }
                .view-section label {
                    display: block;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.5rem;
                }
                .view-content {
                    background: rgba(0,0,0,0.02);
                    padding: 1rem;
                    border-radius: 8px;
                    line-height: 1.6;
                }
                .view-content.answer {
                    background: rgba(16, 185, 129, 0.1);
                    border-left: 3px solid #10b981;
                }
                .view-content.explanation {
                    background: rgba(96, 78, 255, 0.05);
                    border-left: 3px solid var(--color-accent-1);
                    font-style: italic;
                }
                .view-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    font-size: 0.9rem;
                    padding: 1rem;
                    background: rgba(0,0,0,0.02);
                    border-radius: 8px;
                }

                .field { margin-bottom: 1rem; }
                .field label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .field select, .field input, .field textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    background: white;
                }
                .row { display: flex; gap: 1rem; }
                .row .field { flex: 1; }
                .muted { color: var(--color-text-secondary); }

                .btn {
                    padding: 0.75rem 1.25rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    color: white;
                }
                .btn-secondary {
                    background: rgba(0,0,0,0.05);
                    color: var(--color-text-secondary);
                }
                .btn-danger {
                    background: #ef4444;
                    color: white;
                }
                .btn:hover { transform: translateY(-1px); }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            `}</style>
        </div>
    );
};

export default QuestionBankManagement;
