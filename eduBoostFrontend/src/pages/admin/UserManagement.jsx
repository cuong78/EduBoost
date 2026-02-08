import { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  UserCheck,
  Shield,
  Users,
  AlertCircle,
  X,
  Loader2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { adminUserService } from "../../services/adminUserService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (error) {
      showErrorToast("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" || user.roles?.some((role) => role === filterRole);
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (user) => {
    setEditingUser({
      userId: user.userId,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "ACTIVE",
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminUserService.updateUser(editingUser.userId, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        phone: editingUser.phone,
        status: editingUser.status,
      });
      showSuccessToast("Cập nhật thông tin người dùng thành công");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      showErrorToast(
        error.response?.data?.message || "Không thể cập nhật người dùng",
      );
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminUserService.updateUserStatus(userId, newStatus);
      showSuccessToast("Cập nhật trạng thái thành công");
      fetchUsers();
    } catch (error) {
      showErrorToast("Không thể cập nhật trạng thái");
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    inactive: users.filter((u) => u.status === "INACTIVE").length,
  };

  if (loading) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span>Admin</span>
        <ChevronRight size={16} />
        <span>Quản lý tài khoản</span>
      </nav>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Tài khoản</h2>
          <p>Quản lý thông tin và quyền hạn của người dùng trong hệ thống</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-header">
            <div className="stat-content">
              <p className="stat-label">TỔNG NGƯỜI DÙNG</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
            <div className="stat-icon-wrapper bg-indigo">
              <Users size={24} color="white" />
            </div>
          </div>
          <div className="stat-footer">
            <span className="stat-indicator positive">
              <TrendingUp size={16} /> +{stats.active}
            </span>
            <span className="stat-description">đang hoạt động</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <div className="stat-content">
              <p className="stat-label">ĐANG HOẠT ĐỘNG</p>
              <h3 className="stat-value">{stats.active}</h3>
            </div>
            <div className="stat-icon-wrapper bg-green">
              <UserCheck size={24} color="white" />
            </div>
          </div>
          <div className="stat-footer">
            <span className="stat-description">Tài khoản đã xác thực</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-header">
            <div className="stat-content">
              <p className="stat-label">KHÔNG HOẠT ĐỘNG</p>
              <h3 className="stat-value">{stats.inactive}</h3>
            </div>
            <div className="stat-icon-wrapper bg-red">
              <AlertCircle size={24} color="white" />
            </div>
          </div>
          <div className="stat-footer">
            <span className="stat-description">Tài khoản bị vô hiệu hóa</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section glass">
        <div className="filter-row">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Giáo viên</option>
            <option value="STUDENT">Học sinh</option>
            <option value="PARENT">Phụ huynh</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state glass">
          <Users size={48} />
          <p>Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="users-table-wrap glass">
          <table className="users-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Thông tin liên hệ</th>
                <th>Vai trò & Lớp học</th>
                <th>Trạng thái</th>
                <th>Xác thực</th>
                <th style={{ textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar-wrapper">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.fullName?.charAt(0) ||
                              user.username?.charAt(0) ||
                              "U"}
                          </div>
                        )}
                        {user.roles?.includes("ADMIN") && (
                          <div className="admin-badge">
                            <Shield size={12} color="white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="user-name">
                          {user.fullName || "Chưa cập nhật"}
                        </div>
                        <div className="user-username">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-email">{user.email}</div>
                      <div className="contact-phone">
                        {user.phone || "Chưa có SĐT"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="roles-container">
                      <div className="roles-list">
                        {user.roles?.map((role) => (
                          <span
                            key={role}
                            className={`role-badge role-${role.toLowerCase()}`}
                          >
                            {role === "ADMIN" && <Shield size={12} />}
                            {role}
                          </span>
                        ))}
                      </div>
                      {user.teachingClass && (
                        <div className="class-info-inline">
                          <span className="class-badge teaching">
                            Đang dạy: {user.teachingClass}
                          </span>
                        </div>
                      )}
                      {user.studyingClass && (
                        <div className="class-info-inline">
                          <span className="class-badge studying">
                            Lớp: {user.studyingClass}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.status}
                      onChange={(e) =>
                        handleStatusChange(user.userId, e.target.value)
                      }
                      className={`status-select status-${user.status.toLowerCase()}`}
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
                    </select>
                  </td>
                  <td>
                    {user.isVerify ? (
                      <span className="verify-badge verified">
                        <UserCheck size={12} />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="verify-badge unverified">
                        <AlertCircle size={12} />
                        Chưa xác thực
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="btn btn-sm btn-glass"
                    >
                      <Edit2 size={16} />
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>Chỉnh sửa thông tin người dùng</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                    pattern="[0-9]{10,11}"
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-glass"
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .user-management-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .breadcrumb span:last-child {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.5rem 0;
        }

        .stat-value {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          line-height: 1;
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .bg-indigo {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .bg-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .bg-red {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .stat-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f3f4f6;
        }

        .stat-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .stat-indicator.positive {
          color: #10b981;
        }

        .stat-description {
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Filters */
        .filters-section {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .filter-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-secondary);
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.95rem;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .filter-select {
          padding: 0.875rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Table */
        .users-table-wrap {
          border-radius: 16px;
          overflow: hidden;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .users-table thead {
          background: linear-gradient(135deg, #eef2ff, #f5f3ff);
        }

        .users-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
        }

        .users-table tbody tr {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          transition: background-color 0.2s;
        }

        .users-table tbody tr:hover {
          background: rgba(99, 102, 241, 0.03);
        }

        .users-table td {
          padding: 1.25rem 1.5rem;
        }

        /* User Info */
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar-wrapper {
          position: relative;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #eef2ff;
        }

        .user-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .admin-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: #8b5cf6;
          border-radius: 50%;
          padding: 4px;
          border: 2px solid white;
        }

        .user-name {
          font-weight: 700;
          color: var(--color-text-primary);
          font-size: 1rem;
        }

        .user-username {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        /* Contact Info */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .contact-email {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.95rem;
        }

        .contact-phone {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        /* Roles */
        .roles-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid;
        }

        .role-admin {
          background: rgba(139, 92, 246, 0.1);
          color: #7c3aed;
          border-color: rgba(139, 92, 246, 0.3);
        }

        .role-teacher {
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
          border-color: rgba(59, 130, 246, 0.3);
        }

        .role-student {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .role-parent {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border-color: rgba(245, 158, 11, 0.3);
        }

        /* Status Select */
        .status-select {
          padding: 0.5rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: 2px solid;
        }

        .status-select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .status-active {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .status-inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* Verify Badge */
        .verify-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .verify-badge.verified {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .verify-badge.unverified {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        /* Roles Container */
        .roles-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .roles-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .class-info-inline {
          display: flex;
          align-items: center;
        }

        .class-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .class-badge.teaching {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
          color: #4f46e5;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .class-badge.studying {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* Button Styles */
        .btn-sm {
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 16px;
        }

        .empty-state svg {
          color: var(--color-text-secondary);
          margin: 0 auto 1rem;
        }

        .empty-state p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
          margin-top: 1rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 20px;
        }

        .modal-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px 20px 0 0;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .modal-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-form {
          padding: 2rem;
          background: white;
          border-radius: 0 0 20px 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select {
          padding: 0.875rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .form-actions .btn {
          flex: 1;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .filter-row {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .users-table {
            font-size: 0.875rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
