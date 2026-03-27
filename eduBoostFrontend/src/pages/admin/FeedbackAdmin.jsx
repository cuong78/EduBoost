import { useState, useEffect } from "react";
import { feedbackService } from "../../services/feedbackService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import {
  MessageSquare, Star, CheckCircle, Clock, AlertTriangle,
  RefreshCw, Filter, Eye, Send, X, Inbox, Loader2
} from "lucide-react";

const CATEGORIES = {
  SUGGESTION: { label: "Góp ý", icon: AlertTriangle },
  BUG_REPORT: { label: "Báo lỗi", icon: AlertTriangle },
  FEATURE_REQUEST: { label: "Yêu cầu tính năng", icon: Star },
  OTHER: { label: "Khác", icon: MessageSquare },
};

const STATUS_CFG = {
  SUBMITTED:   { label: "Mới",          cls: "ds-badge-primary" },
  IN_PROGRESS: { label: "Đang xử lý",  cls: "ds-badge-warning" },
  RESPONDED:   { label: "Đã phản hồi",  cls: "ds-badge-success" },
  CLOSED:      { label: "Đã đóng",      cls: "ds-badge-neutral" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: "ds-badge-neutral" };
  return <span className={`ds-badge ${cfg.cls}`}>{cfg.label}</span>;
}

function StarDisplay({ value }) {
  if (!value) return <span style={{ color: "var(--ds-text-muted)", fontSize: "var(--ds-text-sm)" }}>—</span>;
  return (
    <div className="ds-flex ds-gap-xs">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} fill={i <= value ? "var(--ds-warning)" : "none"} color={i <= value ? "var(--ds-warning)" : "var(--ds-border)"} />
      ))}
    </div>
  );
}

const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

export default function FeedbackAdmin() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [respondModal, setRespondModal] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState("RESPONDED");
  const [responding, setResponding] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, all] = await Promise.all([
        feedbackService.getStats().catch(() => null),
        feedbackService.getAll().catch(() => []),
      ]);
      setStats(s);
      setFeedbacks(Array.isArray(all) ? all : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async () => {
    if (!respondModal) return;
    setResponding(true);
    try {
      await feedbackService.respond(respondModal.id, { adminResponse: responseText, status: responseStatus });
      showSuccessToast("Đã phản hồi feedback");
      setRespondModal(null); setResponseText(""); setResponseStatus("RESPONDED");
      load();
    } catch (e) {
      showErrorToast(e?.response?.data?.message || "Lỗi");
    } finally { setResponding(false); }
  };

  const openRespond = (fb) => {
    setRespondModal(fb);
    setResponseText(fb.adminResponse || "");
    setResponseStatus(fb.status === "SUBMITTED" ? "RESPONDED" : fb.status);
  };

  const filteredFbs = statusFilter === "ALL" ? feedbacks : feedbacks.filter(f => f.status === statusFilter);

  return (
    <div>
      {/* Header */}
      <div className="ds-page-header">
        <div className="ds-page-header-left">
          <div className="ds-page-icon"><MessageSquare size={22} /></div>
          <div>
            <h1 className="ds-page-title">Quản lý Feedback</h1>
            <p className="ds-page-subtitle">Xem, phản hồi góp ý từ giáo viên</p>
          </div>
        </div>
        <button onClick={load} className="ds-btn ds-btn-secondary">
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="ds-tab-bar">
        {[["overview", "Tổng quan"], ["all", "Tất cả feedback"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`ds-tab ${tab === k ? "active" : ""}`}>
            {label}
            {k === "all" && stats?.submittedCount > 0 && (
              <span className="ds-badge ds-badge-error" style={{ marginLeft: 6 }}>
                {stats.submittedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ds-loading">
          <Loader2 size={24} className="ds-spinner" />
        </div>

      ) : tab === "overview" ? (
        <div className="ds-flex-col ds-gap-lg">
          {/* KPIs */}
          <div className="ds-kpi-grid">
            <div className="ds-kpi-card ds-kpi-accent-primary">
              <div className="ds-kpi-card-header">
                <span className="ds-kpi-card-label">Tổng feedback</span>
                <Inbox size={18} color="var(--ds-primary)" />
              </div>
              <div className="ds-kpi-card-value">{stats?.totalFeedback || 0}</div>
            </div>
            <div className="ds-kpi-card ds-kpi-accent-warning">
              <div className="ds-kpi-card-header">
                <span className="ds-kpi-card-label">Chờ xử lý</span>
                <AlertTriangle size={18} color="var(--ds-warning)" />
              </div>
              <div className="ds-kpi-card-value">{(stats?.submittedCount || 0) + (stats?.inProgressCount || 0)}</div>
              <div className="ds-kpi-card-sub">Mới: {stats?.submittedCount || 0} | Đang xử lý: {stats?.inProgressCount || 0}</div>
            </div>
            <div className="ds-kpi-card ds-kpi-accent-success">
              <div className="ds-kpi-card-header">
                <span className="ds-kpi-card-label">Đã phản hồi</span>
                <CheckCircle size={18} color="var(--ds-success)" />
              </div>
              <div className="ds-kpi-card-value">{(stats?.respondedCount || 0) + (stats?.closedCount || 0)}</div>
            </div>
            <div className="ds-kpi-card ds-kpi-accent-warning">
              <div className="ds-kpi-card-header">
                <span className="ds-kpi-card-label">Rating TB</span>
                <Star size={18} color="var(--ds-warning)" />
              </div>
              <div className="ds-kpi-card-value">{stats?.averageRating ? stats.averageRating.toFixed(1) : "—"}</div>
            </div>
          </div>

          {/* Recent feedbacks */}
          <div className="ds-card">
            <div className="ds-card-header">Feedback mới nhất</div>
            <div className="ds-card-body-compact">
              {feedbacks.slice(0, 5).map(fb => (
                <div key={fb.id} onClick={() => setDetailModal(fb)} className="fb-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ds-text-bold ds-truncate">{fb.title}</div>
                    <div className="ds-text-sub">{fb.teacherName} — {fmtDate(fb.createdAt)}</div>
                  </div>
                  <StarDisplay value={fb.rating} />
                  <StatusPill status={fb.status} />
                </div>
              ))}
              {feedbacks.length === 0 && <div className="ds-empty-state"><p>Chưa có feedback nào</p></div>}
            </div>
          </div>
        </div>

      ) : (
        /* All feedbacks tab */
        <div className="ds-card">
          {/* Filter */}
          <div className="ds-filter-bar">
            <Filter size={15} color="var(--ds-text-muted)" />
            {["ALL", "SUBMITTED", "IN_PROGRESS", "RESPONDED", "CLOSED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`ds-filter-chip ${statusFilter === s ? "active" : ""}`}>
                {s === "ALL" ? "Tất cả" : STATUS_CFG[s]?.label} ({s === "ALL" ? feedbacks.length : feedbacks.filter(f => f.status === s).length})
              </button>
            ))}
          </div>

          {filteredFbs.length === 0 ? (
            <div className="ds-empty-state">
              <MessageSquare size={40} opacity={0.25} />
              <p>Không có feedback nào</p>
            </div>
          ) : (
            <table className="ds-table">
              <thead>
                <tr>
                  {["Loại", "Tiêu đề", "Giáo viên", "Rating", "Trạng thái", "Ngày gửi", ""].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFbs.map(fb => (
                  <tr key={fb.id}>
                    <td>{CATEGORIES[fb.category]?.label || fb.category}</td>
                    <td><span className="ds-text-bold ds-truncate" style={{ maxWidth: 250, display: 'inline-block' }}>{fb.title}</span></td>
                    <td>
                      <div className="ds-text-bold">{fb.teacherName}</div>
                      <div className="ds-text-sub">{fb.teacherEmail}</div>
                    </td>
                    <td><StarDisplay value={fb.rating} /></td>
                    <td><StatusPill status={fb.status} /></td>
                    <td className="ds-text-sub">{fmtDate(fb.createdAt)}</td>
                    <td>
                      <div className="ds-flex ds-gap-xs">
                        <button onClick={() => setDetailModal(fb)} title="Xem" className="ds-btn-icon"><Eye size={14} /></button>
                        <button onClick={() => openRespond(fb)} title="Phản hồi" className="ds-btn-icon" style={{ background: 'var(--ds-primary-bg)', borderColor: 'var(--ds-primary-bg-hover)' }}>
                          <Send size={14} color="var(--ds-primary)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="ds-modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="ds-modal ds-modal-md" onClick={e => e.stopPropagation()}>
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">{detailModal.title}</h3>
              <button onClick={() => setDetailModal(null)} className="ds-modal-close"><X size={18} /></button>
            </div>
            <div className="ds-text-sub" style={{ marginBottom: 8 }}>
              {detailModal.teacherName} ({detailModal.teacherEmail}) — {fmtDate(detailModal.createdAt)}
            </div>
            <div className="ds-flex ds-gap-sm ds-items-center" style={{ marginBottom: 'var(--ds-space-md)' }}>
              <StatusPill status={detailModal.status} />
              <StarDisplay value={detailModal.rating} />
            </div>
            <p style={{ color: 'var(--ds-text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: 'var(--ds-space-md)', background: 'var(--ds-bg-subtle)', borderRadius: 'var(--ds-radius-sm)', marginBottom: 'var(--ds-space-md)' }}>{detailModal.content}</p>

            {detailModal.adminResponse && (
              <div style={{ background: 'var(--ds-success-bg)', borderRadius: 'var(--ds-radius-sm)', padding: 'var(--ds-space-md)', borderLeft: '4px solid var(--ds-success)', marginBottom: 'var(--ds-space-md)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--ds-text-sm)', color: 'var(--ds-success-text)', marginBottom: 4 }}>Phản hồi Admin</div>
                <p style={{ margin: 0, fontSize: 'var(--ds-text-base)', color: 'var(--ds-text)', whiteSpace: 'pre-wrap' }}>{detailModal.adminResponse}</p>
              </div>
            )}

            <button onClick={() => { setDetailModal(null); openRespond(detailModal); }} className="ds-btn ds-btn-primary">
              <Send size={14} /> Phản hồi
            </button>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal && (
        <div className="ds-modal-overlay" onClick={() => setRespondModal(null)}>
          <div className="ds-modal ds-modal-md" onClick={e => e.stopPropagation()}>
            <div className="ds-modal-header">
              <h3 className="ds-modal-title">Phản hồi: {respondModal.title}</h3>
              <button onClick={() => setRespondModal(null)} className="ds-modal-close"><X size={18} /></button>
            </div>

            <div className="ds-form-group">
              <label className="ds-label">Nội dung phản hồi</label>
              <textarea value={responseText} onChange={e => setResponseText(e.target.value)} rows={4} placeholder="Nhập phản hồi cho giáo viên..."
                className="ds-textarea" />
            </div>

            <div className="ds-form-group">
              <label className="ds-label">Trạng thái</label>
              <div className="ds-flex ds-gap-sm" style={{ flexWrap: 'wrap' }}>
                {["IN_PROGRESS", "RESPONDED", "CLOSED"].map(s => (
                  <button key={s} onClick={() => setResponseStatus(s)}
                    className={`ds-filter-chip ${responseStatus === s ? "active" : ""}`}>
                    {STATUS_CFG[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ds-modal-footer">
              <button onClick={() => setRespondModal(null)} className="ds-btn ds-btn-secondary">Hủy</button>
              <button onClick={handleRespond} disabled={responding} className="ds-btn ds-btn-primary">
                {responding ? <Loader2 size={14} className="ds-spinner" /> : <Send size={14} />}
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fb-row {
          padding: 0.75rem var(--ds-space-lg);
          border-bottom: 1px solid var(--ds-border-light);
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background var(--ds-transition-fast);
        }
        .fb-row:hover { background: var(--ds-bg-subtle); }
      `}</style>
    </div>
  );
}
