import { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import {
  CheckCircle, XCircle, RefreshCw, AlertTriangle, Clock,
  DollarSign, TrendingUp, Users, CreditCard, BarChart3,
  Filter, Eye
} from "lucide-react";

const fmtVND = n => n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "0 ₫";
const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

const PAY_CFG = {
  PENDING:   { label: "Chờ xác nhận", color: "var(--ds-warning)", bg: "var(--ds-warning-bg)" },
  SUCCESS:   { label: "Thành công",   color: "var(--ds-success)", bg: "var(--ds-success-bg)" },
  FAILED:    { label: "Thất bại",     color: "var(--ds-error)", bg: "var(--ds-error-bg)" },
  CANCELLED: { label: "Đã hủy",       color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" },
  EXPIRED:   { label: "Hết hạn",      color: "var(--ds-text-muted)", bg: "var(--ds-border-light)" },
};

function StatusPill({ status }) {
  const cfg = PAY_CFG[status] || { label: status, color: "var(--ds-text-secondary)", bg: "var(--ds-border-light)" };
  return <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700 }}>{cfg.label}</span>;
}

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, iconColor, label, value, subText, borderColor }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "1.25rem", border: `1px solid var(--ds-border)`, borderLeft: `4px solid ${borderColor}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "var(--ds-text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>{label}</span>
        <Icon size={20} color={iconColor} />
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--ds-text)" }}>{value}</div>
      {subText && <div style={{ fontSize: "0.78rem", color: "var(--ds-text-muted)", marginTop: 4 }}>{subText}</div>}
    </div>
  );
}

/* ─── Simple Bar Chart ─── */
function RevenueChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxAmt = Math.max(...data.map(d => Number(d.amount) || 0), 1);
  const months = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1px solid var(--ds-border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "var(--ds-text)", display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={18} color="var(--ds-primary)" /> Doanh thu 6 tháng gần nhất
        </h3>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180 }}>
        {data.map((d, i) => {
          const pct = maxAmt > 0 ? (Number(d.amount) / maxAmt) * 100 : 0;
          const monthIdx = parseInt(d.month?.split("-")[1]) - 1;
          const label = months[monthIdx] || d.month;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: "0.7rem", color: "var(--ds-text-secondary)", fontWeight: 600 }}>
                {Number(d.amount) > 0 ? (Number(d.amount) / 1000).toFixed(0) + "k" : "0"}
              </span>
              <div style={{
                width: "100%", maxWidth: 48,
                height: `${Math.max(pct, 4)}%`,
                background: `linear-gradient(180deg, var(--ds-primary), var(--ds-primary-light))`,
                borderRadius: "6px 6px 2px 2px",
                transition: "height 0.5s ease",
                minHeight: 4
              }} />
              <span style={{ fontSize: "0.72rem", color: "var(--ds-text-muted)", fontWeight: 500 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SubscriptionAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [allTxs, setAllTxs] = useState([]);
  const [pendingTxs, setPendingTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [viewQR, setViewQR] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const [s, all, pending] = await Promise.all([
        subscriptionService.getRevenueStats().catch(() => null),
        subscriptionService.getAllTransactions().catch(() => []),
        subscriptionService.getPendingTransactions().catch(() => []),
      ]);
      setStats(s);
      setAllTxs(Array.isArray(all) ? all : []);
      setPendingTxs(Array.isArray(pending) ? pending : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirm = async (tx) => {
    setBusy(b => ({ ...b, [tx.id]: "confirm" }));
    try {
      await subscriptionService.confirmPayment(tx.id, "Xác nhận thủ công bởi admin");
      showSuccessToast(` Đã kích hoạt gói ${tx.planName} cho ${tx.teacherName}`);
      load();
    } catch (e) {
      showErrorToast(e?.response?.data?.message || "Không thể xác nhận");
    } finally {
      setBusy(b => ({ ...b, [tx.id]: null }));
    }
  };

  const cancel = async (tx) => {
    if (!window.confirm(`Hủy giao dịch ${tx.orderId}?`)) return;
    setBusy(b => ({ ...b, [tx.id]: "cancel" }));
    try {
      await subscriptionService.cancelTransaction(tx.id, "Admin hủy thủ công");
      showSuccessToast("Đã hủy giao dịch");
      load();
    } catch (e) {
      showErrorToast("Không thể hủy");
    } finally {
      setBusy(b => ({ ...b, [tx.id]: null }));
    }
  };

  const filteredTxs = statusFilter === "ALL" ? allTxs : allTxs.filter(tx => tx.paymentStatus === statusFilter);

  // Growth percentage
  const growth = stats?.revenueLastMonth > 0
    ? (((stats?.revenueThisMonth - stats?.revenueLastMonth) / stats?.revenueLastMonth) * 100).toFixed(0)
    : stats?.revenueThisMonth > 0 ? "+100" : "0";

  return (
    <div style={{ padding: "1.5rem 2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ds-text)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <DollarSign size={22} color="var(--ds-primary)" /> Quản lý doanh thu
          </h1>
          <p style={{ color: "var(--ds-text-muted)", margin: "4px 0 0", fontSize: "0.9rem" }}>Thống kê, giao dịch và quản lý thanh toán</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", background: "var(--ds-border-light)", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "var(--ds-text)" }}>
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 14, padding: 5, width: "fit-content", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {[["overview", " Tổng quan"], ["all", " Tất cả giao dịch"], ["pending", " Chờ xác nhận"]].map(([k, label]) => (
          <button key={k} onClick={() => setActiveTab(k)} style={{
            padding: "0.5rem 1.2rem", borderRadius: 10, border: "none", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            transition: "all 0.18s",
            background: activeTab === k ? "linear-gradient(135deg,var(--ds-primary),var(--ds-secondary-hover))" : "transparent",
            color: activeTab === k ? "#fff" : "var(--ds-text-secondary)",
            boxShadow: activeTab === k ? "0 2px 10px rgba(99,102,241,0.3)" : "none"
          }}>
            {label}
            {k === "pending" && pendingTxs.length > 0 && (
              <span style={{ marginLeft: 6, background: "var(--ds-error)", color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 800 }}>
                {pendingTxs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--ds-text-muted)" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : activeTab === "overview" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <KpiCard icon={DollarSign} iconColor="var(--ds-success)" borderColor="var(--ds-success)"
              label="Tổng doanh thu" value={fmtVND(stats?.totalRevenue)}
              subText={`Tháng này: ${fmtVND(stats?.revenueThisMonth)}`} />
            <KpiCard icon={TrendingUp} iconColor="var(--ds-primary)" borderColor="var(--ds-primary)"
              label="Tháng này" value={fmtVND(stats?.revenueThisMonth)}
              subText={`So tháng trước: ${growth > 0 ? "+" : ""}${growth}%`} />
            <KpiCard icon={CreditCard} iconColor="var(--ds-warning)" borderColor="var(--ds-warning)"
              label="Giao dịch" value={stats?.totalTransactions || 0}
              subText={` ${stats?.successCount || 0}   ${stats?.pendingCount || 0}   ${stats?.cancelledCount || 0}`} />
            <KpiCard icon={Users} iconColor="var(--ds-secondary-hover)" borderColor="var(--ds-secondary-hover)"
              label="Subscription active" value={stats?.activeSubscriptions || 0}
              subText="Giáo viên đang dùng gói Pro" />
          </div>

          {/* Revenue Chart */}
          <RevenueChart data={stats?.monthlyRevenue} />

          {/* Quick stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
            {[
              ["Thành công", stats?.successCount, "var(--ds-success)", "var(--ds-success-bg)"],
              ["Đang chờ", stats?.pendingCount, "var(--ds-warning)", "var(--ds-warning-bg)"],
              ["Đã hủy", stats?.cancelledCount, "var(--ds-text-secondary)", "var(--ds-border-light)"],
              ["Thất bại", stats?.failedCount, "var(--ds-error)", "var(--ds-error-bg)"],
            ].map(([label, val, color, bg]) => (
              <div key={label} style={{ background: bg, borderRadius: 12, padding: "0.85rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{val || 0}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--ds-text-secondary)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

      ) : activeTab === "all" ? (
        /* ─── All Transactions tab ─── */
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--ds-border)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.85rem 1rem", borderBottom: "1px solid var(--ds-border-light)", flexWrap: "wrap" }}>
            <Filter size={15} color="var(--ds-text-muted)" />
            <span style={{ fontSize: "0.82rem", color: "var(--ds-text-muted)", fontWeight: 600 }}>Lọc:</span>
            {["ALL", "SUCCESS", "PENDING", "CANCELLED", "FAILED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: "3px 12px", borderRadius: 99, border: "1.5px solid " + (statusFilter === s ? "var(--ds-primary)" : "var(--ds-border)"),
                background: statusFilter === s ? "var(--ds-primary-bg)" : "#fff",
                color: statusFilter === s ? "var(--ds-primary)" : "var(--ds-text-secondary)",
                fontWeight: 600, fontSize: "0.78rem", cursor: "pointer"
              }}>
                {s === "ALL" ? "Tất cả" : PAY_CFG[s]?.label || s} ({s === "ALL" ? allTxs.length : allTxs.filter(t => t.paymentStatus === s).length})
              </button>
            ))}
          </div>

          {filteredTxs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--ds-text-muted)" }}>
              <CreditCard size={40} opacity={0.25} />
              <p>Không có giao dịch nào</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead style={{ background: "var(--ds-bg-subtle)" }}>
                <tr>{["Mã đơn", "Giáo viên", "Gói", "Số tiền", "Trạng thái", "Ngày tạo", ""].map(h => (
                  <th key={h} style={{ padding: "0.8rem 1rem", textAlign: "left", color: "var(--ds-text-secondary)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--ds-border)" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredTxs.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid var(--ds-border-light)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", color: "var(--ds-secondary-hover)", fontWeight: 600, fontSize: "0.82rem" }}>{tx.orderId}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--ds-text)" }}>{tx.teacherName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--ds-text-muted)" }}>{tx.teacherEmail}</div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{tx.planName}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>{fmtVND(tx.amount)}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><StatusPill status={tx.paymentStatus} /></td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--ds-text-muted)", fontSize: "0.82rem" }}>{fmtDate(tx.createdAt)}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {tx.qrImageUrl && (
                          <button onClick={() => setViewQR(tx)} title="Xem QR" style={{ padding: "4px 8px", background: "var(--ds-border-light)", border: "1px solid var(--ds-border)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Eye size={13} color="var(--ds-text-secondary)" />
                          </button>
                        )}
                        {tx.paymentStatus === "PENDING" && (
                          <>
                            <button onClick={() => confirm(tx)} disabled={!!busy[tx.id]} title="Kích hoạt"
                              style={{ padding: "4px 8px", background: "var(--ds-success-bg)", border: "1px solid #a7f3d0", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <CheckCircle size={13} color="var(--ds-success)" />
                            </button>
                            <button onClick={() => cancel(tx)} disabled={!!busy[tx.id]} title="Hủy"
                              style={{ padding: "4px 8px", background: "var(--ds-error-bg)", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <XCircle size={13} color="var(--ds-error)" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      ) : (
        /* ─── Pending tab ─── */
        pendingTxs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: 16, border: "1px solid var(--ds-border)" }}>
            <CheckCircle size={48} color="var(--ds-success)" opacity={0.5} />
            <h3 style={{ color: "var(--ds-text)", marginTop: "0.75rem" }}>Không có giao dịch chờ xác nhận</h3>
            <p style={{ color: "var(--ds-text-muted)" }}>Tất cả giao dịch đã được xử lý</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingTxs.map(tx => (
              <div key={tx.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #fde68a", padding: "1.25rem", boxShadow: "0 4px 16px rgba(245,158,11,0.08)", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--ds-secondary-hover)", fontSize: "0.9rem" }}>{tx.orderId}</span>
                    <span style={{ background: "var(--ds-warning-bg)", color: "#92400e", padding: "2px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700 }}> Đang chờ</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, fontSize: "0.85rem", color: "var(--ds-text)" }}>
                    <div><span style={{ color: "var(--ds-text-muted)" }}>Giáo viên: </span><strong>{tx.teacherName}</strong></div>
                    <div><span style={{ color: "var(--ds-text-muted)" }}>Email: </span>{tx.teacherEmail}</div>
                    <div><span style={{ color: "var(--ds-text-muted)" }}>Gói: </span><strong>{tx.planName}</strong></div>
                    <div><span style={{ color: "var(--ds-text-muted)" }}>Số tiền: </span><strong style={{ color: "var(--ds-primary)" }}>{fmtVND(tx.amount)}</strong></div>
                    <div><span style={{ color: "var(--ds-text-muted)" }}>Ngân hàng: </span>{tx.bankCode} — {tx.accountNo}</div>
                    <div><span style={{ color: "var(--ds-text-muted)" }}>Tạo lúc: </span>{fmtDate(tx.createdAt)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", borderRadius: 8, padding: "5px 10px", marginTop: 4, width: "fit-content" }}>
                    <AlertTriangle size={13} color="var(--ds-success-text)" />
                    <span style={{ fontSize: "0.8rem", color: "#065f46" }}>Nội dung CK: <strong>{tx.orderId}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
                  {tx.qrImageUrl && (
                    <button onClick={() => setViewQR(tx)} style={{ padding: "6px 14px", background: "var(--ds-border-light)", border: "1.5px solid var(--ds-border)", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", color: "var(--ds-text)" }}>
                       Xem QR
                    </button>
                  )}
                  <button onClick={() => confirm(tx)} disabled={!!busy[tx.id]}
                    style={{ padding: "8px 14px", background: "linear-gradient(135deg,var(--ds-success),var(--ds-success-text))", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: busy[tx.id] ? 0.6 : 1 }}>
                    {busy[tx.id] === "confirm" ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={14} />}
                    Kích hoạt
                  </button>
                  <button onClick={() => cancel(tx)} disabled={!!busy[tx.id]}
                    style={{ padding: "6px 14px", background: "#fff", border: "1.5px solid #fca5a5", color: "var(--ds-error)", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: busy[tx.id] ? 0.6 : 1 }}>
                    {busy[tx.id] === "cancel" ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={13} />}
                    Hủy giao dịch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* QR Preview popup */}
      {viewQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewQR(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: 300, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem" }}>QR — {viewQR.orderId}</h3>
            <img src={viewQR.qrImageUrl} alt="QR" style={{ width: 220, borderRadius: 10, border: "1px solid var(--ds-border)" }} />
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--ds-text-muted)" }}>{viewQR.teacherName} — {fmtVND(viewQR.amount)}</p>
          </div>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
