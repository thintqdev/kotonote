import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import UserDetailModal from "../../components/admin/UserDetailModal.jsx";
import UserStatusModal from "../../components/admin/UserStatusModal.jsx";
import {
  AUTH_PROVIDER_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  authProviderLabel,
  userRoleLabel,
  userStatusLabel,
} from "../../constants/userFieldMeta.js";
import {
  getAdminUserStatistics,
  listAdminUsers,
} from "../../services/adminUserService.js";
import { getAdminJwtUserId } from "../../utils/adminJwt.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminUsersPage.css";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatShortDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusChipClass(status) {
  if (status === "locked") return "admin-users-chip--st-locked";
  if (status === "suspended") return "admin-users-chip--st-suspended";
  return "admin-users-chip--st-active";
}

export default function AdminUsersPage() {
  const currentAdminId = useMemo(() => getAdminJwtUserId(), []);

  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [authProvider, setAuthProvider] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusUser, setStatusUser] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (status) p.status = status;
    if (role) p.role = role;
    if (authProvider) p.authProvider = authProvider;
    if (searchQuery.trim()) p.search = searchQuery.trim();
    return p;
  }, [page, pageSize, status, role, authProvider, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [status, role, authProvider, searchQuery, pageSize]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getAdminUserStatistics();
      setStats(data.statistics ?? null);
    } catch (e) {
      toast.error("Không tải được thống kê", {
        description: getAxiosErrorMessage(e),
      });
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminUsers(queryParams);
      setUsers(data.users ?? []);
      setTotal(Number(data.total) || 0);
      const tp = Number(data.totalPages);
      setTotalPages(Number.isFinite(tp) && tp > 0 ? tp : 0);
    } catch (e) {
      const msg = getAxiosErrorMessage(e);
      setError(msg);
      toast.error("Không tải được danh sách người dùng", {
        description: msg,
      });
      setUsers([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const applySearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const refreshAll = () => {
    void fetchUsers();
    void fetchStats();
  };

  const openDetail = (id) => {
    setDetailUserId(String(id));
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailUserId(null);
  };

  const openStatus = (u) => {
    setStatusUser(u);
    setStatusOpen(true);
  };

  const closeStatus = () => {
    setStatusOpen(false);
    setStatusUser(null);
  };

  const pagesSafe = Math.max(1, totalPages || 1);

  return (
    <div className="admin-stub-main admin-users-page">
      <h1 className="admin-users-title">Quản lý người dùng</h1>
      <p className="admin-users-lead">
        Lọc danh sách, xem chi tiết và cập nhật trạng thái tài khoản qua API .
      </p>

      <section className="admin-users-stats" aria-label="Thống kê người dùng">
        {statsLoading ? (
          <p className="admin-users-status">Đang tải thống kê…</p>
        ) : stats ? (
          <>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">{stats.totalUsers}</div>
              <div className="admin-users-stat-label">Tổng tài khoản</div>
            </div>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">{stats.activeUsers}</div>
              <div className="admin-users-stat-label">Đang hoạt động</div>
            </div>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">{stats.lockedUsers}</div>
              <div className="admin-users-stat-label">Đã khóa</div>
            </div>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">
                {stats.suspendedUsers}
              </div>
              <div className="admin-users-stat-label">Tạm ngưng</div>
            </div>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">{stats.googleUsers}</div>
              <div className="admin-users-stat-label">Google</div>
            </div>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">{stats.localUsers}</div>
              <div className="admin-users-stat-label">Local</div>
            </div>
            <div className="admin-users-stat">
              <div className="admin-users-stat-value">{stats.recentUsers}</div>
              <div className="admin-users-stat-label">Mới (30 ngày)</div>
            </div>
          </>
        ) : null}
      </section>

      <div className="admin-users-toolbar">
        <div className="admin-users-filters">
          <div className="admin-users-filter">
            <label htmlFor="adm-user-search">Tìm email / tên</label>
            <div className="admin-users-filter--search">
              <input
                id="adm-user-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch();
                }}
                placeholder="Nhập và bấm Áp dụng hoặc Enter"
              />
            </div>
          </div>
          <div className="admin-users-filter">
            <label htmlFor="adm-user-status">Trạng thái</label>
            <select
              id="adm-user-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tất cả</option>
              {USER_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-users-filter">
            <label htmlFor="adm-user-role">Vai trò</label>
            <select
              id="adm-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Tất cả</option>
              {USER_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-users-filter">
            <label htmlFor="adm-user-provider">Đăng nhập</label>
            <select
              id="adm-user-provider"
              value={authProvider}
              onChange={(e) => setAuthProvider(e.target.value)}
            >
              <option value="">Tất cả</option>
              {AUTH_PROVIDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-users-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={applySearch}
          >
            Áp dụng tìm
          </button>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={refreshAll}
            disabled={loading && statsLoading}
          >
            Làm mới
          </button>
        </div>
      </div>

      {!loading && !error && total > 0 ? (
        <label className="admin-users-page-size">
          <span>Mỗi trang</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Số dòng mỗi trang"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {loading ? (
        <p className="admin-users-status">Đang tải danh sách…</p>
      ) : error ? (
        <p
          className="admin-users-status admin-users-status--error"
          role="alert"
        >
          {error}
        </p>
      ) : users.length === 0 ? (
        <p className="admin-users-status">Không có người dùng khớp bộ lọc.</p>
      ) : (
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tên</th>
                <th>Vai trò</th>
                <th>Đăng nhập</th>
                <th>Trạng thái</th>
                <th>Xác minh</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf =
                  currentAdminId && String(u._id) === currentAdminId;
                return (
                  <tr key={u._id}>
                    <td className="admin-users-cell-email">{u.email}</td>
                    <td>{u.name || "—"}</td>
                    <td>
                      <span
                        className={`admin-users-chip${u.role === "admin" ? " admin-users-chip--role-admin" : " admin-users-chip--role-user"}`}
                      >
                        {userRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="admin-users-cell-muted">
                      {authProviderLabel(u.authProvider)}
                    </td>
                    <td>
                      <span
                        className={`admin-users-chip ${statusChipClass(u.status)}`}
                      >
                        {userStatusLabel(u.status)}
                      </span>
                    </td>
                    <td className="admin-users-cell-muted">
                      {u.isEmailVerified ? "Có" : "Chưa"}
                    </td>
                    <td className="admin-users-cell-muted">
                      {formatShortDate(u.lastLogin)}
                    </td>
                    <td>
                      <div className="admin-users-row-actions">
                        <button
                          type="button"
                          className="admin-users-btn admin-users-btn--ghost"
                          onClick={() => openDetail(u._id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          className="admin-users-btn admin-users-btn--primary"
                          onClick={() => openStatus(u)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Không đổi trạng thái tài khoản đang đăng nhập Studio."
                              : undefined
                          }
                        >
                          Trạng thái
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && total > 0 ? (
        <nav className="admin-users-pagination" aria-label="Phân trang">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </button>
          <span className="admin-users-pagination-info">
            Trang {page} / {pagesSafe}
            <span aria-hidden> · </span>
            {total} tài khoản
          </span>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            disabled={totalPages > 0 ? page >= totalPages : true}
            onClick={() =>
              setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))
            }
          >
            Sau
          </button>
        </nav>
      ) : null}

      <UserDetailModal
        open={detailOpen}
        userId={detailUserId}
        onClose={closeDetail}
      />
      <UserStatusModal
        open={statusOpen}
        user={statusUser}
        onClose={closeStatus}
        onSaved={async () => {
          await fetchUsers();
          await fetchStats();
        }}
      />
    </div>
  );
}
