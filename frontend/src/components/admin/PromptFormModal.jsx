import { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import {
  JLPT_LEVEL_OPTIONS,
  PROMPT_TYPE_OPTIONS,
} from "../../constants/promptFieldMeta.js";
import {
  createAdminPrompt,
  updateAdminPrompt,
} from "../../services/adminPromptService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

const defaultForm = () => ({
  type: "vocabulary",
  templateKey: "",
  name: "",
  description: "",
  content: "",
  jlptLevel: "",
  category: "",
  isActive: true,
  displayOrder: 0,
});

function formFromPrompt(p) {
  if (!p) return defaultForm();
  return {
    type: p.type ?? "vocabulary",
    templateKey: p.templateKey ?? "",
    name: p.name ?? "",
    description: p.description ?? "",
    content: p.content ?? "",
    jlptLevel: p.jlptLevel ?? "",
    category: p.category ?? "",
    isActive: p.isActive !== false,
    displayOrder: Number(p.displayOrder) || 0,
  };
}

export default function PromptFormModal({
  open,
  mode,
  prompt = null,
  onClose,
  onSaved,
}) {
  const baseId = useId();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(mode === "edit" && prompt ? formFromPrompt(prompt) : defaultForm());
  }, [open, mode, prompt]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const title = mode === "create" ? "Thêm prompt" : "Sửa prompt";

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.templateKey.trim() || !form.content.trim()) {
      toast.error("Thiếu thông tin", {
        description: "Cần nhập tên, khóa template và nội dung prompt.",
      });
      return;
    }

    const payload = {
      type: form.type,
      templateKey: form.templateKey.trim().toLowerCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      content: form.content,
      jlptLevel: form.jlptLevel || undefined,
      category: form.category.trim() || undefined,
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder) || 0,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await createAdminPrompt(payload);
        toast.success("Đã tạo prompt");
      } else if (prompt?._id) {
        await updateAdminPrompt(String(prompt._id), payload);
        toast.success("Đã cập nhật prompt");
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
        className="admin-quote-modal admin-quote-modal--wide"
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
          <div className="admin-quote-row-2">
            <div className="admin-quote-field">
              <label className="admin-quote-label" htmlFor={`${baseId}-type`}>
                Loại <span className="admin-quote-req">*</span>
              </label>
              <select
                id={`${baseId}-type`}
                className="admin-quote-select"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                disabled={saving}
              >
                {PROMPT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-quote-field">
              <label className="admin-quote-label" htmlFor={`${baseId}-key`}>
                Khóa template <span className="admin-quote-req">*</span>
              </label>
              <input
                id={`${baseId}-key`}
                className="admin-quote-input"
                type="text"
                value={form.templateKey}
                onChange={(e) => setField("templateKey", e.target.value)}
                disabled={saving || mode === "edit"}
                placeholder="n5-basic"
              />
              <p className="admin-prompt-hint">vd: n5-basic, n3-daily</p>
            </div>
          </div>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-name`}>
              Tên hiển thị <span className="admin-quote-req">*</span>
            </label>
            <input
              id={`${baseId}-name`}
              className="admin-quote-input"
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-desc`}>
              Mô tả
            </label>
            <input
              id={`${baseId}-desc`}
              className="admin-quote-input"
              type="text"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-content`}>
              Nội dung prompt <span className="admin-quote-req">*</span>
            </label>
            <textarea
              id={`${baseId}-content`}
              className="admin-quote-textarea admin-prompt-content"
              rows={12}
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              disabled={saving}
            />
            <p className="admin-prompt-hint">
              Placeholder: {"{{count}}"}, {"{{existingWords}}"}, {"{{existingChars}}"}
            </p>
          </div>
          <div className="admin-quote-row-2">
            <div className="admin-quote-field">
              <label className="admin-quote-label" htmlFor={`${baseId}-jlpt`}>
                JLPT
              </label>
              <select
                id={`${baseId}-jlpt`}
                className="admin-quote-select"
                value={form.jlptLevel}
                onChange={(e) => setField("jlptLevel", e.target.value)}
                disabled={saving}
              >
                {JLPT_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value || "none"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-quote-field">
              <label className="admin-quote-label" htmlFor={`${baseId}-cat`}>
                Danh mục phụ
              </label>
              <input
                id={`${baseId}-cat`}
                className="admin-quote-input"
                type="text"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                disabled={saving}
                placeholder="basic, daily"
              />
            </div>
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
          <div className="admin-quote-field admin-quote-switch-wrap">
            <span className="admin-quote-label" id={`${baseId}-act-label`}>
              Đang dùng cho generate
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

PromptFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  prompt: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
