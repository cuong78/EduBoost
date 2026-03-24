import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { examService } from '../../services/examService';
import { showErrorToast } from '../../utils/show-toast';

export default function ExamAttemptReview() {
    const { attemptCode } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attemptCode) return;
        examService
            .getExamAttemptReview(attemptCode)
            .then(setData)
            .catch((e) => showErrorToast(e?.response?.data?.message || 'Không tải được bài làm'))
            .finally(() => setLoading(false));
    }, [attemptCode]);

    if (loading) {
        return (
            <div className="exam-page-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 className="spin" size={40} />
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="exam-page-container" style={{ padding: '2rem' }}>
                <Link to="/student/exams" className="btn btn-outline">
                    <ArrowLeft size={18} /> Quay lại
                </Link>
            </div>
        );
    }

    return (
        <div className="exam-page-container" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
            <Link to="/student/exams" className="btn btn-outline" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ArrowLeft size={18} /> Danh sách bài thi
            </Link>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                    <BookOpen size={28} /> {data.examTitle}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Xem lại bài làm</p>
                {data.answerKeyRevealed && data.score != null && (
                    <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                        <strong>Điểm:</strong> {Number(data.score).toFixed(1)} / {Number(data.maxScore).toFixed(1)}
                        {data.percentage != null && ` (${Number(data.percentage).toFixed(1)}%)`}
                        {' — '}
                        <strong>Đúng:</strong> {data.correctCount}/{data.totalQuestions}
                    </p>
                )}
                {!data.answerKeyRevealed && (
                    <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: 8, color: '#92400e' }}>
                        Đáp án đúng và điểm từng câu sẽ hiển thị sau khi giáo viên công bố kết quả. Bạn vẫn có thể đối chiếu phần bạn đã chọn.
                    </p>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(data.questions || []).map((q) => (
                    <div key={q.examQuestionId} className="glass" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                            Câu {q.orderNumber}
                        </div>
                        <p style={{ marginBottom: '1rem' }}>{q.questionText}</p>
                        <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                            <div>
                                <strong>Bạn chọn:</strong>{' '}
                                {q.selectedOption ?? (q.textAnswer != null && q.textAnswer.trim() !== '' ? q.textAnswer : '(chưa chọn)')}
                            </div>
                            {data.answerKeyRevealed && q.correct != null && (
                                <>
                                    <div style={{ marginTop: 6 }}>
                                        <strong>Đáp án đúng:</strong> {q.correctAnswer}
                                    </div>
                                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {q.correct ? (
                                            <>
                                                <CheckCircle size={20} className="text-green" style={{ color: '#16a34a' }} /> Đúng (+{Number(q.pointsEarned || 0).toFixed(1)} đ)
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={20} style={{ color: '#dc2626' }} /> Sai
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
