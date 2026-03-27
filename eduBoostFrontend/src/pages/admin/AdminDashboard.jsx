import { Activity, Server, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div>
            <div className="ds-page-header">
                <div className="ds-page-header-left">
                    <div className="ds-page-icon"><Server size={22} /></div>
                    <div>
                        <h1 className="ds-page-title">System Overview</h1>
                        <p className="ds-page-subtitle">Tổng quan hệ thống EduBoost</p>
                    </div>
                </div>
            </div>

            {/* System Health Cards */}
            <div className="ds-kpi-grid" style={{ marginBottom: 'var(--ds-space-xl)' }}>
                <div className="ds-kpi-card ds-kpi-accent-success">
                    <div className="ds-kpi-card-header">
                        <span className="ds-kpi-card-label">Server Status</span>
                        <Server size={20} color="var(--ds-success)" />
                    </div>
                    <div className="ds-kpi-card-value">Operational</div>
                    <div className="ds-kpi-card-sub">Uptime: 99.9%</div>
                </div>

                <div className="ds-kpi-card ds-kpi-accent-info">
                    <div className="ds-kpi-card-header">
                        <span className="ds-kpi-card-label">Total Users</span>
                        <Users size={20} color="var(--ds-info)" />
                    </div>
                    <div className="ds-kpi-card-value">2,453</div>
                    <div className="ds-kpi-card-sub" style={{ color: 'var(--ds-success)' }}>↑ 120 this week</div>
                </div>

                <div className="ds-kpi-card ds-kpi-accent-primary">
                    <div className="ds-kpi-card-header">
                        <span className="ds-kpi-card-label">System Load</span>
                        <Activity size={20} color="var(--ds-primary)" />
                    </div>
                    <div className="ds-kpi-card-value">34%</div>
                    <div style={{ width: '100%', background: 'var(--ds-bg-hover)', borderRadius: 'var(--ds-radius-full)', height: 6, marginTop: 8 }}>
                        <div style={{ width: '34%', background: 'var(--ds-primary)', height: 6, borderRadius: 'var(--ds-radius-full)' }}></div>
                    </div>
                </div>

                <div className="ds-kpi-card ds-kpi-accent-warning">
                    <div className="ds-kpi-card-header">
                        <span className="ds-kpi-card-label">Revenue</span>
                        <DollarSign size={20} color="var(--ds-warning)" />
                    </div>
                    <div className="ds-kpi-card-value">$12,450</div>
                </div>
            </div>

            {/* Recent System Logs */}
            <div className="ds-card">
                <div className="ds-card-header">Recent System Logs</div>
                <div className="ds-card-body-compact">
                    {[
                        { type: 'INFO', msg: 'New user registration: user_8473', time: '2 mins ago', cls: 'ds-badge-info' },
                        { type: 'WARN', msg: 'High memory usage detected on Node-1', time: '15 mins ago', cls: 'ds-badge-warning' },
                        { type: 'SUCCESS', msg: 'Daily backup completed successfully', time: '1 hour ago', cls: 'ds-badge-success' },
                        { type: 'ERROR', msg: 'Failed login attempt from IP 192.168.1.5', time: '2 hours ago', cls: 'ds-badge-error' },
                        { type: 'INFO', msg: 'Course "Advanced Physics" published', time: '3 hours ago', cls: 'ds-badge-info' }
                    ].map((log, i) => (
                        <div key={i} className="ds-flex ds-items-center ds-justify-between" style={{ padding: '0.75rem var(--ds-space-lg)', borderBottom: '1px solid var(--ds-border-light)', transition: 'background var(--ds-transition-fast)' }}>
                            <div className="ds-flex ds-items-center ds-gap-md">
                                <span className={`ds-badge ${log.cls}`} style={{ minWidth: 65, justifyContent: 'center' }}>{log.type}</span>
                                <span style={{ fontSize: 'var(--ds-text-base)', color: 'var(--ds-text)' }}>{log.msg}</span>
                            </div>
                            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', whiteSpace: 'nowrap' }}>{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
