import { useState, useEffect } from "react";
import { feedbackService } from "../../services/feedbackService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import {
  MessageSquare, Star, Send, Clock, CheckCircle, ChevronDown, ChevronUp,
  AlertTriangle, Lightbulb, Bug, HelpCircle, RefreshCw
} from "lucide-react";

const CATEGORIES = [
  { value: "SUGGESTION", label: "💡 Góp ý", icon: Lightbulb, color: "#6366f1" },
  { value: "BUG_REPORT", label: "🐛 Báo lỗi", icon: Bug, color: "#ef4444" },
  { value: "FEATURE_REQUEST", label: "✨ Yêu cầu tính năng", icon: Star, color: "#f59e0b" },
  { value: "OTHER", label: "💬 Khác", icon: HelpCircle, color: "#6b7280" },
];

const STATUS_CFG = {
  SUBMITTED:   { label: "Đã gửi",       color: "#6366f1", bg: "#eef2ff" },
  IN_PROGRESS: { label: "Đang xử lý",   color: "#f59e0b", bg: "#fef3c7" },
  RESPONDED:   { label: "Đã phản hồi",   color: "#10b981", bg: "#d1fae5" },
  CLOSED:      { label: "Đã đóng",       color: "#6b7280", bg: "#f3f4f6" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700 }}>{cfg.label}</span>;
}

function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={readonly ? 16 : 24}
          fill={i <= (value || 0) ? "#f59e0b" : "none"}
          color={i <= (value || 0) ? "#f59e0b" : "#d1d5db"}
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
      showSuccessToast("✅ Gửi feedback thành công!");
      setCategory(""); setTitle(""); setContent(""); setRating(0);
    } catch (e) {
      showErrorToast(e?.response?.data?.message || "Không thể gửi feedback");
    } finally { setSubmitting(false); }
  };

  const inputStyle = { width: "100%", padding: "0.7rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: "0.9rem", outline: "none", transition: "border 0.2s", boxSizing: "border-box" };

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1f2937", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={22} color="#6366f1" /> Góp ý & Phản hồi
        </h1>
        <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: "0.9rem" }}>Gửi góp ý, báo lỗi hoặc yêu cầu tính năng mới</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: "1.5rem", border: "1px solid #e5e7eb" }}>
        {[["create", "✍️ Gửi góp ý"], ["history", "📋 Lịch sử"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "0.5rem 1.2rem", borderRadius: 9, border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            background: tab === k ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
            color: tab === k ? "#fff" : "#6b7280",
          }}>{label}</button>
        ))}
      </div>

      {tab === "create" ? (
        /* ─── Create form ─── */
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Category */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: 8, display: "block" }}>Loại feedback *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)} style={{
                  padding: "0.7rem", borderRadius: 10, border: `2px solid ${category === c.value ? c.color : "#e5e7eb"}`,
                  background: category === c.value ? c.color + "10" : "#fff",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: category === c.value ? c.color : "#6b7280",
                  transition: "all 0.2s"
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: 6, display: "block" }}>Tiêu đề *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề ngắn gọn..."
              style={inputStyle} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>

          {/* Content */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: 6, display: "block" }}>Nội dung chi tiết *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
              placeholder="Mô tả chi tiết vấn đề hoặc góp ý của bạn..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>

          {/* Rating */}
          <div>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: 6, display: "block" }}>Đánh giá tổng quan (tùy chọn)</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} style={{
            padding: "0.75rem 2rem", background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff",
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
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
            <MessageSquare size={40} color="#d1d5db" />
            <p style={{ color: "#9ca3af", marginTop: 8 }}>Bạn chưa gửi feedback nào</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {feedbacks.map(fb => {
              const cat = CATEGORIES.find(c => c.value === fb.category);
              const isExpanded = expandedId === fb.id;
              return (
                <div key={fb.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", transition: "box-shadow 0.2s" }}>
                  {/* Header row */}
                  <div onClick={() => setExpandedId(isExpanded ? null : fb.id)} style={{
                    padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid #f3f4f6" : "none"
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>{cat?.label?.split(" ")[0] || "💬"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#1f2937", fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fb.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>{fmtDate(fb.createdAt)}</div>
                    </div>
                    {fb.rating > 0 && <StarRating value={fb.rating} readonly />}
                    <StatusPill status={fb.status} />
                    {isExpanded ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: "1rem 1.25rem" }}>
                      <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 1rem", whiteSpace: "pre-wrap" }}>{fb.content}</p>

                      {fb.adminResponse && (
                        <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "0.85rem 1rem", borderLeft: "4px solid #10b981" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#065f46", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle size={14} /> Phản hồi từ Admin
                          </div>
                          <p style={{ margin: 0, fontSize: "0.88rem", color: "#374151", whiteSpace: "pre-wrap" }}>{fb.adminResponse}</p>
                          {fb.respondedAt && <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }}>{fmtDate(fb.respondedAt)}</div>}
                        </div>
                      )}

                      {!fb.adminResponse && (fb.status === "SUBMITTED" || fb.status === "IN_PROGRESS") && (
                        <div style={{ background: "#fef3c7", borderRadius: 10, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: 8 }}>
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
