import { X } from 'lucide-react';
import clsx from 'clsx';

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    onConfirm,
    onCancel,
    variant = 'danger',
    loading = false,
}) {
    if (!open) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div
                className="confirm-modal glass"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                <div className="confirm-modal-header">
                    <h3 id="confirm-modal-title">{title}</h3>
                    <button
                        type="button"
                        className="confirm-modal-close"
                        onClick={onCancel}
                        aria-label="Đóng"
                    >
                        <X size={20} />
                    </button>
                </div>
                {message && <p className="confirm-modal-message">{message}</p>}
                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="btn btn-glass"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={clsx('btn', variant === 'danger' ? 'btn-danger' : 'btn-primary')}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : confirmLabel}
                    </button>
                </div>
            </div>
            <style>{`
                .confirm-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .confirm-modal {
                    min-width: 360px;
                    max-width: 90vw;
                    padding: 1.5rem;
                    border-radius: 16px;
                }
                .confirm-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                .confirm-modal-header h3 {
                    font-size: 1.25rem;
                    margin: 0;
                }
                .confirm-modal-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem;
                    color: var(--color-text-secondary);
                }
                .confirm-modal-close:hover {
                    color: var(--color-text-primary);
                }
                .confirm-modal-message {
                    color: var(--color-text-secondary);
                    margin-bottom: 1.5rem;
                    font-size: 0.95rem;
                }
                .confirm-modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                }
                .btn-danger {
                    background: linear-gradient(135deg, var(--ds-error-text), #b91c1c);
                    color: white;
                }
                .btn-danger:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}
