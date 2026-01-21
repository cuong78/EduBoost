import { useState, useMemo } from 'react';
import {
    Layers, BookOpen, BarChart2, Plus, Trash2,
    ArrowRight, Upload, Link as LinkIcon, Sparkles,
    CheckCircle, RefreshCw, Save, AlertCircle, FileText, Download
} from 'lucide-react';

const MOCK_LESSONS = [
    { id: 1, name: 'Bài 1: Giới hạn của dãy số' },
    { id: 2, name: 'Bài 2: Giới hạn của hàm số' },
    { id: 3, name: 'Bài 3: Hàm số liên tục' },
    { id: 4, name: 'Bài 4: Đạo hàm' }
];

const DIFFICULTY_LEVELS = [
    { id: 'nb', name: 'Nhận biết', color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'th', name: 'Thông hiểu', color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'vd', name: 'Vận dụng', color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'vdc', name: 'Vận dụng cao', color: 'text-red-600', bg: 'bg-red-100' }
];

const ExamGenerator = () => {
    const [step, setStep] = useState(1);

    // Matrix State
    const [matrixRows, setMatrixRows] = useState([
        { id: 1, lessonId: 1, level: 'nb', type: 'mcq', count: 5 }
    ]);

    // Source State
    const [sourceType, setSourceType] = useState('bank'); // bank, file, link
    const [sourceLink, setSourceLink] = useState('');
    const [useBank, setUseBank] = useState(true);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);

    // --- LOGIC: Matrix Statistics ---
    const stats = useMemo(() => {
        const total = matrixRows.reduce((sum, row) => sum + Number(row.count), 0);
        const byLevel = matrixRows.reduce((acc, row) => {
            acc[row.level] = (acc[row.level] || 0) + Number(row.count);
            return acc;
        }, {});

        return { total, byLevel };
    }, [matrixRows]);

    const addRow = () => {
        setMatrixRows([...matrixRows, {
            id: Date.now(),
            lessonId: MOCK_LESSONS[0].id,
            level: 'nb',
            type: 'mcq',
            count: 1
        }]);
    };

    const removeRow = (id) => {
        setMatrixRows(matrixRows.filter(r => r.id !== id));
    };

    const updateRow = (id, field, value) => {
        setMatrixRows(matrixRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    // --- LOGIC: Generation ---
    const handleGenerate = () => {
        setIsGenerating(true);
        setStep(3); // Move to review immediately for loading state

        // Simulate API
        setTimeout(() => {
            const mockQuestions = [];
            let qId = 1;
            matrixRows.forEach(row => {
                const levelInfo = DIFFICULTY_LEVELS.find(l => l.id === row.level);
                const lessonInfo = MOCK_LESSONS.find(l => l.id === Number(row.lessonId));

                for (let i = 0; i < row.count; i++) {
                    mockQuestions.push({
                        id: qId++,
                        text: `Câu hỏi ${qId}: Kiểm tra kiến thức về ${lessonInfo.name}?`,
                        level: row.level,
                        levelName: levelInfo.name,
                        type: row.type,
                        source: Math.random() > 0.5 ? 'bank' : 'ai', // Random source
                        options: ['A. Đáp án đúng', 'B. Sai', 'C. Sai', 'D. Sai']
                    });
                }
            });
            setGeneratedQuestions(mockQuestions);
            setIsGenerating(false);
        }, 2000);
    };

    const handleRefreshQuestion = (qId) => {
        setGeneratedQuestions(questions => questions.map(q => {
            if (q.id === qId) {
                return { ...q, text: q.text + ' (Refreshed)', source: 'ai' };
            }
            return q;
        }));
    };

    const handleDeleteQuestion = (qId) => {
        setGeneratedQuestions(questions => questions.filter(q => q.id !== qId));
    };

    return (
        <div className="exam-generator">
            {/* Header Steps */}
            <div className="steps-header glass">
                <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                    <div className="step-num">1</div>
                    <span>Cấu trúc Ma trận</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                    <div className="step-num">2</div>
                    <span>Nguồn & Tải lên</span>
                </div>
                <div className="step-line"></div>
                <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-num">3</div>
                    <span>Review & Xuất bản</span>
                </div>
            </div>

            {/* STEP 1: MATRIX BUILDER */}
            {step === 1 && (
                <div className="step-content matrix-grid">
                    <div className="matrix-builder glass">
                        <div className="panel-header">
                            <h3><Layers size={20} /> Thiết kế Ma trận đề thi</h3>
                            <div className="context-selects">
                                <select className="select-input"><option>Lớp 11A1</option></select>
                                <select className="select-input"><option>Toán Đại Số</option></select>
                            </div>
                        </div>

                        <div className="matrix-table-wrapper">
                            <table className="matrix-table">
                                <thead>
                                    <tr>
                                        <th>Bài học / Chủ đề</th>
                                        <th>Mức độ</th>
                                        <th>Loại câu hỏi</th>
                                        <th>Số lượng</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrixRows.map(row => (
                                        <tr key={row.id}>
                                            <td>
                                                <select
                                                    value={row.lessonId}
                                                    onChange={(e) => updateRow(row.id, 'lessonId', e.target.value)}
                                                    className="table-select"
                                                >
                                                    {MOCK_LESSONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    value={row.level}
                                                    onChange={(e) => updateRow(row.id, 'level', e.target.value)}
                                                    className="table-select"
                                                >
                                                    {DIFFICULTY_LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    value={row.type}
                                                    onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                                                    className="table-select"
                                                >
                                                    <option value="mcq">Trắc nghiệm</option>
                                                    <option value="essay">Tự luận</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number" min="1" max="50"
                                                    value={row.count}
                                                    onChange={(e) => updateRow(row.id, 'count', e.target.value)}
                                                    className="table-input-num"
                                                />
                                            </td>
                                            <td>
                                                <button onClick={() => removeRow(row.id)} className="btn-icon danger"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={addRow} className="btn-dashed full-width"><Plus size={16} /> Thêm dòng cấu trúc</button>
                        </div>
                    </div>

                    <div className="matrix-stats glass">
                        <h3><BarChart2 size={20} /> Thống kê Ma trận</h3>
                        <div className="stat-card total">
                            <span className="label">Tổng số câu</span>
                            <span className="value">{stats.total}</span>
                        </div>
                        <div className="stats-breakdown">
                            <h4>Phân phối mức độ</h4>
                            {DIFFICULTY_LEVELS.map(level => {
                                const count = stats.byLevel[level.id] || 0;
                                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                return (
                                    <div key={level.id} className="stat-row">
                                        <span className={`badge ${level.id}`}>{level.name}</span>
                                        <div className="stat-bar">
                                            <div className="stat-fill" style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <span className="stat-val">{count} ({percent}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => setStep(2)} className="btn btn-primary full-width mt-auto">
                            Tiếp tục: Chọn Nguồn <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )
            }

            {/* STEP 2: SOURCE SELECTION */}
            {
                step === 2 && (
                    <div className="step-content source-selection glass">
                        <h2>Nguồn dữ liệu & Ngân hàng</h2>

                        <div className="source-options">
                            <div className="option-card active">
                                <div className="header">
                                    <Layers size={24} className="icon" />
                                    <div>
                                        <h4>Ngân hàng câu hỏi</h4>
                                        <p>Sử dụng câu hỏi có sẵn trong hệ thống</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={useBank}
                                        onChange={(e) => setUseBank(e.target.checked)}
                                        className="toggle"
                                    />
                                </div>
                            </div>

                            <div className="divider">VÀ / HOẶC</div>

                            <div className="option-card">
                                <div className="header">
                                    <Sparkles size={24} className="icon ai" />
                                    <div>
                                        <h4>AI tạo mới từ tài liệu</h4>
                                        <p>Tải lên PDF/Doc hoặc dán link bài viết</p>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <button className={`source-btn ${sourceType === 'file' ? 'active' : ''}`} onClick={() => setSourceType('file')}>
                                        <Upload size={18} /> Upload File
                                    </button>
                                    <button className={`source-btn ${sourceType === 'link' ? 'active' : ''}`} onClick={() => setSourceType('link')}>
                                        <LinkIcon size={18} /> Dán Link
                                    </button>
                                </div>
                                {sourceType === 'file' && (
                                    <div className="file-drop-zone">
                                        <Upload size={24} />
                                        <p>Kéo thả file vào đây hoặc click để chọn</p>
                                        <span className="sub">Hỗ trợ PDF, DOCX (Max 10MB)</span>
                                    </div>
                                )}
                                {sourceType === 'link' && (
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="link-input"
                                        value={sourceLink}
                                        onChange={(e) => setSourceLink(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="actions-footer">
                            <button onClick={() => setStep(1)} className="btn btn-secondary">Quay lại</button>
                            <button onClick={handleGenerate} className="btn btn-primary">
                                <Sparkles size={18} /> Tạo đề thi ngay
                            </button>
                        </div>
                    </div>
                )
            }

            {/* STEP 3: REVIEW */}
            {
                step === 3 && (
                    <div className="step-content review-page">
                        {isGenerating ? (
                            <div className="loading-state glass">
                                <RefreshCw size={48} className="spin text-accent" />
                                <h3>AI đang phân tích và tạo đề thi...</h3>
                                <p>Đang tìm kiếm trong ngân hàng câu hỏi & tạo mới từ tài liệu.</p>
                            </div>
                        ) : (
                            <>
                                <div className="review-header glass">
                                    <div className="info">
                                        <h2>Review Đề thi</h2>
                                        <p className="meta">{generatedQuestions.length} câu hỏi • Thời gian làm bài: 45 phút (dự kiến)</p>
                                    </div>
                                    <div className="actions">
                                        <button className="btn btn-success"><Save size={18} /> Lưu vào Ngân hàng</button>
                                        <button className="btn btn-primary"><Download size={18} /> Xuất bản & Tải về</button>
                                    </div>
                                </div>

                                <div className="questions-review-list">
                                    {generatedQuestions.map((q, idx) => (
                                        <div key={q.id} className="review-card glass">
                                            <div className="card-header">
                                                <span className="q-num">Câu {idx + 1}</span>
                                                <span className={`badge ${q.level}`}>{q.levelName}</span>
                                                {q.source === 'ai' && (
                                                    <span className="badge ai"><Sparkles size={12} /> AI Generated</span>
                                                )}
                                                {q.source === 'bank' && (
                                                    <span className="badge bank"><Layers size={12} /> Ngân hàng</span>
                                                )}
                                            </div>
                                            <div className="card-body">
                                                <p className="q-text">{q.text}</p>
                                                <div className="options">
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className="option-item">{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="card-actions">
                                                {q.source === 'ai' && (
                                                    <button className="action-btn save" title="Lưu câu này vào ngân hàng">
                                                        <CheckCircle size={18} /> Lưu câu hỏi
                                                    </button>
                                                )}
                                                <button className="action-btn refresh" onClick={() => handleRefreshQuestion(q.id)} title="Đổi câu hỏi khác">
                                                    <RefreshCw size={18} /> Làm mới
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDeleteQuestion(q.id)} title="Xóa khỏi đề">
                                                    <Trash2 size={18} /> Xóa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )
            }

            <style>{`
                .exam-generator {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Steps Header */
                .steps-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                    gap: 1rem;
                }
                .step-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    opacity: 0.5;
                    font-weight: 600;
                }
                .step-item.active {
                    opacity: 1;
                    color: var(--color-accent-1);
                }
                .step-num {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #eee;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }
                .step-item.active .step-num {
                    background: var(--color-accent-1);
                    color: white;
                }
                .step-line {
                    width: 50px;
                    height: 2px;
                    background: #eee;
                }

                /* Matrix Step */
                .matrix-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 1.5rem;
                }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .panel-header h3 { display: flex; gap: 8px; align-items: center; }
                
                .context-selects {
                    display: flex;
                    gap: 10px;
                }
                .select-input {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                }

                .matrix-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .matrix-table th { text-align: left; padding: 1rem; border-bottom: 2px solid rgba(0,0,0,0.05); color: var(--color-text-secondary); }
                .matrix-table td { padding: 0.75rem 1rem; vertical-align: middle; }
                
                .table-select, .table-input-num {
                    width: 100%;
                    padding: 0.5rem;
                    border-radius: 6px;
                    border: 1px solid rgba(0,0,0,0.1);
                }
                .btn-icon { padding: 8px; border-radius: 6px; border: none; background: transparent; cursor: pointer; }
                .btn-icon.danger:hover { background: rgba(255, 71, 87, 0.1); color: #ff4757; }
                
                .btn-dashed {
                    width: 100%;
                    padding: 1rem;
                    border: 2px dashed rgba(0,0,0,0.1);
                    background: transparent;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    margin-top: 1rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .btn-dashed:hover {
                    border-color: var(--color-accent-1);
                    color: var(--color-accent-1);
                    background: rgba(96, 78, 255, 0.05);
                }

                .matrix-builder, .matrix-stats {
                    padding: 1.5rem;
                    border-radius: 16px;
                }
                
                /* Stats Panel */
                .matrix-stats { display: flex; flex-direction: column; gap: 1.5rem; }
                .stat-card.total {
                    background: rgba(96, 78, 255, 0.05);
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                }
                .stat-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                    font-size: 0.9rem;
                }
                .stat-bar { flex: 1; height: 6px; background: #eee; border-radius: 10px; overflow: hidden; }
                .stat-fill { height: 100%; background: var(--color-accent-1); }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; white-space: nowrap;}
                
                .badge.nb { color: #16a34a; background: #dcfce7; }
                .badge.th { color: #2563eb; background: #dbeafe; }
                .badge.vd { color: #ea580c; background: #ffedd5; }
                .badge.vdc { color: #dc2626; background: #fee2e2; }

                /* Source Step */
                .source-selection { padding: 3rem; border-radius: 16px; max-width: 800px; margin: 0 auto; }
                .source-options { display: flex; flex-direction: column; gap: 2rem; margin-top: 2rem; }
                .option-card { padding: 1.5rem; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; background: rgba(255,255,255,0.5); }
                .option-card.active { border-color: var(--color-accent-1); background: rgba(96, 78, 255, 0.02); }
                .header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
                .header .icon { color: var(--color-text-secondary); }
                .header .icon.ai { color: var(--color-accent-1); }
                
                .divider { text-align: center; color: var(--color-text-secondary); font-size: 0.8rem; font-weight: 600; letter-spacing: 1px; }

                .input-group { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .source-btn {
                    flex: 1;
                    padding: 1rem;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .source-btn.active { border-color: var(--color-accent-1); color: var(--color-accent-1); background: rgba(96, 78, 255, 0.05); }

                .file-drop-zone {
                    border: 2px dashed rgba(0,0,0,0.2);
                    padding: 2rem;
                    border-radius: 8px;
                    text-align: center;
                    color: var(--color-text-secondary);
                }
                .link-input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); }
                
                .actions-footer { display: flex; justify-content: space-between; margin-top: 2rem; }

                /* Review Step */
                .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 2rem; border-radius: 16px; }
                .questions-review-list { display: flex; flex-direction: column; gap: 1rem; }
                .review-card { padding: 1.5rem; border-radius: 12px; position: relative; }
                .card-header { display: flex; gap: 10px; margin-bottom: 1rem; }
                .badge.ai { background: linear-gradient(135deg, #604eff, #a78bfa); color: white; display: flex; align-items: center; gap: 4px; }
                .badge.bank { background: #374151; color: white; display: flex; align-items: center; gap: 4px; }
                
                .options { margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .option-item { padding: 0.5rem 1rem; background: rgba(255,255,255,0.5); border-radius: 6px; font-size: 0.95rem; }
                
                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .action-btn.save { background: rgba(46, 213, 115, 0.1); color: #2ed573; }
                .action-btn.save:hover { background: rgba(46, 213, 115, 0.2); }
                .action-btn.refresh { background: rgba(96, 78, 255, 0.1); color: var(--color-accent-1); }
                .action-btn.refresh:hover { background: rgba(96, 78, 255, 0.2); }
                .action-btn.delete { background: rgba(255, 71, 87, 0.1); color: #ff4757; }
                .action-btn.delete:hover { background: rgba(255, 71, 87, 0.2); }

                .loading-state { text-align: center; padding: 4rem; border-radius: 16px; }
                .spin { animation: spin 1s linear infinite; margin-bottom: 1rem; }
                .mt-auto { margin-top: auto; }
            `}</style>
        </div >
    );
};

export default ExamGenerator;
