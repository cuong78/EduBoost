import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Clock, ChevronLeft, ChevronRight, CheckCircle,
    AlertTriangle, Lock, AlertCircle, XCircle,
    Eye, EyeOff, Wifi, WifiOff, Maximize, Shield
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import examAssignmentService from '../../services/examAssignmentService';
import { useExamProctor } from '../../hooks/useExamProctor';
import { useAuth } from '../../hooks/useAuth';
import MathRenderer from '../../components/common/MathRenderer';

const TakeExam = () => {
    const { assignmentId: assignmentIdParam, id: legacyId } = useParams();
    const assignmentId = assignmentIdParam || legacyId;
    const navigate = useNavigate();
    const { user } = useAuth();

    // ── State ──────────────────────────────────────────────────────────────
    const [phase, setPhase] = useState('entry'); // entry | exam | submitted
    const [codeInput, setCodeInput] = useState('');
    const [codeError, setCodeError] = useState('');
    const [validatingCode, setValidatingCode] = useState(false);

    const [assignment, setAssignment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingExam, setLoadingExam] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({}); // { examQuestionId: selectedAnswer }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const [showWarning5min, setShowWarning5min] = useState(false);
    const [violationBanner, setViolationBanner] = useState(null);

    const startTimestamp = useRef(Date.now());
    const timerRef = useRef(null);

    // ── Anti-cheat proctoring ──────────────────────────────────────────────
    const handleAutoSubmit = useCallback((source) => {
        if (phase === 'exam' && !isSubmitting) {
            handleSubmit(source);
        }
    }, [phase, isSubmitting]);

    const proctor = useExamProctor({
        assignmentId: assignment?.assignmentId,
        studentId: user?.userId,
        studentName: user?.fullName,
        enabled: phase === 'exam',
        onAutoSubmit: handleAutoSubmit,
    });

    // Show violation banner every time a new violation is detected
    useEffect(() => {
        const latest = proctor.violations[proctor.violations.length - 1];
        if (!latest) return;
        const labels = {
            TAB_SWITCH: '⚠️ Bạn đã chuyển tab! Giáo viên đã được thông báo.',
            FULLSCREEN_EXIT: '⚠️ Bạn thoát toàn màn hình! Hãy vào lại.',
            WINDOW_BLUR: '⚠️ Bạn rời khỏi cửa sổ thi!',
            COPY_PASTE: '⚠️ Phát hiện copy/paste!',
            NETWORK_OFFLINE: '❌ Mất kết nối mạng!',
        };
        setViolationBanner(labels[latest.reason] || `⚠️ Vi phạm: ${latest.reason}`);
        const t = setTimeout(() => setViolationBanner(null), 4000);
        return () => clearTimeout(t);
    }, [proctor.violations.length]);

    // ── Timer ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'exam' || isSubmitting) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                proctor.setTimeLeft(prev - 1);
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit('AUTO_TIMER');
                    return 0;
                }
                if (prev === 300) setShowWarning5min(true);
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase, isSubmitting]);

    // ── Validate access code ───────────────────────────────────────────────
    const handleValidateCode = async (e) => {
        e.preventDefault();
        if (!codeInput.trim()) { setCodeError('Vui lòng nhập mã vào thi'); return; }
        setValidatingCode(true);
        setCodeError('');
        try {
            const data = await examAssignmentService.validateCode(assignmentId, codeInput.toUpperCase());
            setAssignment(data);
            // Calculate duration
            const endTime = new Date(data.endTime);
            const now = new Date();
            const secsLeft = Math.max(0, Math.floor((endTime - now) / 1000));
            const duration = data.durationMinutes ? data.durationMinutes * 60 : secsLeft;
            setTimeLeft(Math.min(secsLeft, duration));

            // Load exam questions via GET /exams/{examId}
            setLoadingExam(true);
            try {
                const { apiClient } = await import('../../services/api');
                const examResp = await apiClient.get(`/exams/${data.examId}`);
                const examData = examResp.data;
                // ExamResponse contains examQuestions array
                if (Array.isArray(examData?.examQuestions)) {
                    setQuestions(examData.examQuestions);
                } else if (Array.isArray(examData?.questions)) {
                    setQuestions(examData.questions);
                } else if (Array.isArray(examData)) {
                    setQuestions(examData);
                }
            } catch (qErr) {
                console.warn('Failed to load questions:', qErr);
            }
            setLoadingExam(false);
            setPhase('exam');
        } catch (err) {
            setCodeError(err?.response?.data?.message || 'Mã vào thi không đúng hoặc bài thi chưa bắt đầu');
        } finally {
            setValidatingCode(false);
        }
    };

    // ── Select answer ──────────────────────────────────────────────────────
    const handleSelect = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (source = 'MANUAL') => {
        if (isSubmitting) return;
        if (source === 'MANUAL' && !window.confirm('Bạn có chắc muốn nộp bài không?')) return;

        clearInterval(timerRef.current);
        setIsSubmitting(true);

        const timeTaken = Math.floor((Date.now() - startTimestamp.current) / 1000);
        const answerList = questions.map(q => ({
            questionId: q.id,
            selectedAnswer: answers[q.id] || null,
        }));

        try {
            const data = await examAssignmentService.submitExam({
                assignmentId: Number(assignmentId),
                answers: answerList,
                timeTakenSeconds: timeTaken,
                submissionSource: source,
                tabSwitchCount: proctor.violations.length,
            });
            setResult(data);
            setPhase('submitted');
        } catch (err) {
            // If already submitted, go to result
            if (err?.response?.status === 400 && err?.response?.data?.message?.includes('đã nộp')) {
                setPhase('submitted');
            } else {
                alert('Lỗi khi nộp bài: ' + (err?.response?.data?.message || 'Hãy thử lại'));
                setIsSubmitting(false);
            }
        }
    }, [isSubmitting, questions, answers, assignmentId, proctor.violations.length]);

    // ── Format helpers ─────────────────────────────────────────────────────
    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    };

    const answeredCount = Object.keys(answers).length;

    // ── Phase: Entry ───────────────────────────────────────────────────────
    if (phase === 'entry') {
        return (
            <div className="exam-auth-container">
                <div className="auth-card glass">
                    <div className="auth-icon-wrapper">
                        <Lock size={40} color="white" />
                    </div>
                    <h2>Nhập mã vào thi</h2>
                    <p>Giáo viên sẽ đọc mã cho lớp vào đúng giờ thi.</p>

                    <form onSubmit={handleValidateCode} className="auth-form">
                        <input
                            type="text"
                            placeholder="Nhập mã 6 ký tự..."
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                            className="auth-input code-input"
                            maxLength={6}
                            autoFocus
                        />
                        {codeError && (
                            <div className="error-message">
                                <AlertCircle size={16} /> {codeError}
                            </div>
                        )}
                        <div className="warning-info">
                            <Shield size={16} />
                            <span>Bài thi sẽ chạy toàn màn hình. Thoát khỏi bài thi sẽ bị giáo viên ghi nhận.</span>
                        </div>
                        <button type="submit" className="btn btn-primary full-width" disabled={validatingCode || codeInput.length < 6}>
                            {validatingCode ? 'Đang kiểm tra...' : '🔓 Vào thi'}
                        </button>
                    </form>
                </div>

                <style>{`
                    .exam-auth-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
                    .auth-card { max-width: 440px; width: 100%; padding: 2.5rem; border-radius: 24px; text-align: center; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
                    .auth-icon-wrapper { width: 72px; height: 72px; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
                    .auth-card h2 { margin: 0 0 0.5rem; font-size: 1.6rem; }
                    .auth-card p { color: #64748b; margin-bottom: 1.5rem; }
                    .auth-input { width: 100%; box-sizing: border-box; padding: 0.9rem 1rem; border-radius: 12px; border: 2px solid #e2e8f0; margin-bottom: 1rem; font-size: 1rem; outline: none; transition: border-color 0.2s; }
                    .auth-input:focus { border-color: #6366f1; }
                    .code-input { font-size: 2rem; font-weight: 800; letter-spacing: 8px; text-align: center; font-family: monospace; }
                    .error-message { color: #dc2626; font-size: 0.875rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
                    .warning-info { display: flex; align-items: flex-start; gap: 8px; background: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 10px 12px; margin-bottom: 1rem; font-size: 0.82rem; color: #713f12; text-align: left; }
                    .full-width { width: 100%; }
                `}</style>
            </div>
        );
    }

    // ── Phase: Submitted ───────────────────────────────────────────────────
    if (phase === 'submitted') {
        const isPass = result && result.percentage >= 50;
        return (
            <div className="exam-result-container">
                <div className="result-card">
                    <div className={`result-icon-wrapper ${isPass ? 'pass' : 'fail'}`}>
                        {isPass ? <CheckCircle size={52} /> : <XCircle size={52} />}
                    </div>
                    <h2>{isSubmitting ? 'Đang nộp bài...' : 'Đã nộp bài thành công!'}</h2>
                    <p className="subtitle">Hệ thống đã ghi nhận câu trả lời của bạn.</p>

                    {result && (
                        <>
                            <div className="score-box">
                                <div className="score-item">
                                    <span className="label">Điểm số</span>
                                    <span className={`value ${isPass ? 'text-green' : 'text-red'}`}>
                                        {result.score}/{result.maxScore}
                                    </span>
                                </div>
                                <div className="score-divider"></div>
                                <div className="score-item">
                                    <span className="label">Phần trăm</span>
                                    <span className={`value ${isPass ? 'text-green' : 'text-red'}`}>
                                        {Number(result.percentage).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="score-divider"></div>
                                <div className="score-item">
                                    <span className="label">Kết quả</span>
                                    <span className={`value ${isPass ? 'text-green' : 'text-red'}`} style={{fontSize:'1.2rem'}}>
                                        {isPass ? '✅ ĐẠT' : '❌ CHƯA ĐẠT'}
                                    </span>
                                </div>
                            </div>

                            {result.aiAnalysisStudent && (
                                <div className="ai-advice">
                                    <div className="ai-advice-title">🤖 Lời khuyên từ AI</div>
                                    <p>{result.aiAnalysisStudent}</p>
                                </div>
                            )}

                            {result.resultId && (
                                <button
                                    className="btn btn-outline full-width"
                                    onClick={() => navigate(`/student/exam-result/${result.resultId}`)}
                                    style={{ marginBottom: '0.75rem' }}
                                >
                                    Xem chi tiết kết quả
                                </button>
                            )}
                        </>
                    )}

                    <button className="btn btn-primary full-width" onClick={() => navigate('/student/exams')}>
                        Về danh sách bài thi
                    </button>
                </div>

                <style>{`
                    .exam-result-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
                    .result-card { max-width: 520px; width: 100%; padding: 2.5rem; border-radius: 24px; text-align: center; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
                    .result-icon-wrapper { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
                    .pass { background: #dcfce7; color: #16a34a; }
                    .fail { background: #fee2e2; color: #dc2626; }
                    .result-card h2 { margin-bottom: 0.5rem; font-size: 1.7rem; }
                    .subtitle { color: #64748b; margin-bottom: 2rem; }
                    .score-box { display: flex; background: #f8fafc; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; justify-content: space-around; align-items: center; gap: 1rem; }
                    .score-item { display: flex; flex-direction: column; gap: 0.25rem; }
                    .score-item .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                    .score-item .value { font-size: 2rem; font-weight: 800; color: #1e293b; }
                    .score-divider { width: 1px; height: 40px; background: #e2e8f0; }
                    .text-green { color: #16a34a; }
                    .text-red { color: #dc2626; }
                    .ai-advice { background: linear-gradient(135deg,#f0f9ff,#e0f2fe); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem; text-align: left; }
                    .ai-advice-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; color: #0369a1; }
                    .ai-advice p { font-size: 0.9rem; line-height: 1.6; margin: 0; color: #1e293b; }
                    .full-width { width: 100%; margin-bottom: 0.5rem; }
                `}</style>
            </div>
        );
    }

    // ── Phase: Exam ────────────────────────────────────────────────────────
    const q = questions[currentQuestion];

    return (
        <div className="exam-screen">
            {/* Violation banner */}
            {violationBanner && (
                <div className="violation-banner">
                    {violationBanner}
                </div>
            )}

            {/* 5-min warning */}
            {showWarning5min && (
                <div className="warning-overlay">
                    <div className="warning-popup">
                        <AlertTriangle size={28} color="#dc2626" />
                        <div className="warning-content">
                            <h3>Sắp hết giờ!</h3>
                            <p>Chỉ còn 5 phút. Kiểm tra lại bài làm.</p>
                        </div>
                        <button onClick={() => setShowWarning5min(false)} className="btn-dismiss">Đã hiểu</button>
                    </div>
                </div>
            )}

            {/* Status bar: proctor indicators */}
            <div className="proctor-bar">
                <span className={`indicator ${proctor.tabActive ? 'ok' : 'bad'}`}>
                    {proctor.tabActive ? <Eye size={14}/> : <EyeOff size={14}/>}
                    {proctor.tabActive ? 'Tab active' : 'Out of tab'}
                </span>
                <span className={`indicator ${proctor.isFullscreen ? 'ok' : 'warn'}`}>
                    <Maximize size={14}/>
                    {proctor.isFullscreen ? 'Fullscreen' : 'Chưa fullscreen'}
                </span>
                <span className={`indicator ${proctor.networkOnline ? 'ok' : 'bad'}`}>
                    {proctor.networkOnline ? <Wifi size={14}/> : <WifiOff size={14}/>}
                    {proctor.networkOnline ? 'Online' : 'Offline'}
                </span>
                {proctor.violations.length > 0 && (
                    <span className="indicator bad">
                        <AlertTriangle size={14}/> {proctor.violations.length} vi phạm
                    </span>
                )}
                {!proctor.isFullscreen && (
                    <button className="btn-fullscreen" onClick={proctor.requestFullscreen}>
                        <Maximize size={14}/> Toàn màn hình
                    </button>
                )}
            </div>

            {/* Header */}
            <header className="exam-header-bar">
                <div className="exam-info">
                    <h1>{assignment?.examTitle || 'Bài thi'}</h1>
                    <div className="progress-text">Câu {currentQuestion + 1} / {questions.length} · Đã làm {answeredCount}/{questions.length}</div>
                </div>
                <div className={`timer-display ${timeLeft < 300 ? 'timer-warning' : 'timer-normal'}`}>
                    <Clock size={18} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            <div className="exam-layout">
                {/* Main question */}
                <main className="question-area">
                    {q ? (
                        <>
                            <div className="question-header">
                                <span className="question-number">Câu {currentQuestion + 1}</span>
                                <div className="question-text">
                                    <MathRenderer content={q.questionText || q.question_text || q.text} />
                                </div>
                            </div>

                            <div className="options-list">
                                {[
                                    { label: 'A', value: q.correctAnswer || q.optionA, isCorrect: true },
                                    { label: 'B', value: q.wrongAnswer1 || q.optionB },
                                    { label: 'C', value: q.wrongAnswer2 || q.optionC },
                                    { label: 'D', value: q.wrongAnswer3 || q.optionD },
                                ]
                                    .filter(o => o.value)
                                    // Shuffle in display — answers may already be shuffled by examService
                                    .map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(q.id, opt.value)}
                                            className={`option-btn ${answers[q.id] === opt.value ? 'selected' : ''}`}
                                        >
                                            <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                            <span className="option-text">
                                                <MathRenderer content={opt.value} />
                                            </span>
                                            {answers[q.id] === opt.value && <CheckCircle size={20} className="check-icon" />}
                                        </button>
                                    ))}
                            </div>

                            <div className="navigation-controls">
                                <button
                                    onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
                                    disabled={currentQuestion === 0}
                                    className="btn btn-outline nav-btn"
                                >
                                    <ChevronLeft size={18} /> Quay lại
                                </button>
                                {currentQuestion === questions.length - 1 ? (
                                    <button onClick={() => handleSubmit('MANUAL')} className="btn btn-submit nav-btn" disabled={isSubmitting}>
                                        {isSubmitting ? 'Đang nộp...' : '✅ Nộp bài'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1))}
                                        className="btn btn-primary nav-btn"
                                    >
                                        Tiếp theo <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>Đang tải câu hỏi...</p>
                    )}
                </main>

                {/* Palette */}
                <aside className="question-palette">
                    <h3>Danh sách câu hỏi</h3>
                    <div className="palette-grid">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`palette-btn ${currentQuestion === idx ? 'current' : answers[questions[idx]?.id] ? 'answered' : ''}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    <div className="palette-legend">
                        <div className="legend-item"><div className="dot current"></div> Đang làm</div>
                        <div className="legend-item"><div className="dot answered"></div> Đã trả lời</div>
                        <div className="legend-item"><div className="dot"></div> Chưa làm</div>
                    </div>
                    <button onClick={() => handleSubmit('MANUAL')} className="btn btn-submit full-width" disabled={isSubmitting} style={{marginTop:'1rem'}}>
                        {isSubmitting ? 'Đang nộp...' : `Nộp bài (${answeredCount}/${questions.length})`}
                    </button>
                </aside>
            </div>

            <style>{`
                .exam-screen { min-height: 100vh; background: #f1f5f9; padding: 0; position: relative; user-select: none; }

                /* Violation banner */
                .violation-banner { position: fixed; top: 0; left: 0; right: 0; background: #dc2626; color: white; text-align: center; padding: 12px; font-weight: 700; font-size: 1rem; z-index: 1000; animation: slideDownFast 0.3s ease; }
                @keyframes slideDownFast { from { transform: translateY(-100%); } to { transform: translateY(0); } }

                /* Proctor bar */
                .proctor-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 2rem; background: #1e293b; flex-wrap: wrap; }
                .indicator { display: flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 0.78rem; font-weight: 600; }
                .indicator.ok { background: rgba(34,197,94,0.15); color: #22c55e; }
                .indicator.warn { background: rgba(234,179,8,0.15); color: #eab308; }
                .indicator.bad { background: rgba(239,68,68,0.15); color: #ef4444; }
                .btn-fullscreen { margin-left: auto; display: flex; align-items: center; gap: 4px; background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); border-radius: 99px; padding: 4px 12px; font-size: 0.78rem; cursor: pointer; font-weight: 600; }
                .btn-fullscreen:hover { background: rgba(99,102,241,0.35); }

                /* Warning popup */
                .warning-overlay { position: fixed; top: 60px; left: 50%; transform: translateX(-50%); z-index: 999; }
                .warning-popup { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; border-radius: 99px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #fecaca; }
                .warning-content h3 { font-size: 1rem; margin: 0; color: #991b1b; }
                .warning-content p { font-size: 0.85rem; margin: 0; color: #b91c1c; }
                .btn-dismiss { background: #fee2e2; color: #b91c1c; border: none; padding: 0.5rem 1rem; border-radius: 99px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }

                /* Header */
                .exam-header-bar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 50; }
                .exam-info h1 { font-size: 1.1rem; margin: 0 0 0.2rem; color: #1e293b; }
                .progress-text { color: #64748b; font-size: 0.85rem; }
                .timer-display { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; border-radius: 10px; font-family: monospace; font-size: 1.4rem; font-weight: 800; }
                .timer-normal { background: #ede9fe; color: #4338ca; }
                .timer-warning { background: #fee2e2; color: #dc2626; animation: timerPulse 1s infinite; }
                @keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:0.75} }

                /* Layout */
                .exam-layout { display: flex; gap: 1.5rem; max-width: 1280px; margin: 0 auto; padding: 1.5rem; }
                .question-area { flex: 1; background: white; border-radius: 20px; padding: 2.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                .question-palette { width: 280px; background: white; border-radius: 20px; padding: 1.5rem; align-self: flex-start; position: sticky; top: 80px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

                /* Question */
                .question-header { margin-bottom: 2rem; }
                .question-number { color: #6366f1; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .question-text { font-size: 1.3rem; color: #1e293b; margin-top: 0.75rem; line-height: 1.5; }

                /* Options */
                .options-list { display: flex; flex-direction: column; gap: 0.9rem; margin-bottom: 2.5rem; }
                .option-btn { display: flex; align-items: center; padding: 1.1rem 1.25rem; border: 2px solid transparent; background: #f8fafc; border-radius: 14px; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; font-family: inherit; color: #475569; }
                .option-btn:hover { background: #f1f5f9; border-color: #c7d2fe; }
                .option-btn.selected { background: #ede9fe; border-color: #6366f1; color: #4338ca; font-weight: 500; }
                .option-label { width: 36px; height: 36px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-weight: 800; box-shadow: 0 1px 3px rgba(0,0,0,0.08); flex-shrink: 0; font-size: 0.95rem; }
                .option-text { flex: 1; font-size: 1rem; min-width: 0; }
                .check-icon { margin-left: 0.75rem; color: #6366f1; flex-shrink: 0; }

                /* Controls */
                .navigation-controls { display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 2rem; }
                .nav-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; }
                .btn-submit { background: #16a34a; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; padding: 0.75rem 1.5rem; display:flex; align-items:center; gap:0.5rem; font-family:inherit; font-size:0.95rem; transition:background 0.2s; }
                .btn-submit:hover:not(:disabled) { background: #15803d; }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                /* Palette */
                .question-palette h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; }
                .palette-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.6rem; margin-bottom: 1.25rem; }
                .palette-btn { aspect-ratio:1; border-radius: 8px; background: #f1f5f9; border: none; cursor: pointer; font-weight: 700; color: #64748b; transition: all 0.15s; font-size: 0.85rem; }
                .palette-btn:hover { background: #e2e8f0; }
                .palette-btn.current { background: #6366f1; color: white; }
                .palette-btn.answered { background: #dcfce7; color: #16a34a; }
                .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #64748b; margin-bottom: 0.4rem; }
                .dot { width: 12px; height: 12px; border-radius: 3px; background: #f1f5f9; }
                .dot.current { background: #6366f1; }
                .dot.answered { background: #dcfce7; border: 1px solid #86efac; }
                .full-width { width: 100%; }

                @media (max-width: 900px) {
                    .exam-layout { flex-direction: column; padding: 1rem; }
                    .question-palette { width: 100%; position: static; }
                }
            `}</style>
        </div>
    );
};

export default TakeExam;
