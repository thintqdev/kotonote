import { useEffect, useId } from "react";
import PropTypes from "prop-types";

function truncate(s, max) {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Xác nhận xóa huy hiệu.
 */
export default function BadgeDeleteConfirmModal({
  open,
  badge,
  deleting,
  onClose,
  onConfirm,
}) {
  const baseId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting, onClose]);

  if (!open || !badge) return null;

  const previewKey = truncate(badge.key, 80);
  const previewVi = truncate(badge.nameVi, 160);
  const previewJa = truncate(badge.nameJa, 160);

  return (
    <div
      className="admin-quote-modal-backdrop"
      role="presentation"
      onClick={() => !deleting && onClose()}
    >
      <div
        className="admin-quote-modal admin-quote-modal--narrow"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        aria-describedby={`${baseId}-desc`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-quote-modal-header">
          <h2 id={`${baseId}-title`} className="admin-quote-modal-title">
            Xóa huy hiệu?
          </h2>
          <button
            type="button"
            className="admin-quote-modal-close"
            aria-label="Đóng"
            disabled={deleting}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="admin-quote-modal-body" id={`${baseId}-desc`}>
          <p className="admin-quote-delete-lead">
            Hành động không thể hoàn tác. Các bản ghi gán huy hiệu cho user (nếu
            có) có thể cần xử lý riêng sau này.
          </p>
          <p className="admin-quote-delete-hint">Mã (key)</p>
          <div className="admin-quote-delete-preview">
            <code>{previewKey || "—"}</code>
          </div>
          <p className="admin-quote-delete-hint">Tên</p>
          <div className="admin-quote-delete-preview" lang="vi">
            {previewVi || "—"}
          </div>
          {previewJa ? (
            <div
              className="admin-quote-delete-preview admin-quote-delete-preview--ja"
              lang="ja"
            >
              {previewJa}
            </div>
          ) : null}
          <p className="admin-quote-delete-hint">
            Bấm «Xóa» để xác nhận, hoặc «Hủy» để giữ nguyên.
          </p>
          <div className="admin-quote-modal-actions">
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--muted"
              disabled={deleting}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--danger"
              disabled={deleting}
              onClick={() => void onConfirm()}
            >
              {deleting ? "Đang xóa…" : "Xóa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

BadgeDeleteConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  badge: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    key: PropTypes.string,
    nameVi: PropTypes.string,
    nameJa: PropTypes.string,
  }),
  deleting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
