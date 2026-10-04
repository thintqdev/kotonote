import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import "../../pages/admin/AdminQuotesPage.css";

/**
 * Xác nhận xóa (hoặc hành động phá hủy) trên admin — không dùng window.confirm.
 */
export default function AdminDeleteConfirmModal({
  open,
  title,
  lead,
  preview,
  previewLang,
  confirmLabel = "Xóa",
  pendingLabel = "Đang xóa…",
  hint,
  deleting = false,
  onClose,
  onConfirm,
}) {
  const baseId = useId();
  const resolvedHint =
    hint ?? `Bấm «${confirmLabel}» để xác nhận, hoặc «Hủy» để giữ nguyên.`;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="admin-quote-modal-backdrop"
      style={{ zIndex: 1400 }}
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
            {title}
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
          {lead ? <p className="admin-quote-delete-lead">{lead}</p> : null}
          {preview ? (
            <div className="admin-quote-delete-preview" lang={previewLang}>
              {preview}
            </div>
          ) : null}
          <p className="admin-quote-delete-hint">{resolvedHint}</p>
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
              {deleting ? pendingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

AdminDeleteConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  lead: PropTypes.string,
  preview: PropTypes.string,
  previewLang: PropTypes.string,
  confirmLabel: PropTypes.string,
  pendingLabel: PropTypes.string,
  hint: PropTypes.string,
  deleting: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
