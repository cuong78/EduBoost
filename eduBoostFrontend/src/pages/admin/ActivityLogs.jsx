import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Loader2,
  RefreshCw,
  Search,
  User,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";
import { adminActivityLogService } from "../../services/adminActivityLogService";
import { showErrorToast } from "../../utils/show-toast";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatDateTime = (value) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function ActivityLogs() {
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

  const totalPages = useMemo(() => {
    const total = Number(pagination?.total || 0);
    const limit = Number(pagination?.limit || size || 10);
    return Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  }, [pagination?.total, pagination?.limit, size]);

  const fetchLogs = useCallback(
    async ({ isSilent = false } = {}) => {
      try {
        if (isSilent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await adminActivityLogService.getActivityLogs({
          keyword,
          page,
          size,
        });

        setLogs(Array.isArray(result?.data) ? result.data : []);
        setPagination(
          result?.pagination || {
            total: 0,
            page,
            limit: size,
          },
        );
      } catch (error) {
        showErrorToast(error?.response?.data?.message || "Không thể tải nhật ký hoạt động");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [keyword, page, size],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    const intervalId = window.setInterval(() => {
      fetchLogs({ isSilent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [autoRefresh, fetchLogs]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleClearSearch = () => {
    setKeywordInput("");
    setKeyword("");
    setPage(1);
  };

  const startIndex = logs.length === 0 ? 0 : (page - 1) * size + 1;
  const endIndex = Math.min((page - 1) * size + logs.length, Number(pagination?.total || 0));

  return (
    <div>
      <div className="ds-page-header">
        <div className="ds-page-header-left">
          <div className="ds-page-icon">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="ds-page-title">Nhật ký hoạt động người dùng</h1>
            <p className="ds-page-subtitle">Theo dõi người dùng đang thao tác gì trong hệ thống</p>
          </div>
        </div>
        <div className="ds-flex ds-gap-sm ds-items-center" style={{ flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setAutoRefresh((value) => !value)}
            className={`ds-btn ${autoRefresh ? "ds-btn-primary" : "ds-btn-secondary"}`}
          >
            <Radio size={14} /> {autoRefresh ? "Auto refresh: bật" : "Auto refresh: tắt"}
          </button>
          <button type="button" onClick={() => fetchLogs({ isSilent: true })} className="ds-btn ds-btn-secondary">
            {refreshing ? <Loader2 size={14} className="ds-spinner" /> : <RefreshCw size={14} />} Làm mới
          </button>
        </div>
      </div>

      <div className="ds-card" style={{ marginBottom: "var(--ds-space-lg)" }}>
        <div className="ds-card-body-compact">
          <form onSubmit={handleSearchSubmit} className="ds-flex ds-gap-sm ds-items-center" style={{ flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 320px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  color: "var(--ds-text-muted)",
                }}
              />
              <input
                type="text"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Tìm theo tên người dùng hoặc hành động..."
                className="ds-input"
                style={{ width: "100%", paddingLeft: 38 }}
              />
            </div>

            <select
              className="ds-select"
              value={size}
              onChange={(event) => {
                setPage(1);
                setSize(Number(event.target.value));
              }}
            >
              {PAGE_SIZE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item} dòng/trang
                </option>
              ))}
            </select>

            <button type="submit" className="ds-btn ds-btn-primary">
              Tìm kiếm
            </button>
            <button type="button" onClick={handleClearSearch} className="ds-btn ds-btn-secondary">
              Xóa lọc
            </button>
          </form>
        </div>
      </div>

      <div className="ds-card">
        {loading ? (
          <div className="ds-loading">
            <Loader2 size={24} className="ds-spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div className="ds-empty-state">
            <Activity size={40} opacity={0.25} />
            <p>Chưa có hoạt động nào phù hợp</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="ds-table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={{ width: 88 }}>Mã log</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th style={{ whiteSpace: "nowrap" }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="ds-badge ds-badge-neutral">#{log.id}</span>
                    </td>
                    <td>
                      <div className="ds-flex ds-gap-xs ds-items-center">
                        <User size={14} color="var(--ds-text-muted)" />
                        <div>
                          <div className="ds-text-bold">{log.userName || "Không rõ"}</div>
                          <div className="ds-text-sub">ID: {log.userId || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ds-flex ds-gap-xs ds-items-center">
                        <Activity size={14} color="var(--ds-primary)" />
                        <span>{log.action || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ds-flex ds-gap-xs ds-items-center" style={{ whiteSpace: "nowrap" }}>
                        <Clock3 size={14} color="var(--ds-text-muted)" />
                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="ds-card-body-compact" style={{ borderTop: "1px solid var(--ds-border-light)" }}>
          <div className="ds-flex ds-items-center ds-justify-between" style={{ flexWrap: "wrap", gap: 10 }}>
            <div className="ds-text-sub">
              Hiển thị {startIndex}-{endIndex} trên tổng {pagination?.total || 0} hoạt động
            </div>
            <div className="ds-flex ds-gap-sm ds-items-center">
              <button
                type="button"
                className="ds-btn ds-btn-secondary"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <span className="ds-text-sub">
                Trang {page}/{totalPages}
              </span>
              <button
                type="button"
                className="ds-btn ds-btn-secondary"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page >= totalPages || loading}
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
