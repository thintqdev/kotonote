import { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { getAdminUser } from "../../services/adminUserService.js";
import {
  authProviderLabel,
  userRoleLabel,
  userStatusLabel,
} from "../../constants/userFieldMeta.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import { resolveAvatarUrl } from "../../utils/resolveAvatarUrl.js";

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("vi-VN");
  } catch {
    return String(v);
  }
}

function InfoRow({ label, children }) {
  return (
    <div className="admin-users-detail-row">
      <span className="admin-users-detail-dt">{label}</span>
      <span className="admin-users-detail-dd">{children}</span>
    </div>
  );
}

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * Modal chỉ đọc — GET `/api/admin/users/:id`.
 */
export default function UserDetailModal({ open, userId = null, onClose }) {
  const baseId = useId();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !userId) return undefined;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      setUser(null);
      try {
        const data = await getAdminUser(userId, { signal: ac.signal });
        if (!ac.signal.aborted) setUser(data.user ?? null);
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(getAxiosErrorMessage(e));
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [open, userId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open || !userId) return null;

  return (
    <div
      className="admin-users-modal-backdrop"
      role="presentation"
      onClick={() => !loading && onClose()}
    >
      <div
        className="admin-users-modal admin-users-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-users-modal-header">
          <h2 id={`${baseId}-title`} className="admin-users-modal-title">
            Chi tiết người dùng
          </h2>
          <button
            type="button"
            className="admin-users-modal-close"
            aria-label="Đóng"
            disabled={loading}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="admin-users-modal-body">
          {loading ? (
            <p className="admin-users-modal-status">Đang tải…</p>
          ) : error ? (
            <p className="admin-users-modal-status admin-users-modal-status--error" role="alert">
              {error}
            </p>
          ) : user ? (
            <div className="admin-users-detail-list" role="list">
              <InfoRow label="Email">{user.email}</InfoRow>
              <InfoRow label="Tên">{user.name || "—"}</InfoRow>
              <InfoRow label="Vai trò">{userRoleLabel(user.role)}</InfoRow>
              <InfoRow label="Đăng nhập">{authProviderLabel(user.authProvider)}</InfoRow>
              <InfoRow label="Trạng thái tài khoản">{userStatusLabel(user.status)}</InfoRow>
              <InfoRow label="Kích hoạt (isActive)">{user.isActive !== false ? "Có" : "Không"}</InfoRow>
              <InfoRow label="Email đã xác minh">{user.isEmailVerified ? "Có" : "Chưa"}</InfoRow>
              {user.googleId ? (
                <InfoRow label="Google ID">
                  <code className="admin-users-code">{user.googleId}</code>
                </InfoRow>
              ) : null}
              <InfoRow label="Đăng nhập gần nhất">{formatDate(user.lastLogin)}</InfoRow>
              <InfoRow label="Tạo lúc">{formatDate(user.createdAt)}</InfoRow>
              <InfoRow label="Cập nhật">{formatDate(user.updatedAt)}</InfoRow>
              {user.avatar ? (
                <InfoRow label="Avatar">
                  <a
                    className="admin-users-link"
                    href={resolveAvatarUrl(user.avatar) || user.avatar}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mở ảnh
                  </a>
                </InfoRow>
              ) : (
                <InfoRow label="Avatar">—</InfoRow>
              )}
            </div>
          ) : (
            <p className="admin-users-modal-status">Không có dữ liệu.</p>
          )}
          <div className="admin-users-modal-actions">
            <button
              type="button"
              className="admin-users-btn admin-users-btn--primary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

UserDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
