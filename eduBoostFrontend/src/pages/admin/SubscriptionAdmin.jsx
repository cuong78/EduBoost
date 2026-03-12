import { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Clock } from "lucide-react";

const fmtVND  = n => n != null ? Number(n).toLocaleString("vi-VN") + " ₫" : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

export default function SubscriptionAdmin() {
  const [txs,     setTxs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState({});
  const [viewQR,  setViewQR]  = useState(null);

  const load = () => {
    setLoading(true);
    subscriptionService.getPendingTransactions()
      .then(d => setTxs(Array.isArray(d) ? d : []))
      .catch(() => showErrorToast("Không thể tải danh sách"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirm = async (tx) => {
    setBusy(b => ({ ...b, [tx.id]: "confirm" }));
    try {
      await subscriptionService.confirmPayment(tx.id, "Xác nhận thủ công bởi admin");
      showSuccessToast(`✅ Đã kích hoạt gói ${tx.planName} cho ${tx.teacherName}`);
      load();
    } catch(e) {
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
    } catch(e) {
      showErrorToast("Không thể hủy");
    } finally {
      setBusy(b => ({ ...b, [tx.id]: null }));
    }
  };

  return (
    <div style={{ padding: "1.5rem 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1f2937", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={22} color="#f59e0b"/> Giao dịch chờ xác nhận
          </h1>
          <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: "0.9rem" }}>Xem QR chuyển khoản và kích hoạt gói cho giáo viên</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", background: "#f3f4f6", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
          <RefreshCw size={15}/> Làm mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }}/>
        </div>
      ) : txs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <CheckCircle size={48} color="#10b981" opacity={0.5}/>
          <h3 style={{ color: "#374151", marginTop: "0.75rem" }}>Không có giao dịch chờ xác nhận</h3>
          <p style={{ color: "#9ca3af" }}>Tất cả giao dịch đã được xử lý</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {txs.map(tx => (
            <div key={tx.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #fde68a", padding: "1.25rem", boxShadow: "0 4px 16px rgba(245,158,11,0.08)", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#7c3aed", fontSize: "0.9rem" }}>{tx.orderId}</span>
                  <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700 }}>⏳ Đang chờ</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, fontSize: "0.85rem", color: "#374151" }}>
                  <div><span style={{ color: "#9ca3af" }}>Giáo viên: </span><strong>{tx.teacherName}</strong></div>
                  <div><span style={{ color: "#9ca3af" }}>Email: </span>{tx.teacherEmail}</div>
                  <div><span style={{ color: "#9ca3af" }}>Gói: </span><strong>{tx.planName}</strong></div>
                  <div><span style={{ color: "#9ca3af" }}>Số tiền: </span><strong style={{ color: "#6366f1" }}>{fmtVND(tx.amount)}</strong></div>
                  <div><span style={{ color: "#9ca3af" }}>Ngân hàng: </span>{tx.bankCode} — {tx.accountNo}</div>
                  <div><span style={{ color: "#9ca3af" }}>Tạo lúc: </span>{fmtDate(tx.createdAt)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", borderRadius: 8, padding: "5px 10px", marginTop: 4, width: "fit-content" }}>
                  <AlertTriangle size={13} color="#059669"/>
                  <span style={{ fontSize: "0.8rem", color: "#065f46" }}>Nội dung CK: <strong>{tx.orderId}</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
                {tx.qrImageUrl && (
                  <button onClick={() => setViewQR(tx)} style={{ padding: "6px 14px", background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", color: "#374151" }}>
                    🔍 Xem QR
                  </button>
                )}
                <button onClick={() => confirm(tx)} disabled={!!busy[tx.id]}
                  style={{ padding: "8px 14px", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, cursor: "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: busy[tx.id] ? 0.6 : 1 }}>
                  {busy[tx.id] === "confirm" ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }}/> : <CheckCircle size={14}/>}
                  Kích hoạt
                </button>
                <button onClick={() => cancel(tx)} disabled={!!busy[tx.id]}
                  style={{ padding: "6px 14px", background: "#fff", border: "1.5px solid #fca5a5", color: "#ef4444", borderRadius: 9, fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: busy[tx.id] ? 0.6 : 1 }}>
                  {busy[tx.id] === "cancel" ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }}/> : <XCircle size={13}/>}
                  Hủy giao dịch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Preview popup */}
      {viewQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewQR(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: 300, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem" }}>QR — {viewQR.orderId}</h3>
            <img src={viewQR.qrImageUrl} alt="QR" style={{ width: 220, borderRadius: 10, border: "1px solid #e5e7eb" }}/>
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#9ca3af" }}>{viewQR.teacherName} — {fmtVND(viewQR.amount)}</p>
          </div>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
