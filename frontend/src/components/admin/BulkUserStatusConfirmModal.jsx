import { useEffect, useId } from "react";
import PropTypes from "prop-types";

/**
 * Xác nhận cập nhật trạng thái hàng loạt — không dùng window.confirm.
 */
export default function BulkUserStatusConfirmModal({
  open,
  count,
  statusLabel,
  saving,
  onClose,
  onConfirm,
}) {
  const baseId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  return (
    <div
      className="admin-users-modal-backdrop"
      role="presentation"
      onClick={() => !saving && onClose()}
    >
      <div
        className="admin-users-modal admin-users-modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-users-modal-header">
          <h2 id={`${baseId}-title`} className="admin-users-modal-title">
            Xác nhận cập nhật
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
        <div className="admin-users-modal-body">
          <p className="admin-users-confirm-lead">
            Bạn sắp đặt trạng thái{" "}
            <strong className="admin-users-confirm-status">{statusLabel}</strong>{" "}
            cho <strong>{count}</strong> tài khoản đã chọn.
          </p>
          <p className="admin-users-confirm-hint">
            Thao tác áp dụng ngay sau khi bấm «Xác nhận».
          </p>
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
              type="button"
              className="admin-users-btn admin-users-btn--primary"
              disabled={saving || count < 1}
              onClick={() => void onConfirm()}
            >
              {saving ? "Đang xử lý…" : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

BulkUserStatusConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  statusLabel: PropTypes.string.isRequired,
  saving: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
