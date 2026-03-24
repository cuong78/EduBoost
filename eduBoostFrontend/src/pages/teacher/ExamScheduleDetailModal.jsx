import { useState } from 'react';
import { X, Megaphone, Clock } from 'lucide-react';
import ExamResultsModal from './ExamResultsModal';
import TeacherAttemptGradingModal from './TeacherAttemptGradingModal';

export default function ExamScheduleDetailModal({ schedule, onClose, onAnnounce }) {
    const [selectedAttemptCode, setSelectedAttemptCode] = useState(null);
    const [refreshToken, setRefreshToken] = useState(0);

    const isAfterAnnounce = schedule?.scoreRevealMode === 'AFTER_ANNOUNCE';
    const canAnnounce =
        isAfterAnnounce && !schedule?.resultsAnnouncedAt && schedule?.status !== 'CANCELLED' && schedule?.status !== 'CANCELLED';

    const handleGradingSaved = () => {
        setRefreshToken((x) => x + 1);
        setSelectedAttemptCode(null);
    };

    const scoreRevealLabel = schedule?.scoreRevealMode === 'AFTER_ANNOUNCE'
        ? schedule?.resultsAnnouncedAt
            ? 'Đã công bố'
            : 'Chờ công bố'
        : 'Ngay khi nộp';

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '980px', width: '95%' }}>
                <div className="modal-header">
                    <h2>{schedule?.title || schedule?.examTitle || 'Lịch thi'}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin lịch</div>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                                <div>
                                    <Clock size={14} style={{ marginRight: 6 }} />
                                    Bắt đầu: {schedule?.startTime ? new Date(schedule.startTime).toLocaleString() : '-'}
                                </div>
                                <div>
                                    Kết thúc: {schedule?.endTime ? new Date(schedule.endTime).toLocaleString() : '-'}
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    Trạng thái: <span className="status-badge">{schedule?.status || 'SCHEDULED'}</span>
                                </div>
                                <div style={{ marginTop: 6 }}>Điểm: {scoreRevealLabel}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 220 }}>
                            {canAnnounce && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => onAnnounce?.(schedule?.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                    <Megaphone size={16} /> Công bố kết quả
                                </button>
                            )}
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                Nhấn vào tên học sinh để mở chấm điểm.
                            </div>
                        </div>
                    </div>
                </div>

                <ExamResultsModal
                    schedule={schedule}
                    embedded
                    onSelectAttemptCode={(attemptCode) => setSelectedAttemptCode(attemptCode)}
                    refreshToken={refreshToken}
                />
            </div>

            {selectedAttemptCode && (
                <TeacherAttemptGradingModal
                    scheduleId={schedule?.id}
                    attemptCode={selectedAttemptCode}
                    onClose={() => setSelectedAttemptCode(null)}
                    onSaved={handleGradingSaved}
                />
            )}
        </div>
    );
}

