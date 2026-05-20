import { useEffect, useId } from "react";
import PropTypes from "prop-types";

function truncate(s, max) {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Xác nhận xóa quote — không dùng window.confirm.
 */
export default function PromptDeleteConfirmModal({
  open,
  prompt,
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

  if (!open || !prompt) return null;

  const previewName = truncate(prompt.name, 200);
  const previewKey = truncate(prompt.templateKey, 80);

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
            Xóa prompt?
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
            Hành động không thể hoàn tác. Prompt sẽ bị gỡ khỏi hệ thống.
          </p>
          <div className="admin-quote-delete-preview" lang="vi">
            {previewName || "—"}
          </div>
          {previewKey ? (
            <p className="admin-prompt-hint" style={{ margin: "0 0 12px" }}>
              Khóa: <code>{previewKey}</code>
            </p>
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

PromptDeleteConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  prompt: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    templateKey: PropTypes.string,
  }),
  deleting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
