import { useState, useEffect } from "react";
import { feedbackService } from "../../services/feedbackService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import {
  MessageSquare, Star, Send, Clock, CheckCircle, ChevronDown, ChevronUp,
  AlertTriangle, Lightbulb, Bug, HelpCircle, RefreshCw
} from "lucide-react";

const CATEGORIES = [
  { value: "SUGGESTION", label: " Góp ý", icon: Lightbulb, color: "var(--ds-primary)" },
  { value: "BUG_REPORT", label: " Báo lỗi", icon: Bug, color: "var(--ds-error)" },
  { value: "FEATURE_REQUEST", label: " Yêu cầu tính năng", icon: Star, color: "var(--ds-warning)" },
  { value: "OTHER", label: " Khác", icon: HelpCircle, color: "var(--ds-text-secondary)" },
];

const STATUS_CFG = {
  SUBMITTED:   { label: "Đã gửi",       color: "var(--ds-primary)", bg: "var(--ds-primary-bg)" },
  IN_PROGRESS: { label: "Đang xử lý",   color: "var(--ds-warning)", bg: "var(--ds-warning-bg)" },
  RESPONDED:   { label: "Đã phản hồi",   color: "var(--ds-success)", bg: "var(--ds-success-bg)" },
  CLOSED:      { label: "Đã đóng",       color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" };
  return <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700 }}>{cfg.label}</span>;
}

function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={readonly ? 16 : 24}
          fill={i <= (value || 0) ? "var(--ds-warning)" : "none"}
          color={i <= (value || 0) ? "var(--ds-warning)" : "#d1d5db"}
          style={{ cursor: readonly ? "default" : "pointer", transition: "transform 0.15s" }}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={e => !readonly && (e.target.style.transform = "scale(1.2)")}
          onMouseLeave={e => !readonly && (e.target.style.transform = "scale(1)")}
        />
      ))}
    </div>
  );
}

const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

export default function FeedbackPage() {
  const [tab, setTab] = useState("create");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Form state
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getMyFeedbacks();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tab === "history") loadFeedbacks(); }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !title.trim() || !content.trim()) {
      showErrorToast("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.create({ category, title, content, rating: rating > 0 ? rating : null });
      showSuccessToast(" Gửi feedback thành công!");
      setCategory(""); setTitle(""); setContent(""); setRating(0);
    } catch (e) {
      showErrorToast(e?.response?.data?.message || "Không thể gửi feedback");
    } finally { setSubmitting(false); }
  };

  const inputStyle = { width: "100%", padding: "0.7rem 1rem", border: "1.5px solid var(--ds-border)", borderRadius: 10, fontSize: "0.9rem", outline: "none", transition: "border 0.2s", boxSizing: "border-box" };

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ds-text)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={22} color="var(--ds-primary)" /> Góp ý & Phản hồi
        </h1>
        <p style={{ color: "var(--ds-text-muted)", margin: "4px 0 0", fontSize: "0.9rem" }}>Gửi góp ý, báo lỗi hoặc yêu cầu tính năng mới</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: "1.5rem", border: "1px solid var(--ds-border)" }}>
        {[["create", " Gửi góp ý"], ["history", " Lịch sử"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "0.5rem 1.2rem", borderRadius: 9, border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            background: tab === k ? "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))" : "transparent",
            color: tab === k ? "#fff" : "var(--ds-text-secondary)",
          }}>{label}</button>
        ))}
      </div>

      {tab === "create" ? (
        /* ─── Create form ─── */
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--ds-border)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Category */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ds-text)", marginBottom: 8, display: "block" }}>Loại feedback *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)} style={{
                  padding: "0.7rem", borderRadius: 10, border: `2px solid ${category === c.value ? c.color : "var(--ds-border)"}`,
                  background: category === c.value ? c.color + "10" : "#fff",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: category === c.value ? c.color : "var(--ds-text-secondary)",
                  transition: "all 0.2s"
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ds-text)", marginBottom: 6, display: "block" }}>Tiêu đề *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề ngắn gọn..."
              style={inputStyle} onFocus={e => e.target.style.borderColor = "var(--ds-primary)"} onBlur={e => e.target.style.borderColor = "var(--ds-border)"} />
          </div>

          {/* Content */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ds-text)", marginBottom: 6, display: "block" }}>Nội dung chi tiết *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
              placeholder="Mô tả chi tiết vấn đề hoặc góp ý của bạn..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "var(--ds-primary)"} onBlur={e => e.target.style.borderColor = "var(--ds-border)"} />
          </div>

          {/* Rating */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ds-text)", marginBottom: 6, display: "block" }}>Đánh giá tổng quan (tùy chọn)</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} style={{
            padding: "0.75rem 2rem", background: "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))", color: "#fff",
            border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.6 : 1,
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)", width: "fit-content"
          }}>
            {submitting ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
            Gửi feedback
          </button>
        </form>

      ) : (
        /* ─── History ─── */
        loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--ds-text-muted)" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 16, border: "1px solid var(--ds-border)" }}>
            <MessageSquare size={40} color="#d1d5db" />
            <p style={{ color: "var(--ds-text-muted)", marginTop: 8 }}>Bạn chưa gửi feedback nào</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {feedbacks.map(fb => {
              const cat = CATEGORIES.find(c => c.value === fb.category);
              const isExpanded = expandedId === fb.id;
              return (
                <div key={fb.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--ds-border)", overflow: "hidden", transition: "box-shadow 0.2s" }}>
                  {/* Header row */}
                  <div onClick={() => setExpandedId(isExpanded ? null : fb.id)} style={{
                    padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid var(--ds-border-light)" : "none"
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>{cat?.label?.split(" ")[0] || ""}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--ds-text)", fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fb.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ds-text-muted)", marginTop: 2 }}>{fmtDate(fb.createdAt)}</div>
                    </div>
                    {fb.rating > 0 && <StarRating value={fb.rating} readonly />}
                    <StatusPill status={fb.status} />
                    {isExpanded ? <ChevronUp size={16} color="var(--ds-text-muted)" /> : <ChevronDown size={16} color="var(--ds-text-muted)" />}
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: "1rem 1.25rem" }}>
                      <p style={{ color: "var(--ds-text)", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 1rem", whiteSpace: "pre-wrap" }}>{fb.content}</p>

                      {fb.adminResponse && (
                        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "0.85rem 1rem", borderLeft: "4px solid var(--ds-success)" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#065f46", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle size={14} /> Phản hồi từ Admin
                          </div>
                          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ds-text)", whiteSpace: "pre-wrap" }}>{fb.adminResponse}</p>
                          {fb.respondedAt && <div style={{ fontSize: "0.75rem", color: "var(--ds-text-muted)", marginTop: 6 }}>{fmtDate(fb.respondedAt)}</div>}
                        </div>
                      )}

                      {!fb.adminResponse && (fb.status === "SUBMITTED" || fb.status === "IN_PROGRESS") && (
                        <div style={{ background: "var(--ds-warning-bg)", borderRadius: 10, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: 8 }}>
                          <Clock size={14} color="#92400e" />
                          <span style={{ fontSize: "0.82rem", color: "#92400e" }}>Đang chờ admin xử lý...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
