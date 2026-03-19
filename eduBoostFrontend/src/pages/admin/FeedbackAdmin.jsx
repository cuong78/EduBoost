import { useState, useEffect } from "react";
import { feedbackService } from "../../services/feedbackService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import {
  MessageSquare, Star, CheckCircle, Clock, AlertTriangle,
  RefreshCw, Filter, Eye, Send, X, BarChart3, Inbox, Loader
} from "lucide-react";

const CATEGORIES = {
  SUGGESTION: { label: "Góp ý", emoji: "💡" },
  BUG_REPORT: { label: "Báo lỗi", emoji: "🐛" },
  FEATURE_REQUEST: { label: "Yêu cầu tính năng", emoji: "✨" },
  OTHER: { label: "Khác", emoji: "💬" },
};

const STATUS_CFG = {
  SUBMITTED:   { label: "Mới",          color: "#6366f1", bg: "#eef2ff" },
  IN_PROGRESS: { label: "Đang xử lý",  color: "#f59e0b", bg: "#fef3c7" },
  RESPONDED:   { label: "Đã phản hồi",  color: "#10b981", bg: "#d1fae5" },
  CLOSED:      { label: "Đã đóng",      color: "#6b7280", bg: "#f3f4f6" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700 }}>{cfg.label}</span>;
}

function StarDisplay({ value }) {
  if (!value) return <span style={{ color: "#d1d5db", fontSize: "0.8rem" }}>—</span>;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} fill={i <= value ? "#f59e0b" : "none"} color={i <= value ? "#f59e0b" : "#d1d5db"} />
      ))}
    </div>
  );
}

function KpiCard({ icon: Icon, iconColor, borderColor, label, value, subText }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "1.1rem", border: "1px solid #e5e7eb", borderLeft: `4px solid ${borderColor}`, boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "0.82rem" }}>{label}</span>
        <Icon size={18} color={iconColor} />
      </div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1f2937" }}>{value}</div>
      {subText && <div style={{ fontSize: "0.76rem", color: "#9ca3af", marginTop: 3 }}>{subText}</div>}
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

  // Respond modal
  const [respondModal, setRespondModal] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState("RESPONDED");
  const [responding, setResponding] = useState(false);

  // Detail modal
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
      showSuccessToast("✅ Đã phản hồi feedback");
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
    <div style={{ padding: "1.5rem 2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1f2937", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={22} color="#6366f1" /> Quản lý Feedback
          </h1>
          <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: "0.9rem" }}>Xem, phản hồi góp ý từ giáo viên</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", background: "#f3f4f6", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: "1.5rem", border: "1px solid #e5e7eb" }}>
        {[["overview", "📊 Tổng quan"], ["all", "📋 Tất cả feedback"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "0.5rem 1.2rem", borderRadius: 9, border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            background: tab === k ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
            color: tab === k ? "#fff" : "#6b7280",
          }}>
            {label}
            {k === "all" && stats?.submittedCount > 0 && (
              <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 800 }}>
                {stats.submittedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
        </div>

      ) : tab === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <KpiCard icon={Inbox} iconColor="#6366f1" borderColor="#6366f1" label="Tổng feedback" value={stats?.totalFeedback || 0} />
            <KpiCard icon={AlertTriangle} iconColor="#f59e0b" borderColor="#f59e0b" label="Chờ xử lý" value={(stats?.submittedCount || 0) + (stats?.inProgressCount || 0)} subText={`Mới: ${stats?.submittedCount || 0} | Đang xử lý: ${stats?.inProgressCount || 0}`} />
            <KpiCard icon={CheckCircle} iconColor="#10b981" borderColor="#10b981" label="Đã phản hồi" value={(stats?.respondedCount || 0) + (stats?.closedCount || 0)} />
            <KpiCard icon={Star} iconColor="#f59e0b" borderColor="#f59e0b" label="Rating TB" value={stats?.averageRating ? stats.averageRating.toFixed(1) + " ⭐" : "—"} />
          </div>

          {/* Recent feedbacks */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6", fontWeight: 700, fontSize: "0.95rem", color: "#374151" }}>
              📩 Feedback mới nhất
            </div>
            {feedbacks.slice(0, 5).map(fb => (
              <div key={fb.id} onClick={() => setDetailModal(fb)} style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ fontSize: "1.1rem" }}>{CATEGORIES[fb.category]?.emoji || "💬"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fb.title}</div>
                  <div style={{ fontSize: "0.76rem", color: "#9ca3af" }}>{fb.teacherName} — {fmtDate(fb.createdAt)}</div>
                </div>
                <StarDisplay value={fb.rating} />
                <StatusPill status={fb.status} />
              </div>
            ))}
            {feedbacks.length === 0 && <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Chưa có feedback nào</div>}
          </div>
        </div>

      ) : (
        /* ─── All feedbacks tab ─── */
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {/* Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.85rem 1rem", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
            <Filter size={15} color="#9ca3af" />
            {["ALL", "SUBMITTED", "IN_PROGRESS", "RESPONDED", "CLOSED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: "3px 12px", borderRadius: 99, border: `1.5px solid ${statusFilter === s ? "#6366f1" : "#e5e7eb"}`,
                background: statusFilter === s ? "#eef2ff" : "#fff",
                color: statusFilter === s ? "#6366f1" : "#6b7280", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer"
              }}>
                {s === "ALL" ? "Tất cả" : STATUS_CFG[s]?.label} ({s === "ALL" ? feedbacks.length : feedbacks.filter(f => f.status === s).length})
              </button>
            ))}
          </div>

          {filteredFbs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
              <MessageSquare size={40} opacity={0.25} />
              <p>Không có feedback nào</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ background: "#f9fafb" }}>
                <tr>{["Loại", "Tiêu đề", "Giáo viên", "Rating", "Trạng thái", "Ngày gửi", ""].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredFbs.map(fb => (
                  <tr key={fb.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.7rem 1rem" }}>{CATEGORIES[fb.category]?.emoji} {CATEGORIES[fb.category]?.label}</td>
                    <td style={{ padding: "0.7rem 1rem", fontWeight: 600, color: "#1f2937", maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fb.title}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      <div style={{ fontWeight: 600 }}>{fb.teacherName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{fb.teacherEmail}</div>
                    </td>
                    <td style={{ padding: "0.7rem 1rem" }}><StarDisplay value={fb.rating} /></td>
                    <td style={{ padding: "0.7rem 1rem" }}><StatusPill status={fb.status} /></td>
                    <td style={{ padding: "0.7rem 1rem", color: "#9ca3af", fontSize: "0.82rem" }}>{fmtDate(fb.createdAt)}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setDetailModal(fb)} title="Xem" style={{ padding: "4px 8px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}>
                          <Eye size={13} color="#6b7280" />
                        </button>
                        <button onClick={() => openRespond(fb)} title="Phản hồi" style={{ padding: "4px 8px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 6, cursor: "pointer" }}>
                          <Send size={13} color="#6366f1" />
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDetailModal(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: 500, width: "90%", maxHeight: "80vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{CATEGORIES[detailModal.category]?.emoji} {detailModal.title}</h3>
              <button onClick={() => setDetailModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#9ca3af" /></button>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#9ca3af", marginBottom: 8 }}>
              {detailModal.teacherName} ({detailModal.teacherEmail}) — {fmtDate(detailModal.createdAt)}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: "1rem" }}>
              <StatusPill status={detailModal.status} />
              <StarDisplay value={detailModal.rating} />
            </div>
            <p style={{ color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: "0 0 1rem", padding: "0.85rem", background: "#f9fafb", borderRadius: 10 }}>{detailModal.content}</p>

            {detailModal.adminResponse && (
              <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "0.85rem", borderLeft: "4px solid #10b981", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#065f46", marginBottom: 4 }}>✅ Phản hồi Admin</div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#374151", whiteSpace: "pre-wrap" }}>{detailModal.adminResponse}</p>
              </div>
            )}

            <button onClick={() => { setDetailModal(null); openRespond(detailModal); }} style={{
              padding: "0.6rem 1.2rem", background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff",
              border: "none", borderRadius: 9, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
            }}>
              <Send size={14} /> Phản hồi
            </button>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setRespondModal(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: 480, width: "90%" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>Phản hồi: {respondModal.title}</h3>
              <button onClick={() => setRespondModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#9ca3af" /></button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: 6, display: "block" }}>Nội dung phản hồi</label>
              <textarea value={responseText} onChange={e => setResponseText(e.target.value)} rows={4} placeholder="Nhập phản hồi cho giáo viên..."
                style={{ width: "100%", padding: "0.7rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: "0.9rem", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: 6, display: "block" }}>Trạng thái</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["IN_PROGRESS", "RESPONDED", "CLOSED"].map(s => (
                  <button key={s} onClick={() => setResponseStatus(s)} style={{
                    padding: "5px 14px", borderRadius: 99, border: `1.5px solid ${responseStatus === s ? STATUS_CFG[s].color : "#e5e7eb"}`,
                    background: responseStatus === s ? STATUS_CFG[s].bg : "#fff",
                    color: responseStatus === s ? STATUS_CFG[s].color : "#6b7280", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer"
                  }}>{STATUS_CFG[s].label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setRespondModal(null)} style={{ padding: "0.6rem 1.2rem", background: "#f3f4f6", border: "none", borderRadius: 9, fontWeight: 600, cursor: "pointer", color: "#6b7280" }}>Hủy</button>
              <button onClick={handleRespond} disabled={responding} style={{
                padding: "0.6rem 1.2rem", background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff",
                border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: responding ? 0.6 : 1
              }}>
                {responding ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
