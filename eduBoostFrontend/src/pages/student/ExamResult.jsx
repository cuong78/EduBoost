import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle, XCircle, ArrowLeft, Clock, AlertTriangle,
    Award, BookOpen, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import examAssignmentService from '../../services/examAssignmentService';

const ExamResult = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQuestions, setShowQuestions] = useState(false);

    useEffect(() => {
        const loadResult = async () => {
            try {
                const data = await examAssignmentService.getResult(resultId);
                setResult(data);
            } catch (err) {
                console.error('Failed to load result:', err);
                setError('Không thể tải kết quả bài thi');
            } finally {
                setLoading(false);
            }
        };
        loadResult();
    }, [resultId]);

    if (loading) return (
        <div style={styles.center}>
            <RefreshCw size={32} className="spin" style={{ color: '#6366f1' }} />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Đang tải kết quả...</p>
        </div>
    );

    if (error) return (
        <div style={styles.center}>
            <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h3 style={{ color: '#1e293b' }}>{error}</h3>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>
                <ArrowLeft size={16} /> Quay lại
            </button>
        </div>
    );

    if (!result) return null;

    const isPass = result.status === 'PASSED' || Number(result.percentage) >= 50;
    const pct = Number(result.percentage || 0);
    const correct = result.questionResults?.filter(q => q.correct || q.isCorrect).length || 0;
    const total = result.questionResults?.length || 0;

    const fmtDuration = (s) => {
        if (!s) return '—';
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m} phút ${sec > 0 ? `${sec} giây` : ''}`;
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Back button */}
                <button onClick={() => navigate('/student/exams')} style={styles.backLink}>
                    <ArrowLeft size={16} /> Quay lại danh sách bài thi
                </button>

                {/* Header Card */}
                <div style={{ ...styles.card, ...styles.headerCard }}>
                    <div style={{
                        ...styles.iconCircle,
                        background: isPass ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)'
                    }}>
                        {isPass ? <CheckCircle size={48} color="white" /> : <XCircle size={48} color="white" />}
                    </div>
                    <h1 style={styles.title}>{result.examTitle || 'Kết quả bài thi'}</h1>
                    <span style={{
                        ...styles.statusBadge,
                        background: isPass ? '#dcfce7' : '#fee2e2',
                        color: isPass ? '#16a34a' : '#dc2626',
                    }}>
                        {isPass ? '✅ ĐẠT' : '❌ CHƯA ĐẠT'}
                    </span>
                </div>

                {/* Score Grid */}
                <div style={styles.scoreGrid}>
                    <div style={styles.scoreCard}>
                        <Award size={24} style={{ color: '#6366f1' }} />
                        <div style={styles.scoreLabel}>Điểm số</div>
                        <div style={{ ...styles.scoreValue, color: isPass ? '#16a34a' : '#ef4444' }}>
                            {Number(result.score || 0).toFixed(1)}/{Number(result.maxScore || 0).toFixed(1)}
                        </div>
                    </div>
                    <div style={styles.scoreCard}>
                        <div style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: `conic-gradient(${isPass ? '#16a34a' : '#ef4444'} ${pct * 3.6}deg, #e2e8f0 0deg)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: '50%', background: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.9rem', color: isPass ? '#16a34a' : '#ef4444',
                            }}>
                                {pct.toFixed(0)}%
                            </div>
                        </div>
                        <div style={styles.scoreLabel}>Phần trăm</div>
                    </div>
                    <div style={styles.scoreCard}>
                        <BookOpen size={24} style={{ color: '#0ea5e9' }} />
                        <div style={styles.scoreLabel}>Câu đúng</div>
                        <div style={styles.scoreValue}>{correct}/{total}</div>
                    </div>
                    <div style={styles.scoreCard}>
                        <Clock size={24} style={{ color: '#f59e0b' }} />
                        <div style={styles.scoreLabel}>Thời gian</div>
                        <div style={{ ...styles.scoreValue, fontSize: '1rem' }}>{fmtDuration(result.timeTakenSeconds)}</div>
                    </div>
                </div>

                {/* Violation info */}
                {(result.tabSwitchCount > 0) && (
                    <div style={styles.violationBox}>
                        <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        <span>Vi phạm: <strong>{result.tabSwitchCount}</strong> lần thoát tab</span>
                    </div>
                )}

                {/* AI Advice */}
                {result.aiAnalysisStudent && (
                    <div style={styles.aiCard}>
                        <div style={styles.aiTitle}>🤖 Lời khuyên từ AI</div>
                        <p style={styles.aiText}>{result.aiAnalysisStudent}</p>
                    </div>
                )}

                {/* Question Details Toggle */}
                {result.questionResults && result.questionResults.length > 0 && (
                    <div style={styles.card}>
                        <button
                            onClick={() => setShowQuestions(!showQuestions)}
                            style={styles.toggleBtn}
                        >
                            <BookOpen size={18} />
                            {showQuestions ? 'Ẩn' : 'Xem'} chi tiết từng câu ({total} câu)
                            {showQuestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {showQuestions && (
                            <div style={styles.questionList}>
                                {result.questionResults.map((q, idx) => {
                                    const qCorrect = q.correct || q.isCorrect;
                                    return (
                                        <div key={idx} style={{
                                            ...styles.questionItem,
                                            borderLeft: `4px solid ${qCorrect ? '#16a34a' : '#ef4444'}`,
                                        }}>
                                            <div style={styles.qHeader}>
                                                <span style={styles.qNum}>Câu {q.orderNumber || idx + 1}</span>
                                                <span style={{
                                                    ...styles.qBadge,
                                                    background: qCorrect ? '#dcfce7' : '#fee2e2',
                                                    color: qCorrect ? '#16a34a' : '#dc2626',
                                                }}>
                                                    {qCorrect ? '✓ Đúng' : '✗ Sai'}
                                                    {q.points != null && ` · ${Number(q.points).toFixed(1)} đ`}
                                                </span>
                                            </div>
                                            <p style={styles.qText}>{q.questionText}</p>
                                            <div style={styles.answerRow}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={styles.ansLabel}>Đáp án của bạn</div>
                                                    <div style={{
                                                        ...styles.ansValue,
                                                        color: qCorrect ? '#16a34a' : '#ef4444',
                                                    }}>
                                                        {q.selectedAnswer || '(Không trả lời)'}
                                                    </div>
                                                </div>
                                                {!qCorrect && (
                                                    <div style={{ flex: 1 }}>
                                                        <div style={styles.ansLabel}>Đáp án đúng</div>
                                                        <div style={{ ...styles.ansValue, color: '#16a34a' }}>
                                                            {q.correctAnswer}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {q.explanation && (
                                                <div style={styles.explanation}>
                                                    💡 {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '2rem 1rem',
    },
    container: {
        maxWidth: '720px',
        margin: '0 auto',
    },
    center: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '80vh',
    },
    backLink: {
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        color: '#6366f1', cursor: 'pointer', background: 'none', border: 'none',
        fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500,
    },
    backBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0',
        background: 'white', cursor: 'pointer', marginTop: '1rem',
    },
    card: {
        background: 'white', borderRadius: '16px', padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1rem',
    },
    headerCard: {
        textAlign: 'center', padding: '2rem 1.5rem',
    },
    iconCircle: {
        width: 80, height: 80, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem',
    },
    title: {
        fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0.5rem 0',
    },
    statusBadge: {
        display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '20px',
        fontWeight: 600, fontSize: '0.95rem',
    },
    scoreGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem', marginBottom: '1rem',
    },
    scoreCard: {
        background: 'white', borderRadius: '14px', padding: '1.25rem',
        textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    },
    scoreLabel: {
        fontSize: '0.8rem', color: '#64748b', fontWeight: 500,
    },
    scoreValue: {
        fontSize: '1.4rem', fontWeight: 700, color: '#1e293b',
    },
    violationBox: {
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px',
        padding: '0.85rem 1.25rem', marginBottom: '1rem', fontSize: '0.9rem',
    },
    aiCard: {
        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem',
    },
    aiTitle: {
        fontWeight: 600, marginBottom: '0.5rem', color: '#4338ca',
    },
    aiText: {
        color: '#475569', lineHeight: 1.6, margin: 0, fontSize: '0.92rem',
    },
    toggleBtn: {
        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.95rem', fontWeight: 600, color: '#6366f1', padding: '0.25rem 0',
    },
    questionList: {
        marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
    },
    questionItem: {
        background: '#f8fafc', borderRadius: '10px', padding: '1rem',
    },
    qHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.5rem',
    },
    qNum: { fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' },
    qBadge: {
        padding: '0.2rem 0.6rem', borderRadius: '8px',
        fontSize: '0.78rem', fontWeight: 600,
    },
    qText: {
        color: '#334155', margin: '0.5rem 0', lineHeight: 1.5, fontSize: '0.9rem',
    },
    answerRow: {
        display: 'flex', gap: '1rem', marginTop: '0.5rem',
    },
    ansLabel: {
        fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.2rem',
    },
    ansValue: {
        fontWeight: 600, fontSize: '0.9rem',
    },
    explanation: {
        marginTop: '0.5rem', padding: '0.6rem', background: '#fffbeb',
        borderRadius: '8px', fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5,
    },
};

export default ExamResult;
