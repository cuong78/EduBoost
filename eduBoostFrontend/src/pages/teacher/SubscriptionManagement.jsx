import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService } from "../../services/subscriptionService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import {
  Crown, CreditCard, Clock, CheckCircle, AlertCircle,
  RefreshCw, ExternalLink, Copy, Check
} from "lucide-react";

/* ─── helpers ─── */
const fmtVND = n => n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

const STATUS_CFG = {
  ACTIVE:          { label: "Đang hoạt động", color: "var(--ds-success)", bg: "var(--ds-success-bg)" },
  EXPIRED:         { label: "Đã hết hạn",     color: "var(--ds-error)", bg: "var(--ds-error-bg)" },
  CANCELLED:       { label: "Đã hủy",         color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" },
  PENDING_PAYMENT: { label: "Chờ xác nhận",   color: "var(--ds-warning)", bg: "var(--ds-warning-bg)" },
};
const PAY_CFG = {
  PENDING:   { label: "Chờ xác nhận", color: "var(--ds-warning)", bg: "var(--ds-warning-bg)" },
  SUCCESS:   { label: "Thành công",   color: "var(--ds-success)", bg: "var(--ds-success-bg)" },
  FAILED:    { label: "Thất bại",     color: "var(--ds-error)", bg: "var(--ds-error-bg)" },
  CANCELLED: { label: "Đã hủy",       color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" },
};

function StatusPill({ status, map }) {
  const cfg = map[status] || { label: status, color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" };
  return <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700 }}>{cfg.label}</span>;
}

/* ─── VietQR Mini-display ─── */
function QRDisplay({ tx, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(tx.orderId); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
         onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 420, width: "100%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))", padding: "1.2rem", textAlign: "center", color: "#fff" }}>
          <h3 style={{ margin: "0 0 4px" }}>💳 Thông tin chuyển khoản</h3>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "0.9rem" }}>{tx.planName} — {fmtVND(tx.amount)}</p>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
          {tx.qrImageUrl && <img src={tx.qrImageUrl} alt="VietQR" style={{ width: 180, margin: "0 auto", display: "block", borderRadius: 10, border: "1px solid var(--ds-border)" }}/>}
          {[["Ngân hàng", tx.bankCode],["Số TK", tx.accountNo],["Chủ TK", tx.accountName],["Số tiền", fmtVND(tx.amount)]].map(([k,v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", padding: "5px 8px", background: "var(--ds-bg-subtle)", borderRadius: 8 }}>
              <span style={{ color: "var(--ds-text-muted)" }}>{k}</span><strong>{v}</strong>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", padding: "5px 8px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <span style={{ color: "var(--ds-text-muted)" }}>Nội dung CK</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <strong>{tx.orderId}</strong>
              <button onClick={copy} style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
                {copied ? <Check size={14} color="var(--ds-success)"/> : <Copy size={14} color="var(--ds-text-muted)"/>}
              </button>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "0.6rem 0.9rem" }}>
            ⚠️ Ghi đúng nội dung chuyển khoản để admin xác nhận tự động. Kích hoạt trong 30 phút (giờ hành chính).
          </p>
        </div>
        <div style={{ padding: "0.5rem 1.25rem 1.25rem", display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.6rem", borderRadius: 10, border: "1.5px solid var(--ds-border)", background: "transparent", cursor: "pointer", fontWeight: 600, color: "var(--ds-text-secondary)" }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [sub, setSub] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTx, setViewTx] = useState(null); // QR to display

  useEffect(() => {
    Promise.all([
      subscriptionService.getMySubscription().catch(() => null),
      subscriptionService.getMyTransactions().catch(() => []),
    ]).then(([s, t]) => {
      setSub(s); setTxs(Array.isArray(t) ? t : []);
    }).finally(() => setLoading(false));
  }, []);

  const isPro = sub?.plan?.planCode !== "FREE";
  const daysLeft = sub?.daysRemaining;

  return (
    <div className="subscription-page" style={{ padding: "1.5rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ds-text)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Crown size={22} color="var(--ds-warning)"/> Gói đăng ký
        </h1>
        <p style={{ color: "var(--ds-text-muted)", margin: "4px 0 0", fontSize: "0.9rem" }}>Quản lý gói dịch vụ và lịch sử thanh toán</p>
      </div>

      {/* Tabs */}
      <div className="subscription-tabs" style={{ display: "flex", gap: 4, backdropFilter: "blur(10px)", borderRadius: 14, padding: 5, width: "fit-content", marginBottom: "1.5rem" }}>
        {[["current", "Gói hiện tại"], ["history", "Lịch sử thanh toán"]].map(([k, label]) => (
          <button key={k} onClick={() => setActiveTab(k)} style={{ padding: "0.5rem 1.2rem", borderRadius: 10, border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.18s", background: activeTab === k ? "linear-gradient(135deg,var(--ds-secondary-hover),var(--ds-primary))" : "transparent", color: activeTab === k ? "#fff" : "var(--ds-text-secondary)", boxShadow: activeTab === k ? "0 2px 10px rgba(99,102,241,0.3)" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--ds-text-muted)" }}><RefreshCw size={22} style={{ animation: "spin 1s linear infinite" }}/></div>
      ) : activeTab === "current" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Current Plan Card */}
          <div className={`current-plan-card ${isPro ? "pro" : "free"}`} style={{ background: isPro ? "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))" : "var(--sub-surface)", borderRadius: 18, padding: "2rem", border: isPro ? "none" : "1.5px solid var(--sub-border)", boxShadow: isPro ? "0 8px 32px rgba(99,102,241,0.3)" : "var(--sub-shadow)", color: isPro ? "#fff" : "var(--ds-text)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, opacity: 0.7, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Gói hiện tại</div>
                <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 800 }}>{sub?.plan?.planName || "Gói Free"}</h2>
                {isPro && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ opacity: 0.85, fontSize: "0.9rem" }}>Từ {fmtDate(sub?.startDate)} → {fmtDate(sub?.endDate)}</span>
                    {daysLeft != null && (
                      <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 12px", borderRadius: 99, fontSize: "0.8rem", fontWeight: 700 }}>
                        {daysLeft} ngày còn lại
                      </span>
                    )}
                  </div>
                )}
              </div>
              <StatusPill status={sub?.status || "ACTIVE"} map={STATUS_CFG}/>
            </div>
            {!isPro && (
              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--ds-border-light)" }}>
                <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--ds-text-secondary)" }}>Nâng cấp Pro để mở khoá không giới hạn lớp học, học sinh, đề thi và AI.</p>
                <button onClick={() => navigate("/pricing")} style={{ padding: "0.65rem 1.5rem", background: "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                  <Crown size={16}/> Nâng cấp Pro <ExternalLink size={14}/>
                </button>
              </div>
            )}
            {isPro && daysLeft != null && daysLeft <= 7 && (
              <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                <AlertCircle size={15}/> Gói sắp hết hạn! Hãy gia hạn để tiếp tục sử dụng.
                <button onClick={() => navigate("/pricing")} style={{ marginLeft: "auto", padding: "4px 12px", background: "#fff", color: "var(--ds-primary)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
                  Gia hạn
                </button>
              </div>
            )}
          </div>

          {/* Quota overview */}
          <div className="quota-card" style={{ borderRadius: 16, padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ds-text)" }}>Giới hạn sử dụng</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
              {[
                ["Lớp học",     sub?.plan?.maxClasses],
                ["Học sinh",    sub?.plan?.maxStudents],
                ["Đề / tháng",  sub?.plan?.maxExamsPerMonth],
                ["AI / tháng",  sub?.plan?.maxAIRequestsPerMonth],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "var(--ds-bg-subtle)", borderRadius: 12, padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--ds-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: val == null ? "var(--ds-success)" : "var(--ds-text)" }}>
                    {val == null ? "∞" : val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="tx-history-card" style={{ borderRadius: 16, overflow: "hidden" }}>
          {txs.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--ds-text-muted)" }}>
              <CreditCard size={40} opacity={0.25}/>
              <p>Chưa có giao dịch nào</p>
              <button onClick={() => navigate("/pricing")} style={{ padding: "0.6rem 1.5rem", background: "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                Xem gói dịch vụ
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead style={{ background: "var(--ds-bg-subtle)" }}>
                <tr>{["Mã đơn","Gói","Số tiền","Trạng thái","Ngày tạo",""].map(h => (
                  <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", color: "var(--ds-text-secondary)", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--ds-border)" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {txs.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid var(--ds-border-light)" }}>
                    <td style={{ padding: "0.8rem 1rem", fontFamily: "monospace", color: "var(--ds-secondary-hover)", fontWeight: 600 }}>{tx.orderId}</td>
                    <td style={{ padding: "0.8rem 1rem" }}>{tx.planName}</td>
                    <td style={{ padding: "0.8rem 1rem", fontWeight: 700 }}>{fmtVND(tx.amount)}</td>
                    <td style={{ padding: "0.8rem 1rem" }}><StatusPill status={tx.paymentStatus} map={PAY_CFG}/></td>
                    <td style={{ padding: "0.8rem 1rem", color: "var(--ds-text-muted)" }}>{fmtDate(tx.createdAt)}</td>
                    <td style={{ padding: "0.8rem 1rem" }}>
                      {tx.paymentStatus === "PENDING" && (
                        <button onClick={() => setViewTx(tx)} style={{ padding: "4px 12px", border: "1.5px solid var(--ds-primary)", background: "transparent", color: "var(--ds-primary)", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                          Xem QR
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {viewTx && <QRDisplay tx={viewTx} onClose={() => setViewTx(null)}/>}
      <style>{`
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

        .subscription-page {
          --sub-surface: #ffffff;
          --sub-border: var(--ds-border);
          --sub-shadow: 0 2px 12px rgba(0,0,0,0.04);
          --sub-tab-bg: rgba(255,255,255,0.7);
          --sub-tab-border: rgba(255,255,255,0.8);
        }

        .subscription-tabs {
          background: var(--sub-tab-bg);
          border: 1px solid var(--sub-tab-border);
          box-shadow: var(--sub-shadow);
        }

        .quota-card,
        .tx-history-card {
          background: var(--sub-surface);
          border: 1px solid var(--sub-border);
          box-shadow: var(--sub-shadow);
        }

        body.dark-mode .subscription-page {
          --sub-surface: rgba(17, 24, 39, 0.9);
          --sub-border: rgba(148,163,184,0.22);
          --sub-shadow: 0 16px 30px rgba(2, 6, 23, 0.34);
          --sub-tab-bg: rgba(30, 41, 59, 0.72);
          --sub-tab-border: rgba(148,163,184,0.22);
        }

        body.dark-mode .subscription-page [style*="var(--ds-text-muted)"] {
          color: #94a3b8 !important;
        }

        body.dark-mode .subscription-page .current-plan-card.free {
          color: #e5e7eb !important;
        }

        body.dark-mode .subscription-page table thead {
          background: rgba(30, 41, 59, 0.92) !important;
        }
      `}</style>
    </div>
  );
}
