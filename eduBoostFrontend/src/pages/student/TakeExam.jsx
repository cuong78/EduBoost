import { useState, useEffect, useRef } from 'react';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    AlertTriangle,
    Lock,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const TakeExam = () => {
    const { id } = useParams();

    // Exam Configuration (would normally come from API)
    const examConfig = {
        title: "Kiểm tra giữa kỳ Giải tích 1",
        password: "123",
        durationMinutes: 45,
        isMultipleChoice: true,
        showScore: true,
        questions: [
            { id: 1, text: "Tính đạo hàm của f(x) = x² + 3x.", options: ["2x + 3", "x + 3", "2x", "x² + 3"], correct: "2x + 3" },
            { id: 2, text: "Ai là người phát triển thuyết tương đối?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Marie Curie"], correct: "Albert Einstein" },
            { id: 3, text: "Thủ đô của Việt Nam là gì?", options: ["TP. Hồ Chí Minh", "Đà Nẵng", "Hà Nội", "Huế"], correct: "Hà Nội" },
            { id: 4, text: "Nguyên tố nào có ký hiệu hóa học là 'O'?", options: ["Vàng", "Oxy", "Osmium", "Olive"], correct: "Oxy" },
            { id: 5, text: "Tìm x: 2x - 4 = 10", options: ["5", "7", "3", "8"], correct: "7" }
        ]
    };

    // State
    const [hasAccess, setHasAccess] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(examConfig.durationMinutes * 60);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    // Derived State
    const questions = examConfig.questions;

    // Timer Logic
    useEffect(() => {
        if (!hasAccess || isSubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto-submit
                    return 0;
                }
                // Warning logic (e.g., last 5 minutes)
                if (prev === 5 * 60) {
                    setShowWarning(true);
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [hasAccess, isSubmitted, timeLeft]);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === examConfig.password) {
            setHasAccess(true);
            setPasswordError("");
        } else {
            setPasswordError("Mật khẩu không đúng. Vui lòng thử lại.");
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (option) => {
        if (isSubmitted) return;
        setAnswers({ ...answers, [currentQuestion]: option });
    };

    const handleSubmit = (auto = false) => {
        if (auto || window.confirm("Bạn có chắc chắn muốn nộp bài không?")) {
            setIsSubmitted(true);
            setShowWarning(false);
            if (auto) alert("Hết giờ! Hệ thống đã tự động nộp bài của bạn.");
        }
    };

    const calculateScore = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[questions.indexOf(q)] === q.correct) {
                correctCount++;
            }
        });
        const score = (correctCount / questions.length) * 10;
        return { correctCount, score };
    };

    // Password Screen
    if (!hasAccess) {
        return (
            <div className="exam-auth-container">
                <div className="auth-card glass">
                    <div className="auth-icon-wrapper">
                        <Lock size={48} />
                    </div>
                    <h2>Bảo mật bài thi</h2>
                    <p>Bài thi "<strong>{examConfig.title}</strong>" yêu cầu mật khẩu để truy cập.</p>

                    <form onSubmit={handlePasswordSubmit} className="auth-form">
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu bài thi..."
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="auth-input"
                            autoFocus
                        />
                        {passwordError && (
                            <div className="error-message">
                                <AlertCircle size={16} /> {passwordError}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary full-width">
                            Bắt đầu làm bài
                        </button>
                    </form>
                </div>
                <style>{`
                    .exam-auth-container {
                        min-height: 80vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1rem;
                    }
                    .auth-card {
                        max-width: 450px;
                        width: 100%;
                        padding: 1.5rem;
                        border-radius: 1.5rem;
                        text-align: center;
                        background: rgba(255, 255, 255, 0.8);
                    }
                    @media (min-width: 640px) {
                        .auth-card { padding: 3rem; }
                    }
                    .auth-icon-wrapper {
                        width: 80px;
                        height: 80px;
                        background: #e0e7ff;
                        color: #4338ca;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                    }
                    .auth-card h2 {
                        margin-bottom: 0.5rem;
                        font-size: 1.5rem;
                    }
                    .auth-card p {
                        color: var(--color-text-secondary);
                        margin-bottom: 2rem;
                    }
                    .auth-input {
                        width: 100%;
                        padding: 1rem;
                        border-radius: 0.75rem;
                        border: 1px solid #e5e7eb;
                        margin-bottom: 1rem;
                        font-size: 1rem;
                        outline: none;
                        transition: border-color 0.2s;
                    }
                    .auth-input:focus {
                        border-color: var(--color-accent-1);
                    }
                    .error-message {
                        color: #ef4444;
                        font-size: 0.875rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    }
                    .full-width { width: 100%; }
                `}</style>
            </div>
        );
    }

    // Results Screen
    if (isSubmitted) {
        const { correctCount, score } = calculateScore();
        const isPass = score >= 5;

        return (
            <div className="exam-result-container">
                <div className="result-card glass">
                    <div className={`result-icon-wrapper ${isPass ? 'pass' : 'fail'}`}>
                        {isPass ? <CheckCircle size={48} /> : <XCircle size={48} />}
                    </div>

                    <h2>Đã nộp bài thành công!</h2>
                    <p className="subtitle">Hệ thống đã ghi nhận câu trả lời của bạn.</p>

                    {examConfig.showScore && (
                        <div className="score-box">
                            <div className="score-item">
                                <span className="label">Số câu đúng</span>
                                <span className="value">{correctCount}/{questions.length}</span>
                            </div>
                            <div className="score-divider"></div>
                            <div className="score-item">
                                <span className="label">Điểm số</span>
                                <span className={`value ${isPass ? 'text-green' : 'text-red'}`}>{score.toFixed(1)}</span>
                            </div>
                        </div>
                    )}

                    <div className="result-actions">
                        <Link to="/student/exams" className="btn btn-primary full-width">
                            Quay lại danh sách
                        </Link>
                        {/* <button className="btn btn-outline full-width">Xem chi tiết đáp án</button> */}
                    </div>
                </div>

                <style>{`
                    .exam-result-container {
                        min-height: 80vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1rem;
                    }
                    .result-card {
                        max-width: 500px;
                        width: 100%;
                        padding: 1.5rem;
                        border-radius: 1.5rem;
                        text-align: center;
                        background: white;
                    }
                    @media (min-width: 640px) {
                        .result-card { padding: 3rem; }
                    }
                    .result-icon-wrapper {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                    }
                    .pass { background: #dcfce7; color: #16a34a; }
                    .fail { background: #fee2e2; color: #dc2626; }
                    
                    .result-card h2 { margin-bottom: 0.5rem; }
                    .subtitle { color: var(--color-text-secondary); margin-bottom: 2rem; }
                    
                    .score-box {
                        display: flex;
                        background: #f9fafb;
                        border-radius: 1rem;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                        justify-content: space-around;
                        align-items: center;
                    }
                    .score-item {
                        display: flex;
                        flex-direction: column;
                        gap: 0.25rem;
                    }
                    .score-item .label {
                        font-size: 0.875rem;
                        color: var(--color-text-secondary);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        font-weight: 600;
                    }
                    .score-item .value {
                        font-size: 2rem;
                        font-weight: 800;
                        color: var(--color-text-primary);
                    }
                    .score-divider {
                        width: 1px;
                        height: 40px;
                        background: #e5e7eb;
                    }
                    .text-green { color: #16a34a; }
                    .text-red { color: #dc2626; }
                    
                    .result-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }
                `}</style>
            </div>
        );
    }

    // Exam Screen
    return (
        <div className="exam-screen">
            {/* Warning Popup */}
            {showWarning && (
                <div className="warning-overlay">
                    <div className="warning-popup glass">
                        <AlertTriangle size={32} className="text-warning" />
                        <div className="warning-content">
                            <h3>Sắp hết giờ!</h3>
                            <p>Chỉ còn dưới 5 phút. Vui lòng kiểm tra lại bài làm.</p>
                        </div>
                        <button onClick={() => setShowWarning(false)} className="btn-close">
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="exam-header-bar glass">
                <div className="exam-info">
                    <h1>{examConfig.title}</h1>
                    <div className="progress-text">
                        Câu {currentQuestion + 1} / {questions.length}
                    </div>
                </div>
                <div className={`timer-display ${timeLeft < 300 ? 'timer-warning' : 'timer-normal'}`}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            <div className="exam-layout">
                {/* Main Question Area */}
                <main className="question-area glass">
                    <div className="question-header">
                        <span className="question-number">Câu hỏi {questions[currentQuestion].id}</span>
                        <h2 className="question-text">
                            {questions[currentQuestion].text}
                        </h2>
                    </div>

                    <div className="options-list">
                        {questions[currentQuestion].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(option)}
                                className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                            >
                                <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                <span className="option-text">{option}</span>
                                {answers[currentQuestion] === option && <CheckCircle size={20} className="check-icon" />}
                            </button>
                        ))}
                    </div>

                    <div className="navigation-controls">
                        <button
                            onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
                            disabled={currentQuestion === 0}
                            className="btn btn-outline nav-btn"
                        >
                            <ChevronLeft size={20} /> Quay lại
                        </button>

                        {currentQuestion === questions.length - 1 ? (
                            <button onClick={() => handleSubmit(false)} className="btn btn-submit nav-btn">
                                Nộp bài thi
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1))}
                                className="btn btn-primary nav-btn"
                            >
                                Tiếp theo <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </main>

                {/* Palette */}
                <aside className="question-palette glass">
                    <h3>Danh sách câu hỏi</h3>
                    <div className="palette-grid">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`palette-btn ${currentQuestion === idx ? 'current' :
                                    answers[idx] ? 'answered' : ''
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="palette-legend">
                        <div className="legend-item">
                            <div className="dot current"></div> Đang làm
                        </div>
                        <div className="legend-item">
                            <div className="dot answered"></div> Đã trả lời
                        </div>
                        <div className="legend-item">
                            <div className="dot"></div> Chưa làm
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .exam-screen {
                    min-height: 100vh;
                    background: #f3f4f6;
                    padding: 1.5rem;
                    position: relative;
                }

                /* Warning Popup */
                .warning-overlay {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                    animation: slideDown 0.5s ease;
                }
                .warning-popup {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    border-radius: 99px;
                    background: #fff;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    border: 1px solid #fecaca;
                }
                .text-warning { color: #dc2626; }
                .warning-content h3 { font-size: 1rem; margin: 0; color: #991b1b; }
                .warning-content p { font-size: 0.85rem; margin: 0; color: #b91c1c; }
                .btn-close {
                    background: #fee2e2;
                    color: #b91c1c;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.85rem;
                }

                @keyframes slideDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }

                /* Header */
                .exam-header-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    border-radius: 1rem;
                    background: white;
                    margin-bottom: 2rem;
                    position: sticky;
                    top: 1rem;
                    z-index: 50;
                }
                .exam-info h1 { font-size: 1.25rem; color: var(--color-text-primary); margin-bottom: 0.25rem; }
                .progress-text { color: var(--color-text-secondary); font-size: 0.9rem; }
                
                .timer-display {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-family: monospace;
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .timer-normal { background: #e0e7ff; color: #4338ca; }
                .timer-warning { background: #fee2e2; color: #dc2626; animation: pulse 1s infinite; }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.8; }
                    100% { opacity: 1; }
                }

                /* Layout */
                .exam-layout {
                    display: flex;
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .question-area {
                    flex: 1;
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                }
                .question-palette {
                    width: 300px;
                    background: white;
                    border-radius: 1.5rem;
                    padding: 1.5rem;
                    align-self: flex-start;
                    position: sticky;
                    top: 6rem;
                }

                /* Question */
                .question-header { margin-bottom: 2rem; }
                .question-number {
                    color: var(--color-accent-1);
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .question-text {
                    font-size: 1.5rem;
                    color: var(--color-text-primary);
                    margin-top: 0.75rem;
                    line-height: 1.4;
                }

                /* Options */
                .options-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 3rem;
                }
                .option-btn {
                    display: flex;
                    align-items: center;
                    padding: 1.25rem;
                    border: 2px solid transparent;
                    background: #f9fafb;
                    border-radius: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                    font-family: inherit;
                    color: var(--color-text-secondary);
                }
                .option-btn:hover { background: #f3f4f6; }
                .option-btn.selected {
                    background: #e0e7ff;
                    border-color: #6366f1;
                    color: #4338ca;
                    font-weight: 500;
                }
                .option-label {
                    width: 32px;
                    height: 32px;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    font-weight: 700;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .option-text { flex: 1; font-size: 1.1rem; }
                .check-icon { margin-left: 1rem; color: #4338ca; }

                /* Controls */
                .navigation-controls {
                    display: flex;
                    justify-content: space-between;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 2rem;
                }
                .nav-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; }
                .btn-submit { background: #16a34a; color: white; }
                .btn-submit:hover { background: #15803d; }

                /* Palette Grid */
                .question-palette h3 { font-size: 1.1rem; margin-bottom: 1.5rem; }
                .palette-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }
                .palette-btn {
                    aspect-ratio: 1;
                    border-radius: 0.5rem;
                    background: #f3f4f6;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    color: #6b7280;
                    transition: all 0.2s;
                }
                .palette-btn:hover { background: #e5e7eb; }
                .palette-btn.current { background: #4f46e5; color: white; }
                .palette-btn.answered { background: #e0e7ff; color: #4338ca; }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                .dot { width: 10px; height: 10px; border-radius: 2px; background: #f3f4f6; }
                .dot.current { background: #4f46e5; }
                .dot.answered { background: #e0e7ff; }

                @media (max-width: 1024px) {
                    .exam-layout { flex-direction: column; }
                    .question-palette { width: 100%; position: static; }
                }
            `}</style>
        </div>
    );
};

export default TakeExam;
