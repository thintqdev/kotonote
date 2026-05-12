import { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import { QUOTE_CATEGORY_OPTIONS } from "../../constants/quoteFieldMeta.js";
import {
  createAdminQuote,
  updateAdminQuote,
} from "../../services/adminQuoteService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

const defaultForm = () => ({
  quoteVi: "",
  quoteJa: "",
  author: "",
  category: "motivation",
  isActive: true,
  displayOrder: 0,
});

function formFromQuote(q) {
  if (!q) return defaultForm();
  return {
    quoteVi: q.quoteVi ?? "",
    quoteJa: q.quoteJa ?? "",
    author: q.author ?? "",
    category: q.category ?? "motivation",
    isActive: q.isActive !== false,
    displayOrder: Number(q.displayOrder) || 0,
  };
}

/**
 * Modal tạo / sửa quote — gọi API admin, báo toast lỗi nội bộ.
 */
export default function QuoteFormModal({
  open,
  mode,
  quote = null,
  onClose,
  onSaved,
}) {
  const baseId = useId();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(mode === "edit" && quote ? formFromQuote(quote) : defaultForm());
  }, [open, mode, quote]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const title = mode === "create" ? "Thêm quote" : "Sửa quote";

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quoteVi.trim() || !form.quoteJa.trim()) {
      toast.error("Thiếu nội dung", {
        description: "Cần nhập cả quote tiếng Việt và tiếng Nhật.",
      });
      return;
    }

    const payload = {
      quoteVi: form.quoteVi.trim(),
      quoteJa: form.quoteJa.trim(),
      author: form.author.trim() || undefined,
      category: form.category,
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder) || 0,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await createAdminQuote(payload);
        toast.success("Đã tạo quote");
      } else if (quote?._id) {
        await updateAdminQuote(String(quote._id), payload);
        toast.success("Đã cập nhật quote");
      }
      await Promise.resolve(onSaved());
      onClose();
    } catch (err) {
      toast.error("Không lưu được", {
        description: getAxiosErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="admin-quote-modal-backdrop"
      role="presentation"
      onClick={() => !saving && onClose()}
    >
      <div
        className="admin-quote-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="admin-quote-modal-header">
          <h2 id={`${baseId}-title`} className="admin-quote-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="admin-quote-modal-close"
            aria-label="Đóng"
            disabled={saving}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-quote-modal-body">
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-vi`}>
              Quote (VI) <span className="admin-quote-req">*</span>
            </label>
            <textarea
              id={`${baseId}-vi`}
              className="admin-quote-textarea"
              rows={3}
              value={form.quoteVi}
              onChange={(e) => setField("quoteVi", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-ja`}>
              Quote (JP) <span className="admin-quote-req">*</span>
            </label>
            <textarea
              id={`${baseId}-ja`}
              className="admin-quote-textarea"
              rows={3}
              lang="ja"
              value={form.quoteJa}
              onChange={(e) => setField("quoteJa", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-author`}>
              Tác giả
            </label>
            <input
              id={`${baseId}-author`}
              className="admin-quote-input"
              type="text"
              value={form.author}
              onChange={(e) => setField("author", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="admin-quote-row-2">
            <div className="admin-quote-field">
              <label className="admin-quote-label" htmlFor={`${baseId}-cat`}>
                Danh mục
              </label>
              <select
                id={`${baseId}-cat`}
                className="admin-quote-select"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                disabled={saving}
              >
                {QUOTE_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-quote-field">
              <label className="admin-quote-label" htmlFor={`${baseId}-order`}>
                Thứ tự
              </label>
              <input
                id={`${baseId}-order`}
                className="admin-quote-input"
                type="number"
                min={0}
                value={form.displayOrder}
                onChange={(e) =>
                  setField("displayOrder", Number(e.target.value) || 0)
                }
                disabled={saving}
              />
            </div>
          </div>
          <div className="admin-quote-field admin-quote-switch-wrap">
            <span className="admin-quote-label" id={`${baseId}-act-label`}>
              Đang hiển thị
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              aria-labelledby={`${baseId}-act-label`}
              className={`admin-quote-switch${form.isActive ? " admin-quote-switch--on" : ""}`}
              disabled={saving}
              onClick={() => setField("isActive", !form.isActive)}
            >
              <span className="admin-quote-switch-thumb" aria-hidden />
            </button>
            <span className="admin-quote-switch-caption">
              {form.isActive ? "Bật" : "Tắt"}
            </span>
          </div>

          <div className="admin-quote-modal-actions">
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--muted"
              disabled={saving}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-quote-btn admin-quote-btn--primary"
              disabled={saving}
            >
              {saving ? "Đang lưu…" : mode === "create" ? "Tạo" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

QuoteFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  quote: PropTypes.shape({
    _id: PropTypes.string,
    quoteVi: PropTypes.string,
    quoteJa: PropTypes.string,
    author: PropTypes.string,
    category: PropTypes.string,
    isActive: PropTypes.bool,
    displayOrder: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
