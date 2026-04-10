import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Shield, AlertTriangle, Eye, EyeOff, Wifi, WifiOff,
    Maximize, Users, Clock, RefreshCw, X, Activity, Bell
} from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { API } from '../../constants/api';
import examAssignmentService from '../../services/examAssignmentService';

const ExamMonitor = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [students, setStudents] = useState({}); // { studentId: {...status} }
    const [alerts, setAlerts] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const stompRef = useRef(null);
    const alertsRef = useRef([]);

    // ── Load assignment info + historical logs ─────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const list = await examAssignmentService.getTeacherAssignments();
                const a = list.find(x => String(x.assignmentId) === String(assignmentId));
                if (a) setAssignment(a);

                // Load historical violation logs from database
                try {
                    const logs = await examAssignmentService.getViolationLogs(assignmentId);
                    if (Array.isArray(logs) && logs.length > 0) {
                        // Build alerts from historical logs
                        const historyAlerts = logs.map((log, idx) => ({
                            id: `hist-${log.id || idx}`,
                            studentName: log.studentName || 'N/A',
                            violations: log.violationType,
                            timestamp: log.timestamp
                                ? new Date(log.timestamp).toLocaleTimeString('vi-VN')
                                : '—',
                            severity: 'medium',
                        }));
                        alertsRef.current = historyAlerts;
                        setAlerts(historyAlerts);

                        // Build student summary from historical violations
                        const studentMap = {};
                        logs.forEach(log => {
                            const key = log.studentId || log.studentName || 'unknown';
                            if (!studentMap[key]) {
                                studentMap[key] = {
                                    studentId: log.studentId,
                                    studentName: log.studentName || 'N/A',
                                    violationCount: 0,
                                    violations: [],
                                    online: false,
                                    tabActive: true,
                                    fullscreen: true,
                                    networkOnline: true,
                                    lastSeen: '—',
                                };
                            }
                            studentMap[key].violationCount += 1;
                            if (log.violationType) {
                                log.violationType.split(' ').filter(Boolean).forEach(v => {
                                    if (!studentMap[key].violations.includes(v)) {
                                        studentMap[key].violations.push(v);
                                    }
                                });
                            }
                            // Use latest timestamp as lastSeen
                            if (log.timestamp) {
                                studentMap[key].lastSeen = new Date(log.timestamp).toLocaleTimeString('vi-VN');
                            }
                        });
                        setStudents(prev => ({ ...studentMap, ...prev }));
                    }
                } catch (e) {
                    console.warn('Failed to load violation logs:', e);
                }
            } catch (e) {
                console.error('Failed to load assignment:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [assignmentId]);

    // ── WebSocket connection ───────────────────────────────────────────────
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API.BASE.replace('/api', '')}/ws`),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                // Subscribe to teacher's monitoring channel
                client.subscribe(`/topic/exam/${assignmentId}`, (message) => {
                    handleIncomingEvent(JSON.parse(message.body));
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
        });
        client.activate();
        stompRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [assignmentId]);

    const handleIncomingEvent = (event) => {
        const { studentId, studentName, type } = event;
        if (!studentId && !studentName) return;

        const key = studentId || studentName;

        // Update student status
        setStudents(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                studentId,
                studentName: studentName || prev[key]?.studentName || 'Unknown',
                lastSeen: event.timestamp,
                tabActive: event.tabActive,
                fullscreen: event.fullscreen,
                idleSeconds: event.idleSeconds,
                copyPasteCount: event.copyPasteCount,
                networkOnline: event.networkOnline,
                timeLeftSeconds: event.timeLeftSeconds,
                violationCount: (prev[key]?.violationCount || 0) + (event.hasViolation ? 1 : 0),
                violations: [...(prev[key]?.violations || []), ...(event.violations ? event.violations.split(' ').filter(Boolean) : [])].slice(-20),
                online: true,
            }
        }));

        // Add to alerts if violation
        if (event.type === 'VIOLATION' || event.type === 'ALERT') {
            const alert = {
                id: Date.now(),
                studentName: studentName || 'Unknown',
                violations: event.violations || event.reason,
                timestamp: event.timestamp,
                severity: event.type === 'ALERT' ? 'high' : 'medium',
            };
            alertsRef.current = [alert, ...alertsRef.current].slice(0, 50);
            setAlerts([...alertsRef.current]);
        }
    };

    // Mark students offline if no heartbeat for >15s
    useEffect(() => {
        const interval = setInterval(() => {
            // This would need actual timestamps to work properly
            // Simplified: just mark as stale if not updated
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const studentList = Object.values(students);
    const violationStudents = studentList.filter(s => s.violationCount > 0);
    const onlineCount = studentList.filter(s => s.online).length;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <RefreshCw className="spin" size={32} color="#6366f1" />
        </div>
    );

    return (
        <div className="monitor-page">
            {/* Header */}
            <div className="monitor-header">
                <div>
                    <h1>
                        <Shield size={24} />
                        Giám sát kỳ thi realtime
                    </h1>
                    {assignment && (
                        <p className="muted">
                            {assignment.examTitle} · Lớp {assignment.className} · Mã: <strong>{assignment.accessCode}</strong>
                        </p>
                    )}
                </div>
                <div className="header-right">
                    <span className={`ws-badge ${connected ? 'connected' : 'disconnected'}`}>
                        <Activity size={14} />
                        {connected ? 'Đang kết nối' : 'Mất kết nối'}
                    </span>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}>
                        <X size={16} /> Đóng
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="stats-row">
                <div className="stat-card">
                    <Users size={22} color="#6366f1" />
                    <div>
                        <div className="stat-val">{onlineCount}</div>
                        <div className="stat-label">Đang thi</div>
                    </div>
                </div>
                <div className="stat-card warn">
                    <AlertTriangle size={22} color="#f59e0b" />
                    <div>
                        <div className="stat-val">{violationStudents.length}</div>
                        <div className="stat-label">Có vi phạm</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <Bell size={22} color="#ef4444" />
                    <div>
                        <div className="stat-val">{alerts.length}</div>
                        <div className="stat-label">Tổng cảnh báo</div>
                    </div>
                </div>
            </div>

            <div className="monitor-layout">
                {/* Student grid */}
                <div className="student-section">
                    <h2>Trạng thái học sinh</h2>
                    {studentList.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} color="#cbd5e1" />
                            <p>Chưa có dữ liệu học sinh</p>
                            <p className="muted" style={{fontSize:'0.85rem'}}>Chưa có học sinh nào tham gia hoặc chưa có log vi phạm.</p>
                        </div>
                    ) : (
                        <div className="student-grid">
                            {studentList.map(s => (
                                <div key={s.studentId || s.studentName} className={`student-card ${s.violationCount > 2 ? 'danger' : s.violationCount > 0 ? 'warn' : 'ok'}`}>
                                    <div className="student-name">
                                        <span className={`status-dot ${s.online ? 'online' : 'offline'}`}></span>
                                        {s.studentName}
                                    </div>
                                    <div className="student-indicators">
                                        <span className={`ind ${s.tabActive ? 'ok' : 'bad'}`} title="Tab">
                                            {s.tabActive ? <Eye size={13}/> : <EyeOff size={13}/>}
                                        </span>
                                        <span className={`ind ${s.fullscreen ? 'ok' : 'warn'}`} title="Fullscreen">
                                            <Maximize size={13}/>
                                        </span>
                                        <span className={`ind ${s.networkOnline ? 'ok' : 'bad'}`} title="Network">
                                            {s.networkOnline ? <Wifi size={13}/> : <WifiOff size={13}/>}
                                        </span>
                                    </div>
                                    <div className="student-meta">
                                        {s.timeLeftSeconds !== undefined && s.timeLeftSeconds !== null && (
                                            <span><Clock size={11}/> {Math.floor(s.timeLeftSeconds/60)}:{String(s.timeLeftSeconds % 60).padStart(2,'0')}</span>
                                        )}
                                        {s.violationCount > 0 && (
                                            <span className="violation-count">
                                                <AlertTriangle size={11}/> {s.violationCount} vi phạm
                                            </span>
                                        )}
                                    </div>
                                    {s.violations && s.violations.length > 0 && (
                                        <div className="violation-list">
                                            {[...new Set(s.violations)].map((v, i) => (
                                                <span key={i} className="violation-tag">{v}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="last-seen">Cập nhật: {s.lastSeen}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alert log */}
                <div className="alert-section">
                    <h2>
                        <Bell size={18} /> Nhật ký cảnh báo
                        {alerts.length > 0 && <span className="badge-count">{alerts.length}</span>}
                    </h2>
                    <div className="alert-list">
                        {alerts.length === 0 ? (
                            <p className="muted" style={{padding:'1rem',textAlign:'center'}}>Chưa có cảnh báo</p>
                        ) : (
                            alerts.map(a => (
                                <div key={a.id} className={`alert-item ${a.severity}`}>
                                    <div className="alert-student">{a.studentName}</div>
                                    <div className="alert-violation">{a.violations}</div>
                                    <div className="alert-time">{a.timestamp}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .monitor-page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
                .monitor-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
                .monitor-header h1 { display: flex; align-items: center; gap: 0.75rem; margin: 0 0 0.25rem; font-size: 1.5rem; }
                .monitor-header .muted { color: #64748b; margin: 0; font-size: 0.9rem; }
                .header-right { display: flex; align-items: center; gap: 0.75rem; }
                .ws-badge { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
                .ws-badge.connected { background: #dcfce7; color: #16a34a; }
                .ws-badge.disconnected { background: #fee2e2; color: #dc2626; }

                .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
                .stat-card { display: flex; align-items: center; gap: 1rem; background: white; border-radius: 16px; padding: 1.25rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border-left: 4px solid #6366f1; }
                .stat-card.warn { border-left-color: #f59e0b; }
                .stat-card.danger { border-left-color: #ef4444; }
                .stat-val { font-size: 2rem; font-weight: 800; color: #1e293b; line-height: 1; }
                .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 2px; }

                .monitor-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; }
                @media (max-width: 1000px) { .monitor-layout { grid-template-columns: 1fr; } }

                .student-section h2, .alert-section h2 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
                .badge-count { background: #ef4444; color: white; border-radius: 99px; padding: 1px 8px; font-size: 0.75rem; }

                .student-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
                .student-card { background: white; border-radius: 14px; padding: 1rem 1.1rem; border: 2px solid #e2e8f0; transition: border-color 0.2s; }
                .student-card.ok { border-color: #bbf7d0; }
                .student-card.warn { border-color: #fde68a; background: #fffbeb; }
                .student-card.danger { border-color: #fecaca; background: #fef2f2; }

                .student-name { font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; margin-bottom: 0.5rem; }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .status-dot.online { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
                .status-dot.offline { background: #94a3b8; }

                .student-indicators { display: flex; gap: 6px; margin-bottom: 0.5rem; }
                .ind { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .ind.ok { background: #dcfce7; color: #16a34a; }
                .ind.warn { background: #fef9c3; color: #ca8a04; }
                .ind.bad { background: #fee2e2; color: #dc2626; }

                .student-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.78rem; color: #64748b; margin-bottom: 0.5rem; }
                .violation-count { color: #dc2626; font-weight: 700; display: flex; align-items: center; gap: 3px; }
                .violation-list { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 0.4rem; }
                .violation-tag { background: #fee2e2; color: #b91c1c; border-radius: 6px; padding: 2px 7px; font-size: 0.72rem; font-weight: 700; }
                .last-seen { font-size: 0.72rem; color: #94a3b8; }

                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center; background: white; border-radius: 16px; gap: 0.75rem; color: #64748b; }
                .empty-state p { margin: 0; font-weight: 600; }

                .alert-section { background: white; border-radius: 16px; padding: 1.25rem; align-self: flex-start; position: sticky; top: 80px; max-height: calc(100vh - 120px); display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                .alert-list { overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                .alert-item { border-radius: 10px; padding: 0.75rem; border-left: 3px solid #e2e8f0; }
                .alert-item.high { background: #fef2f2; border-left-color: #ef4444; }
                .alert-item.medium { background: #fffbeb; border-left-color: #f59e0b; }
                .alert-student { font-weight: 700; font-size: 0.88rem; color: #1e293b; }
                .alert-violation { font-size: 0.82rem; color: #64748b; margin: 2px 0; }
                .alert-time { font-size: 0.75rem; color: #94a3b8; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ExamMonitor;
