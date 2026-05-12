import { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import { USER_STATUS_OPTIONS, userStatusLabel } from "../../constants/userFieldMeta.js";
import { patchAdminUserStatus } from "../../services/adminUserService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

/**
 * Modal đổi trạng thái — PATCH `/api/admin/users/:id/status`.
 */
export default function UserStatusModal({ open, user = null, onClose, onSaved }) {
  const baseId = useId();
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setStatus(user.status || "active");
  }, [open, user]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open || !user?._id) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === user.status) {
      toast.info("Không đổi", { description: "Trạng thái giữ nguyên." });
      onClose();
      return;
    }
    setSaving(true);
    try {
      await patchAdminUserStatus(String(user._id), status);
      toast.success("Đã cập nhật trạng thái", {
        description: `${user.email} → ${userStatusLabel(status)}`,
      });
      await Promise.resolve(onSaved());
      onClose();
    } catch (err) {
      toast.error("Không cập nhật được", {
        description: getAxiosErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="admin-users-modal-backdrop"
      role="presentation"
      onClick={() => !saving && onClose()}
    >
      <div
        className="admin-users-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="admin-users-modal-header">
          <h2 id={`${baseId}-title`} className="admin-users-modal-title">
            Trạng thái tài khoản
          </h2>
          <button
            type="button"
            className="admin-users-modal-close"
            aria-label="Đóng"
            disabled={saving}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form className="admin-users-modal-body" onSubmit={handleSubmit}>
          <p className="admin-users-status-lead">
            <strong>{user.name || "—"}</strong>
            <br />
            <span className="admin-users-status-email">{user.email}</span>
          </p>
          <p className="admin-users-status-current">
            Hiện tại: <strong>{userStatusLabel(user.status)}</strong>
          </p>
          <div className="admin-users-field">
            <label className="admin-users-label" htmlFor={`${baseId}-sel`}>
              Trạng thái mới
            </label>
            <select
              id={`${baseId}-sel`}
              className="admin-users-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
            >
              {USER_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-users-modal-actions">
            <button
              type="button"
              className="admin-users-btn admin-users-btn--muted"
              disabled={saving}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-users-btn admin-users-btn--primary"
              disabled={saving}
            >
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

UserStatusModal.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    email: PropTypes.string,
    name: PropTypes.string,
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
