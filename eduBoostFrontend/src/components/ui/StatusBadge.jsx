import { INVITATION_STATUS_LABELS } from '../../constants/invitation';
import clsx from 'clsx';

const statusClassMap = {
    active: 'status-active',
    used: 'status-used',
    expired: 'status-expired',
    revoked: 'status-revoked',
};

export default function StatusBadge({ status }) {
    const statusLower = status?.toLowerCase();
    const label = INVITATION_STATUS_LABELS[statusLower] ?? status;
    const className = statusClassMap[statusLower] ?? 'status-default';

    return <span className={clsx('status-badge', className)}>{label}</span>;
}
