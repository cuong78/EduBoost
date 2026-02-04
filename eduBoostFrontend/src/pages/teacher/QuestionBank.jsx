import { useState, useEffect } from 'react';
import {
    Search, Filter, Plus, Upload, Download,
    MoreVertical, Trash2, Edit, CheckCircle, Layers
} from 'lucide-react';
import { questionBankService } from '../../services/questionBankService';
import { subjectService } from '../../services/subjectService';

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        subjectId: '',
        level: '',
        type: '',
        search: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        // Debounce search/filter could go here
        loadQuestions();
    }, [filters]);

    const loadInitialData = async () => {
        try {
            const subs = await subjectService.getSubjects();
            setSubjects(subs);
            loadQuestions();
        } catch (error) {
            console.error(error);
        }
    };

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await questionBankService.getQuestions(filters);
            setQuestions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ngân hàng câu hỏi</h1>
                    <p className="page-subtitle">Quản lý kho câu hỏi, import và chỉnh sửa</p>
                </div>
                <div className="actions-group">
                    <button className="btn btn-outline" onClick={() => { }}>
                        <Upload size={18} /> Import Excel
                    </button>
                    <button className="btn btn-primary" onClick={() => { }}>
                        <Plus size={18} /> Tạo câu hỏi
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar glass">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm nội dung câu hỏi..."
                        className="search-input"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={filters.subjectId}
                    onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                >
                    <option value="">Tất cả môn học</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                    className="filter-select"
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                    <option value="">Tất cả mức độ</option>
                    <option value="NB">Nhận biết</option>
                    <option value="TH">Thông hiểu</option>
                    <option value="VD">Vận dụng</option>
                    <option value="VDC">Vận dụng cao</option>
                </select>
            </div>

            {/* Question List */}
            <div className="questions-list">
                {loading ? (
                    <div className="text-center p-8">Đang tải...</div>
                ) : questions.length === 0 ? (
                    <div className="empty-state text-center p-12 text-secondary">
                        <Layers size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Chưa có câu hỏi nào phù hợp.</p>
                    </div>
                ) : (
                    questions.map(q => (
                        <div key={q.id} className="question-card glass">
                            <div className="q-header">
                                <div className="badges">
                                    <span className={`badge level-${q.level?.toLowerCase()}`}>{q.level}</span>
                                    <span className="badge type">{q.type}</span>
                                    {q.source === 'AI_GENERATED' && <span className="badge ai">AI</span>}
                                </div>
                                <div className="actions">
                                    <button className="icon-btn"><Edit size={16} /></button>
                                    <button className="icon-btn danger"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="q-content">
                                <p className="q-text">{q.content}</p>
                                <div className="q-options">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`option ${opt === q.correct ? 'correct' : ''}`}>
                                            {opt === q.correct && <CheckCircle size={14} className="text-green-600" />}
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .page-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 2rem;
                }
                .actions-group { display: flex; gap: 1rem; }
                
                .filter-bar {
                    display: flex; gap: 1rem; padding: 1rem; border-radius: 12px;
                    margin-bottom: 2rem; align-items: center;
                }
                .search-wrapper { position: relative; flex: 1; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .search-input {
                    width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem;
                    border: 1px solid rgba(0,0,0,0.1); border-radius: 8px;
                    background: rgba(255,255,255,0.8);
                }
                .filter-select {
                    padding: 0.75rem 2rem 0.75rem 1rem; border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.8);
                    min-width: 150px; cursor: pointer;
                }

                .questions-list { display: flex; flex-direction: column; gap: 1rem; }
                
                .question-card { padding: 1.5rem; border-radius: 12px; background: white; transition: all 0.2s; }
                .question-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                
                .q-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
                .badges { display: flex; gap: 8px; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
                .badge.level-nb { background: #dcfce7; color: #16a34a; }
                .badge.level-th { background: #dbeafe; color: #2563eb; }
                .badge.ai { background: linear-gradient(135deg, #a78bfa, #c084fc); color: white; }
                .badge.type { background: #f3f4f6; color: #4b5563; }
                
                .q-text { font-weight: 500; margin-bottom: 1rem; color: var(--color-text-primary); }
                .q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .option {
                    padding: 8px 12px; border-radius: 6px; background: #f9fafb;
                    font-size: 0.9rem; border: 1px solid transparent;
                    display: flex; align-items: center; gap: 6px;
                }
                .option.correct { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; font-weight: 500; }
                
                .icon-btn.danger:hover { background: #fee2e2; color: #ef4444; }
                .btn-outline {
                    border: 1px solid #e5e7eb; background: white; color: var(--color-text-primary);
                    display: flex; align-items: center; gap: 8px; padding: 0.75rem 1rem; border-radius: 8px;
                    cursor: pointer;
                }
                .btn-outline:hover { background: #f9fafb; border-color: #d1d5db; }
            `}</style>
        </div>
    );
};

export default QuestionBank;
