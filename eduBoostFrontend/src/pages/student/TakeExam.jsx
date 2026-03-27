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
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

const TakeExam = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    // Server-driven exam configuration & attempt info
    const [loading, setLoading] = useState(true);
    const [attemptCode, setAttemptCode] = useState(null);
    const [activeTabToken, setActiveTabToken] = useState(null);
    const [examTitle, setExamTitle] = useState('');
    const [questions, setQuestions] = useState([]);

    // State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [showViolationWarning, setShowViolationWarning] = useState(false);
    const [takeover, setTakeover] = useState(false);
    const [initError, setInitError] = useState(null);

    const lastSavedVersionRef = useRef(null);
    const autosaveTimerRef = useRef(null);
    const heartbeatTimerRef = useRef(null);
    const broadcastRef = useRef(null);
    const hiddenTimerRef = useRef(null);
    const lastViolationSentAtRef = useRef(0);
    const autosaveDataRef = useRef({ currentQuestion: 0, questions: [], answers: {} });

    // ===== Helpers =====

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
        if (isSubmitted || takeover) return;
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion]: option,
        }));
    };

    const handleTextChange = (text) => {
        if (isSubmitted || takeover) return;
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion]: text,
        }));
    };

    const handleSubmit = (auto = false) => {
        if (isSubmitted || !attemptCode || !activeTabToken) return;

        if (!auto && !window.confirm("Bạn có chắc chắn muốn nộp bài không?")) return;

        // Send a final snapshot of selected answers to persist before grading.
        const answersPayload = (questions || []).map((q, idx) => ({
            examQuestionId: q.examQuestionId,
            selectedOption: q.questionType === 'FILL_BLANK' ? null : answers[idx] ?? null,
            textAnswer: q.questionType === 'FILL_BLANK' ? answers[idx] ?? null : null,
            flagged: false,
        }));

        examService
            .submitExamAttempt(attemptCode, { activeTabToken, answers: answersPayload })
            .then((res) => {
                setSubmitResult(res);
                setIsSubmitted(true);
                setShowWarning(false);
                showSuccessToast("Đã nộp bài thành công");
            })
            .catch((err) => {
                const status = err?.response?.status;
                const message = String(err?.response?.data?.message || '').toLowerCase();
                const isTakeover = message.includes('taken over') || message.includes('another tab');
                if (status === 403 && isTakeover) {
                    setTakeover(true);
                } else {
                    showErrorToast(err?.response?.data?.message || 'Không thể nộp bài');
                }
            });
    };

    useEffect(() => {
        autosaveDataRef.current = { currentQuestion, questions, answers };
    }, [currentQuestion, questions, answers]);

    // ===== Load exam attempt on mount =====
    useEffect(() => {
        if (!id) return;

        let cancelled = false;
        async function init() {
            setLoading(true);
            try {
                const scheduleIdParam = searchParams.get('scheduleId');
                const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : undefined;
                const res = await examService.startExamAttempt(Number(id), scheduleId);
                if (cancelled) return;

                setAttemptCode(res.attemptCode);
                setActiveTabToken(res.activeTabToken);
                setExamTitle(res.examTitle);
                setQuestions(res.questions || []);
                
                const loadedAnswers = {};
                (res.questions || []).forEach((q, idx) => {
                    if (q.questionType === 'FILL_BLANK') {
                        if (q.textAnswer != null) loadedAnswers[idx] = q.textAnswer;
                    } else if (q.selectedOption != null) {
                        loadedAnswers[idx] = q.selectedOption;
                    }
                });
                setAnswers(loadedAnswers);
                
                setCurrentQuestion(res.currentQuestionIndex || 0);
                setTimeLeft(res.remainingSeconds ?? (res.durationMinutes || 45) * 60);
                lastSavedVersionRef.current = res.serverVersion || null;

                // Setup cross-tab communication
                if ('BroadcastChannel' in window) {
                    const channel = new BroadcastChannel(`exam_attempt_${res.attemptCode}`);
                    channel.onmessage = (event) => {
                        if (event.data === 'TAKEOVER') {
                            setTakeover(true);
                        }
                    };
                    broadcastRef.current = channel;
                } else {
                    const key = `exam_attempt_active_${res.attemptCode}`;
                    window.addEventListener('storage', (e) => {
                        if (e.key === key && e.newValue === 'TAKEOVER') {
                            setTakeover(true);
                        }
                    });
                }
            } catch (err) {
                const msg = err?.response?.data?.message || 'Không thể tải bài thi';
                showErrorToast(msg);
                setInitError(msg);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        init();

        return () => {
            cancelled = true;
            if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current);
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
            if (broadcastRef.current) broadcastRef.current.close();
        };
    }, [id]);

    // ===== Timer Logic =====
    useEffect(() => {
        if (!attemptCode || isSubmitted || takeover || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto-submit
                    return 0;
                }
                if (prev === 5 * 60) {
                    setShowWarning(true);
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [attemptCode, isSubmitted, takeover, timeLeft]);

    // ===== Auto-save every 45s =====
    useEffect(() => {
        if (!attemptCode || !activeTabToken || isSubmitted || takeover) return;

        const interval = setInterval(() => {
            const { currentQuestion: latestQuestion, questions: latestQuestions, answers: latestAnswers } = autosaveDataRef.current;
            const payload = {
                activeTabToken,
                currentQuestionIndex: latestQuestion,
                clientVersion: lastSavedVersionRef.current,
                answers: (latestQuestions || []).map((q, index) => ({
                    examQuestionId: q.examQuestionId,
                    selectedOption: q.questionType === 'FILL_BLANK' ? null : latestAnswers[index] ?? null,
                    textAnswer: q.questionType === 'FILL_BLANK' ? latestAnswers[index] ?? null : null,
                    flagged: false,
                })),
            };

            examService
                .autoSaveExamAttempt(attemptCode, payload)
                .then((res) => {
                    lastSavedVersionRef.current = res.serverVersion || null;
                })
                .catch((err) => {
                    const status = err?.response?.status;
                    const message = String(err?.response?.data?.message || '').toLowerCase();
                    const isTakeover = message.includes('taken over') || message.includes('another tab');
                    if (status === 403 && isTakeover) {
                        setTakeover(true);
                    }
                });
        }, 45000); // 45s

        autosaveTimerRef.current = interval;
        return () => clearInterval(interval);
    }, [attemptCode, activeTabToken, isSubmitted, takeover]);

    // ===== Heartbeat every 25s =====
    useEffect(() => {
        if (!attemptCode || !activeTabToken || isSubmitted || takeover) return;

        const interval = setInterval(() => {
            examService
                .heartbeatExamAttempt(attemptCode, { activeTabToken })
                .catch((err) => {
                    const status = err?.response?.status;
                    const message = String(err?.response?.data?.message || '').toLowerCase();
                    const isTakeover = message.includes('taken over') || message.includes('another tab');
                    if (status === 403 && isTakeover) {
                        setTakeover(true);
                    }
                });
        }, 25000);

        heartbeatTimerRef.current = interval;
        return () => clearInterval(interval);
    }, [attemptCode, activeTabToken, isSubmitted, takeover]);

    // ===== Violation Detection (tab switch) =====
    useEffect(() => {
        if (!attemptCode || isSubmitted || takeover) return;

        const reportViolation = () => {
            const now = Date.now();
            if (now - lastViolationSentAtRef.current < 3000) return;
            lastViolationSentAtRef.current = now;
            if (attemptCode && !isSubmitted && !takeover) {
                examService.reportExamViolation(attemptCode, 'TAB_SWITCH').catch(() => {});
                setShowViolationWarning(true);
            }
        };

        const handleVisibilityChange = () => {
            // Debounce: only report if hidden for a short threshold (avoid false positives on quick switches)
            if (document.hidden) {
                if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
                hiddenTimerRef.current = setTimeout(() => {
                    reportViolation();
                }, 3000); // 3s hidden => violation
            } else {
                if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
                hiddenTimerRef.current = null;
            }
        };

        const handleWindowBlur = () => {
            reportViolation();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            if (hiddenTimerRef.current) clearTimeout(hiddenTimerRef.current);
        };
    }, [attemptCode, isSubmitted, takeover]);

    if (loading) {
        return (
            <div className="exam-auth-container">
                <div className="auth-card glass">
                    <div className="auth-icon-wrapper">
                        <Lock size={48} />
                    </div>
                    <h2>Đang tải bài thi...</h2>
                    <p>Vui lòng chờ trong giây lát.</p>
                </div>
            </div>
        );
    }

    if (initError) {
        return (
            <div className="exam-auth-container">
                <div className="auth-card glass">
                    <div className="auth-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <XCircle size={48} />
                    </div>
                    <h2>Không thể vào thi</h2>
                    <p>{initError}</p>
                    <Link to="/student/exams" className="btn btn-primary full-width" style={{ marginTop: '1.5rem' }}>
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    if (takeover) {
        return (
            <div className="exam-auth-container">
                <div className="auth-card glass">
                    <div className="auth-icon-wrapper">
                        <AlertCircle size={48} />
                    </div>
                    <h2>Phiên làm bài đã chuyển sang tab khác</h2>
                    <p>Bạn không thể tiếp tục làm bài trên tab này. Vui lòng quay lại tab đang hoạt động.</p>
                    <Link to="/student/exams" className="btn btn-primary full-width">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    // Results Screen
    if (isSubmitted) {
        const hidden = submitResult?.scoresHidden === true;

        return (
            <div className="exam-result-container">
                <div className="result-card glass">
                    <div className="result-icon-wrapper pass">
                        <CheckCircle size={48} />
                    </div>

                    <h2>Đã nộp bài thành công!</h2>
                    <p className="subtitle">
                        {hidden
                            ? 'Bài đã nộp. Điểm sẽ hiển thị khi giáo viên công bố kết quả.'
                            : 'Hệ thống đã ghi nhận câu trả lời của bạn.'}
                    </p>

                    {!hidden && (
                        <div className="score-box">
                            <div className="score-box">
                                <span className="score-label">SỐ CÂU ĐÚNG</span>
                                <span className="score-value">
                                    {submitResult?.correctCount ?? 0}/{submitResult?.totalQuestions || questions.length}
                                </span>
                            </div>
                            <div className="score-box">
                                <span className="score-label">ĐIỂM SỐ</span>
                                <span className="score-value">
                                    {(submitResult?.score != null ? Number(submitResult.score) : 0).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {attemptCode && (
                            <Link to={`/student/exam-review/${attemptCode}`} className="btn btn-outline full-width">
                                Xem lại bài làm
                            </Link>
                        )}
                        <Link to="/student/exams" className="btn btn-primary full-width">
                            Quay lại danh sách
                        </Link>
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
                    <div className="warning-popup glass" style={{ borderColor: '#fef08a' }}>
                        <AlertTriangle size={32} className="text-warning" style={{ color: '#ca8a04' }} />
                        <div className="warning-content">
                            <h3 style={{ color: '#a16207' }}>Sắp hết giờ!</h3>
                            <p style={{ color: '#854d0e' }}>Chỉ còn dưới 5 phút. Vui lòng kiểm tra lại bài làm.</p>
                        </div>
                        <button onClick={() => setShowWarning(false)} className="btn-close" style={{ background: '#fef08a', color: '#854d0e' }}>
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Violation Popup */}
            {showViolationWarning && (
                <div className="warning-overlay">
                    <div className="warning-popup glass">
                        <AlertTriangle size={32} className="text-warning" />
                        <div className="warning-content">
                            <h3>Vi phạm nội quy thi!</h3>
                            <p>Phát hiện chuyển tab hoặc rời khỏi trang. Hệ thống đã ghi nhận vi phạm.</p>
                        </div>
                        <button onClick={() => setShowViolationWarning(false)} className="btn-close">
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="exam-header-bar glass">
                <div className="exam-info">
                    <h1>{examTitle}</h1>
                    <div className="progress-text">
                        Câu {currentQuestion + 1} / {questions.length || 0}
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
                        <span className="question-number">Câu hỏi {questions[currentQuestion]?.orderNumber}</span>
                        <h2 className="question-text">
                            {questions[currentQuestion]?.questionText}
                        </h2>
                    </div>

                    <div className="options-list">
                        {questions[currentQuestion]?.questionType === 'FILL_BLANK' ? (
                            <div style={{ width: '100%' }}>
                                <input
                                    type="text"
                                    value={answers[currentQuestion] ?? ''}
                                    onChange={(e) => handleTextChange(e.target.value)}
                                    placeholder="Nhập đáp án của bạn..."
                                    className="fillblank-input"
                                />
                            </div>
                        ) : (
                            questions[currentQuestion]?.options?.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(option)}
                                    className={`option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                                >
                                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                    <span className="option-text">{option}</span>
                                    {answers[currentQuestion] === option && <CheckCircle size={20} className="check-icon" />}
                                </button>
                            ))
                        )}
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
