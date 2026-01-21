import { useState } from 'react';
import { Sparkles, Save, RefreshCw, Layers, BrainCircuit } from 'lucide-react';

const CreateQuiz = () => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI delay
        setTimeout(() => {
            const mockQuiz = Array.from({ length: numQuestions }, (_, i) => ({
                id: i + 1,
                question: `Câu hỏi giả lập ${i + 1} về chủ đề "${topic}"?`,
                options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
                correct: 0
            }));
            setGeneratedQuiz(mockQuiz);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="create-quiz-page">
            <div className="quiz-header">
                <h2><BrainCircuit className="icon" /> AI Quiz Generator</h2>
                <p>Tạo bài kiểm tra tự động với sức mạnh của AI</p>
            </div>

            <div className="quiz-grid">
                {/* Configuration Panel */}
                <div className="config-panel glass">
                    <h3>Cấu hình bài thi</h3>

                    <div className="form-group">
                        <label>Chủ đề / Nội dung</label>
                        <textarea
                            placeholder="Nhập chủ đề hoặc dán nội dung bài học..."
                            rows={4}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Độ khó</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">Dễ</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Số câu hỏi</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary full-width generate-btn"
                        onClick={handleGenerate}
                        disabled={!topic || isGenerating}
                    >
                        {isGenerating ? (
                            <><RefreshCw className="spin" size={18} /> Đang tạo câu hỏi...</>
                        ) : (
                            <><Sparkles size={18} /> Tạo bài kiểm tra ngay</>
                        )}
                    </button>
                </div>

                {/* Preview Panel */}
                <div className="preview-panel">
                    {generatedQuiz ? (
                        <div className="quiz-results fade-in">
                            <div className="results-header">
                                <h3>Kết quả mô phỏng ({generatedQuiz.length} câu)</h3>
                                <button className="btn btn-outline"><Save size={16} /> Lưu bài thi</button>
                            </div>
                            <div className="questions-list">
                                {generatedQuiz.map((q) => (
                                    <div key={q.id} className="question-card glass">
                                        <h4>Câu {q.id}: {q.question}</h4>
                                        <div className="options-grid">
                                            {q.options.map((opt, idx) => (
                                                <div key={idx} className={`option ${idx === q.correct ? 'correct' : ''}`}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state glass">
                            <Layers size={48} />
                            <p>Kết quả bài thi sẽ hiển thị ở đây sau khi AI xử lý.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .create-quiz-page {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .quiz-header {
                    margin-bottom: 2rem;
                }
                .quiz-header h2 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 2rem;
                    background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .quiz-header .icon {
                    color: var(--color-accent-1);
                }

                .quiz-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                .config-panel {
                    padding: 1.5rem;
                    border-radius: 16px;
                    position: sticky;
                    top: 2rem;
                }
                
                .config-panel h3 { margin-bottom: 1.5rem; }

                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
                
                textarea, select, input {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.8);
                    font-family: inherit;
                }
                textarea:focus, select:focus, input:focus {
                    outline: none;
                    border-color: var(--color-accent-1);
                    box-shadow: 0 0 0 3px rgba(96, 78, 255, 0.1);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .generate-btn {
                    margin-top: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    border-radius: 16px;
                    color: var(--color-text-secondary);
                    text-align: center;
                    border: 2px dashed rgba(0,0,0,0.1);
                }
                
                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .questions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .question-card {
                    padding: 1.5rem;
                    border-radius: 12px;
                }
                
                .question-card h4 { margin-bottom: 1rem; }

                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .option {
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.5);
                    border-radius: 8px;
                    border: 1px solid transparent;
                }
                
                .option.correct {
                    background: rgba(46, 213, 115, 0.15);
                    border-color: #2ed573;
                    color: #2ed573;
                    font-weight: 600;
                }
                
                .btn-outline {
                    border: 1px solid var(--color-accent-1);
                    color: var(--color-accent-1);
                    background: transparent;
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-outline:hover {
                    background: rgba(96, 78, 255, 0.05);
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default CreateQuiz;
