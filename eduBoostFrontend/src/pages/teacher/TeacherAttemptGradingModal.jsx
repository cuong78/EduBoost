import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';

export default function TeacherAttemptGradingModal({ scheduleId, attemptCode, onClose, onSaved }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [review, setReview] = useState(null);

    // { [examQuestionId]: { points: string, comment: string } }
    const [grades, setGrades] = useState({});

    useEffect(() => {
        if (!scheduleId || !attemptCode) return;

        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const data = await teacherService.getTeacherAttemptReview(scheduleId, attemptCode);
                if (cancelled) return;
                setReview(data);

                const initial = {};
                (data?.questions || []).forEach((q) => {
                    if (q.questionType !== 'FILL_BLANK') return;
                    initial[q.examQuestionId] = {
                        points: q.teacherPointsOverride != null ? String(q.teacherPointsOverride) : '',
                        comment: q.teacherComment != null ? String(q.teacherComment) : '',
                    };
                });
                setGrades(initial);
            } catch (e) {
                showErrorToast(e?.response?.data?.message || 'Không tải được bài chấm');
                setReview(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [scheduleId, attemptCode]);

    const fillBlankQuestions = useMemo(() => {
        return (review?.questions || []).filter((q) => q.questionType === 'FILL_BLANK');
    }, [review]);

    const getStudentAnswer = (q) => {
        if (q.questionType === 'FILL_BLANK') return q.textAnswer != null && q.textAnswer.trim() !== '' ? q.textAnswer : '(chưa trả lời)';
        return q.selectedOption != null && q.selectedOption.trim() !== '' ? q.selectedOption : '(chưa chọn)';
    };

    const parsePointsOrNull = (value) => {
        if (value == null) return null;
        const v = String(value).trim();
        if (!v) return null;
        const n = Number(v);
        if (Number.isNaN(n)) return null;
        return n;
    };

    const handleSave = async () => {
        if (!review || !fillBlankQuestions.length) {
            onClose?.();
            return;
        }
        setSaving(true);
        try {
            const payload = {
                questionGrades: fillBlankQuestions.map((q) => ({
                    examQuestionId: q.examQuestionId,
                    teacherPointsOverride: parsePointsOrNull(grades[q.examQuestionId]?.points),
                    teacherComment: grades[q.examQuestionId]?.comment ?? null,
                })),
            };

            await teacherService.gradeTeacherAttempt(scheduleId, attemptCode, payload);
            showSuccessToast('Đã lưu chấm điểm');
            onSaved?.();
        } catch (e) {
            showErrorToast(e?.response?.data?.message || 'Không thể lưu chấm điểm');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '980px', width: '95%' }}>
                <div className="modal-header">
                    <h2>Chấm bài - {review?.examTitle || ''}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <Loader2 size={32} className="spin" />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                        <div className="glass" style={{ padding: '1rem', borderRadius: '1rem' }}>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>Danh sách vi phạm</div>
                            {(review?.violations || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Không ghi nhận vi phạm.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                    {(review?.violations || []).map((v, idx) => (
                                        <div
                                            key={`${v.violationType || 'UNKNOWN'}-${v.occurredAt || idx}-${idx}`}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '0.8rem',
                                                padding: '0.45rem 0.6rem',
                                                borderRadius: '0.55rem',
                                                background: '#fff7ed',
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>{v.violationType || 'UNKNOWN'}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {v.occurredAt ? new Date(v.occurredAt).toLocaleString() : '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {(review?.questions || []).map((q) => (
                            <div key={q.examQuestionId} className="glass" style={{ padding: '1rem', borderRadius: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Câu {q.orderNumber}</div>
                                        <div style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                            {q.questionText}
                                        </div>
                                        <div style={{ fontSize: '0.95rem' }}>
                                            <div>
                                                <strong>Trả lời:</strong> {getStudentAnswer(q)}
                                            </div>
                                            <div style={{ marginTop: 6 }}>
                                                <strong>Đáp án:</strong> {q.correctAnswer != null && q.correctAnswer.trim() !== '' ? q.correctAnswer : '-'}
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <strong>Điểm hiện tại:</strong>{' '}
                                                {q.pointsEarned != null ? Number(q.pointsEarned).toFixed(1) : '0.0'} /{' '}
                                                {q.points != null ? Number(q.points).toFixed(1) : '0.0'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {q.questionType === 'FILL_BLANK' ? (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Điểm chấm (0 - {q.points != null ? Number(q.points).toFixed(1) : '0.0'})</label>
                                            <input
                                                type="number"
                                                step={0.1}
                                                value={grades[q.examQuestionId]?.points ?? ''}
                                                onChange={(e) =>
                                                    setGrades((prev) => ({
                                                        ...prev,
                                                        [q.examQuestionId]: {
                                                            ...(prev[q.examQuestionId] || { points: '', comment: '' }),
                                                            points: e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="input"
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Nhận xét</label>
                                            <textarea
                                                value={grades[q.examQuestionId]?.comment ?? ''}
                                                onChange={(e) =>
                                                    setGrades((prev) => ({
                                                        ...prev,
                                                        [q.examQuestionId]: {
                                                            ...(prev[q.examQuestionId] || { points: '', comment: '' }),
                                                            comment: e.target.value,
                                                        },
                                                    }))
                                                }
                                                placeholder="Tuỳ chọn"
                                                className="input"
                                                style={{ minHeight: 80 }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                        Câu này đang chấm tự động (không chỉnh sửa).
                                    </div>
                                )}
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                                Huỷ
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                                {' '}Lưu chấm điểm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

