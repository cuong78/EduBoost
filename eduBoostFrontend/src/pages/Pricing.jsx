import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, X, Zap, Crown, Star, CreditCard, Clock, AlertCircle, Copy, CheckCircle } from "lucide-react";
import { subscriptionService } from "../services/subscriptionService";
import { useAuth } from "../hooks/useAuth";
import { showSuccessToast, showErrorToast } from "../utils/show-toast";
import "./Pricing.css";

/* ─── Feature comparison data ─── */
const FEATURES = [
  { key: "classes", label: "Số lớp học", free: "1 lớp", pro: "Không giới hạn" },
  { key: "students", label: "Số học sinh", free: "30 học sinh", pro: "Không giới hạn" },
  { key: "exams", label: "Đề thi / tháng", free: "10 đề", pro: "Không giới hạn" },
  { key: "ai", label: "Yêu cầu AI / tháng", free: "20 lượt", pro: "Không giới hạn" },
  { key: "matrix", label: "Quản lý ma trận", free: true, pro: true },
  { key: "export", label: "Xuất PDF đề thi", free: true, pro: true },
  { key: "community", label: "Đề thi cộng đồng", free: true, pro: true },
  { key: "priority", label: "Hỗ trợ ưu tiên", free: false, pro: true },
  { key: "noexpiry", label: "Không giới hạn thời gian", free: false, pro: true },
];

function FeatureCell({ val }) {
  if (val === true) return <Check size={18} color="#10b981" className="pr-icon pr-icon--yes" />;
  if (val === false) return <X size={18} color="#d1d5db" className="pr-icon pr-icon--no" />;
  return <span className="pr-cell-text">{val}</span>;
}

function fmtVND(n) {
  if (!n || n === 0) return "Miễn phí";
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

/* ─── VietQR Modal ─── */
function VietQRModal({ tx, onClose }) {
  const navigate = useNavigate ? useNavigate() : null;
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [status, setStatus] = useState(tx.paymentStatus || "PENDING"); // poll result
  const [confirmed, setConfirmed] = useState(false);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-polling every 5s to detect VietQR callback confirmation ──
  useEffect(() => {
    if (status === "SUCCESS" || status === "CANCELLED" || !tx?.id) return;
    const poll = setInterval(async () => {
      try {
        const updated = await subscriptionService.getTransactionStatus(tx.id);
        if (updated?.paymentStatus === "SUCCESS") {
          setStatus("SUCCESS");
          setConfirmed(true);
          clearInterval(poll);
          // Auto-redirect to subscription page after 3s
          setTimeout(() => {
            if (navigate) navigate("/teacher/subscription");
            else window.location.href = "/teacher/subscription";
          }, 3000);
        }
      } catch (_) { /* ignore poll errors */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [tx?.id, status, navigate]);

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const copyNote = () => {
    navigator.clipboard.writeText(tx.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success screen after auto-confirm ──
  if (confirmed) {
    return (
      <div className="pr-overlay">
        <div className="pr-modal" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: "#10b981", marginBottom: 8 }}>Thanh toán thành công!</h2>
          <p style={{ color: "#6b7280" }}>Gói Pro đã được kích hoạt. Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-overlay" onClick={onClose}>
      <div className="pr-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-modal-header">
          <h2>💳 Thanh toán VietQR</h2>
          <p>{tx.planName} — {fmtVND(tx.amount)}</p>
        </div>

        {/* Countdown */}
        <div className={`pr-countdown ${timeLeft < 60 ? "pr-countdown--urgent" : ""}`}>
          <Clock size={16} /> Hết hạn sau: <strong>{fmt(timeLeft)}</strong>
          <span style={{ marginLeft: 12, fontSize: 11, color: "#9ca3af", fontWeight: "normal" }}>
            🔄 Tự kiểm tra mỗi 5 giây...
          </span>
        </div>

        {/* QR Image */}
        <div className="pr-qr-wrap">
          {tx.qrImageUrl ? (
            <img src={tx.qrImageUrl} alt="VietQR" className="pr-qr-img"
              onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div className="pr-qr-placeholder">
              <CreditCard size={48} opacity={0.3} />
              <p>QR Code đang tải...</p>
            </div>
          )}
        </div>

        {/* Bank info */}
        <div className="pr-bank-info">
          <div className="pr-bank-row"><span>Ngân hàng</span><strong>{tx.bankCode}</strong></div>
          <div className="pr-bank-row"><span>Số tài khoản</span><strong>{tx.accountNo}</strong></div>
          <div className="pr-bank-row"><span>Chủ tài khoản</span><strong>{tx.accountName}</strong></div>
          <div className="pr-bank-row"><span>Số tiền</span><strong className="pr-amount">{fmtVND(tx.amount)}</strong></div>
          <div className="pr-bank-row">
            <span>Nội dung CK</span>
            <span className="pr-order-id">
              <strong>{tx.orderId}</strong>
              <button className="pr-copy-btn" onClick={copyNote} title="Sao chép">
                {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </span>
          </div>
        </div>

        {/* Instruction */}
        <div className="pr-instruction">
          <AlertCircle size={15} /> Sau khi chuyển khoản, hệ thống sẽ <strong>tự động kích hoạt</strong> gói trong vòng <strong>vài giây</strong>.
        </div>

        <div className="pr-modal-footer">
          <button className="pr-btn pr-btn-ghost" onClick={onClose}>Đóng</button>
          <a href="mailto:support@eduboost.vn?subject=Xác nhận thanh toán" className="pr-btn pr-btn-secondary">
            📧 Gửi email xác nhận
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [vietQrTx, setVietQrTx] = useState(null);

  useEffect(() => {
    subscriptionService.getPlans()
      .then(data => setPlans(Array.isArray(data) ? data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    const role = user?.roles?.[0]?.roleName ?? user?.roles?.[0] ?? "";
    const clean = role.replace("ROLE_", "").toUpperCase();
    if (clean !== "TEACHER") {
      showErrorToast("Chỉ giáo viên mới có thể đăng ký gói");
      return;
    }
    if (plan.planCode === "FREE") {
      showSuccessToast("Bạn đang dùng gói Free!");
      return;
    }
    setPaying(true);
    try {
      const tx = await subscriptionService.initiatePayment(plan.id);
      setVietQrTx(tx);
    } catch (e) {
      showErrorToast(e?.response?.data?.message || "Không thể tạo đơn thanh toán");
    } finally {
      setPaying(false);
    }
  };

  const freePlan = plans.find(p => p.planCode === "FREE");
  const monthly = plans.find(p => p.planCode === "PRO_MONTHLY");
  const yearly = plans.find(p => p.planCode === "PRO_YEARLY");

  return (
    <div className="pr-page">
      {/* Hero */}
      <div className="pr-hero">
        <div className="pr-badge"><Star size={14} /> Đơn giản, minh bạch</div>
        <h1 className="pr-title">Chọn gói phù hợp với bạn</h1>
        <p className="pr-sub">Tất cả gói đều có đầy đủ tính năng cơ bản. Nâng cấp bất cứ lúc nào để mở khoá không giới hạn.</p>
      </div>

      {/* Plan cards */}
      {loading ? (
        <div className="pr-loading">Đang tải gói dịch vụ...</div>
      ) : (
        <div className="pr-plans">
          {/* FREE */}
          {freePlan && (
            <div className="pr-card">
              <div className="pr-card-top">
                <span className="pr-plan-icon">🆓</span>
                <h2>{freePlan.planName}</h2>
                <div className="pr-price"><span className="pr-price-num">Miễn phí</span></div>
                <p className="pr-plan-desc">{freePlan.description}</p>
              </div>
              <ul className="pr-features-list">
                <li><Check size={15} color="#10b981" /> {freePlan.maxClasses} lớp học</li>
                <li><Check size={15} color="#10b981" /> {freePlan.maxStudents} học sinh</li>
                <li><Check size={15} color="#10b981" /> {freePlan.maxExamsPerMonth} đề/tháng</li>
                <li><Check size={15} color="#10b981" /> {freePlan.maxAIRequestsPerMonth} lượt AI/tháng</li>
                <li><Check size={15} color="#10b981" /> Quản lý ma trận đề thi</li>
                <li><Check size={15} color="#10b981" /> Xuất PDF đề thi</li>
                <li><X size={15} color="#d1d5db" /> Không giới hạn</li>
                <li><X size={15} color="#d1d5db" /> Hỗ trợ ưu tiên</li>
              </ul>
              <button className="pr-btn pr-btn-ghost pr-btn-full" onClick={() => handleSubscribe(freePlan)}>
                Bắt đầu miễn phí
              </button>
            </div>
          )}

          {/* PRO MONTHLY */}
          {monthly && (
            <div className="pr-card pr-card--featured">
              <div className="pr-popular-badge"><Zap size={12} /> Phổ biến nhất</div>
              <div className="pr-card-top">
                <span className="pr-plan-icon">⚡</span>
                <h2>{monthly.planName}</h2>
                <div className="pr-price">
                  <span className="pr-price-num">{fmtVND(monthly.price)}</span>
                  <span className="pr-price-period">/ tháng / giáo viên</span>
                </div>
                <p className="pr-plan-desc">{monthly.description}</p>
              </div>
              <ul className="pr-features-list">
                <li><Check size={15} color="#6366f1" /> Không giới hạn lớp học</li>
                <li><Check size={15} color="#6366f1" /> Không giới hạn học sinh</li>
                <li><Check size={15} color="#6366f1" /> Không giới hạn đề thi</li>
                <li><Check size={15} color="#6366f1" /> Không giới hạn AI</li>
                <li><Check size={15} color="#6366f1" /> Quản lý ma trận đề thi</li>
                <li><Check size={15} color="#6366f1" /> Xuất PDF đề thi</li>
                <li><Check size={15} color="#6366f1" /> Đề thi cộng đồng</li>
                <li><Check size={15} color="#6366f1" /> Hỗ trợ ưu tiên</li>
              </ul>
              <button className="pr-btn pr-btn-primary pr-btn-full" disabled={paying}
                onClick={() => handleSubscribe(monthly)}>
                {paying ? "Đang xử lý..." : "Đăng ký Pro Tháng"}
              </button>
            </div>
          )}

          {/* PRO YEARLY */}
          {yearly && (
            <div className="pr-card pr-card--best">
              <div className="pr-popular-badge pr-popular-badge--best"><Crown size={12} /> Tiết kiệm nhất</div>
              <div className="pr-card-top">
                <span className="pr-plan-icon">👑</span>
                <h2>{yearly.planName}</h2>
                <div className="pr-price">
                  <span className="pr-price-num">{fmtVND(yearly.price)}</span>
                  <span className="pr-price-period">/ năm / giáo viên</span>
                </div>
                <div className="pr-savings">
                  Tiết kiệm {fmtVND(monthly?.price ? monthly.price * 2 : 278000)} so với theo tháng
                </div>
                <p className="pr-plan-desc">{yearly.description}</p>
              </div>
              <ul className="pr-features-list">
                <li><Check size={15} color="#f59e0b" /> Tất cả tính năng Pro Tháng</li>
                <li><Check size={15} color="#f59e0b" /> Tiết kiệm hơn 2 tháng</li>
                <li><Check size={15} color="#f59e0b" /> Không lo gia hạn mỗi tháng</li>
                <li><Check size={15} color="#f59e0b" /> Hỗ trợ ưu tiên cao nhất</li>
              </ul>
              <button className="pr-btn pr-btn-gold pr-btn-full" disabled={paying}
                onClick={() => handleSubscribe(yearly)}>
                {paying ? "Đang xử lý..." : "Đăng ký Pro Năm"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feature comparison table */}
      <div className="pr-compare">
        <h2>So sánh tính năng chi tiết</h2>
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Tính năng</th>
                <th>Gói Free</th>
                <th className="pr-th-pro">Gói Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(f => (
                <tr key={f.key}>
                  <td>{f.label}</td>
                  <td><FeatureCell val={f.free} /></td>
                  <td className="pr-td-pro"><FeatureCell val={f.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="pr-faq">
        <h2>Câu hỏi thường gặp</h2>
        <div className="pr-faq-grid">
          {[
            ["Thanh toán như thế nào?", "Chuyển khoản ngân hàng qua QR VietQR. Hệ thống sẽ kích hoạt gói sau khi xác nhận chuyển khoản."],
            ["Có thể nâng/hạ cấp gói không?", "Có thể nâng cấp bất cứ lúc nào. Gói mới sẽ có hiệu lực từ ngày kích hoạt."],
            ["Nếu hết hạn mà chưa gia hạn?", "Tài khoản sẽ tự động về gói Free. Dữ liệu của bạn được giữ nguyên."],
            ["Có hóa đơn không?", "Bạn có thể liên hệ email để nhận hóa đơn điện tử."],
          ].map(([q, a]) => (
            <div key={q} className="pr-faq-item">
              <h4>{q}</h4>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VietQR Modal */}
      {vietQrTx && <VietQRModal tx={vietQrTx} onClose={() => setVietQrTx(null)} />}
    </div>
  );
}
