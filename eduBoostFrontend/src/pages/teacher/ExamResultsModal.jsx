import { useEffect, useState } from 'react';
import { X, Loader2, Search, AlertTriangle } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { showErrorToast } from '../../utils/show-toast';

export default function ExamResultsModal({ schedule, onClose, embedded = false, onSelectAttemptCode, refreshToken = 0 }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!schedule) return;
        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await teacherService.getExamScheduleResults(schedule.id);
                setResults(Array.isArray(data) ? data : []);
            } catch {
                showErrorToast('Không thể tải điểm thi');
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [schedule, refreshToken]);

    const filteredResults = results.filter(
        (r) =>
            r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const submittedCount = results.filter((r) => r.status === 'SUBMITTED').length;
    const violationAttempts = results.filter((r) => (r.violationCount || 0) > 0).length;

    const resultsContent = (
        <>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                }}
            >
                <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '0.8rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tổng học sinh</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{results.length}</div>
                </div>
                <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '0.8rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Đã nộp</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{submittedCount}</div>
                </div>
                <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '0.8rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Có vi phạm</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{violationAttempts}</div>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: '1rem' }}>
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Tìm học sinh theo tên, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, padding: '0.5rem' }}
                />
            </div>

            {loading ? (
                <div className="empty-state">
                    <Loader2 size={32} className="spin" />
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="empty-state">
                    <p>Không có học sinh nào phù hợp hoặc chưa ai làm bài.</p>
                </div>
            ) : (
                <div className="students-table-wrap">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Học sinh</th>
                                <th>Trạng thái</th>
                                <th>Mã làm bài</th>
                                <th>Vi phạm</th>
                                <th>Nộp lúc</th>
                                <th>Điểm</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((r) => (
                                <tr key={r.attemptCode}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{r.studentName}</strong>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                    {r.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${
                                                    r.status === 'SUBMITTED' ? 'status-completed' :
                                                    r.status === 'IN_PROGRESS' ? 'status-active' : 'status-expired'
                                                }`}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                                {r.attemptCode?.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td>
                                            {r.violationCount > 0 ? (
                                                <span className="text-red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertTriangle size={14} /> {r.violationCount} lần
                                                </span>
                                            ) : (
                                                <span className="text-secondary">0</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}
                                            </span>
                                        </td>
                                        <td>
                                            {r.score !== null ? (
                                                <strong>{r.score?.toFixed(1) || '0.0'}</strong>
                                            ) : (
                                                <span className="text-secondary">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => onSelectAttemptCode?.(r.attemptCode)}
                                                disabled={!onSelectAttemptCode}
                                            >
                                                Xem bài làm
                                            </button>
                                        </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

    if (embedded) {
        return <div className="students-table-wrap glass">{resultsContent}</div>;
    }

    return (
        <div className="ds-modal-overlay">
            <div className="ds-modal ds-modal-lg" style={{ width: '90%' }}>
                <div className="modal-header">
                    <h2>Kết quả: {schedule?.title || schedule?.examTitle}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                {resultsContent}
            </div>
            <style>{`
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 0.8rem;
                    margin-bottom: 0.8rem;
                    border-bottom: 1px solid var(--ds-border-light);
                }
                .btn-icon {
                    border: 1px solid var(--ds-border);
                    background: var(--ds-bg-subtle);
                    border-radius: 10px;
                    width: 34px;
                    height: 34px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid var(--ds-border);
                    border-radius: 10px;
                    background: var(--ds-bg-subtle);
                    padding: 0.25rem 0.65rem;
                }
                .students-table-wrap {
                    overflow-x: auto;
                    border: 1px solid var(--ds-border);
                    border-radius: 12px;
                    background: #fff;
                }
                .students-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.88rem;
                }
                .students-table th {
                    text-align: left;
                    font-size: 0.78rem;
                    color: var(--ds-text-secondary);
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--ds-border);
                    padding: 0.65rem 0.75rem;
                    background: var(--ds-bg-subtle);
                }
                .students-table td {
                    padding: 0.65rem 0.75rem;
                    border-bottom: 1px solid var(--ds-border-light);
                }
                .students-table tbody tr:hover {
                    background: var(--ds-bg-subtle);
                }
                .empty-state {
                    text-align: center;
                    padding: 1.2rem;
                    color: var(--ds-text-secondary);
                }
                .text-red {
                    color: var(--ds-error-text);
                }
            `}</style>
        </div>
    );
}
