import { useEffect, useId, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BADGE_CATEGORY_OPTIONS,
  BADGE_RARITY_OPTIONS,
} from "../../constants/badgeFieldMeta.js";
import {
  clearAdminBadgeIcon,
  createAdminBadge,
  updateAdminBadge,
  uploadAdminBadgeIcon,
} from "../../services/adminBadgeService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../../utils/resolveAvatarUrl.js";
import "./BadgeFormModal.css";

const defaultForm = () => ({
  key: "",
  nameVi: "",
  nameJa: "",
  descriptionVi: "",
  descriptionJa: "",
  category: "general",
  rarity: "common",
  isActive: true,
  displayOrder: 0,
});

function formFromBadge(b) {
  if (!b) return defaultForm();
  return {
    key: b.key ?? "",
    nameVi: b.nameVi ?? "",
    nameJa: b.nameJa ?? "",
    descriptionVi: b.descriptionVi ?? "",
    descriptionJa: b.descriptionJa ?? "",
    category: b.category ?? "general",
    rarity: b.rarity ?? "common",
    isActive: b.isActive !== false,
    displayOrder: Number(b.displayOrder) || 0,
  };
}

/**
 * Modal tạo / sửa huy hiệu (badge thành tựu) — icon: upload ảnh vuông / trong suốt (PNG, WebP, …).
 */
export default function BadgeFormModal({
  open,
  mode,
  badge = null,
  onClose,
  onSaved,
}) {
  const { t } = useTranslation();
  const baseId = useId();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [iconFile, setIconFile] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [removeIcon, setRemoveIcon] = useState(false);

  const serverIconUrl = useMemo(() => {
    if (mode !== "edit" || !badge?.iconImage) return null;
    return resolvePublicMediaUrl(badge.iconImage);
  }, [mode, badge]);

  useEffect(() => {
    if (!open) return;
    setForm(mode === "edit" && badge ? formFromBadge(badge) : defaultForm());
    setIconFile(null);
    setRemoveIcon(false);
    setBlobUrl(null);
  }, [open, mode, badge]);

  useEffect(() => {
    if (!iconFile) {
      setBlobUrl(null);
      return undefined;
    }
    const u = URL.createObjectURL(iconFile);
    setBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [iconFile]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const title = mode === "create" ? "Thêm huy hiệu" : "Sửa huy hiệu";
  const keyLocked = mode === "edit";

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const previewSrc = removeIcon ? null : blobUrl || serverIconUrl;
  const hasServerIcon = Boolean(serverIconUrl);

  const handleIconChange = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setRemoveIcon(false);
    setIconFile(f);
  };

  const handleClearIcon = () => {
    setIconFile(null);
    if (hasServerIcon) {
      setRemoveIcon(true);
    } else {
      setRemoveIcon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const key = form.key.trim().toLowerCase();
    if (!/^[a-z0-9_]{2,64}$/.test(key)) {
      toast.error("Mã huy hiệu không hợp lệ", {
        description:
          "Dùng 2–64 ký tự: chữ thường a–z, số 0–9, gạch dưới _. Ví dụ: streak_7, vocab_master.",
      });
      return;
    }
    if (!form.nameVi.trim() || !form.nameJa.trim()) {
      toast.error("Thiếu tên", {
        description: "Cần nhập tên hiển thị tiếng Việt và tiếng Nhật.",
      });
      return;
    }

    const payload = {
      key,
      nameVi: form.nameVi.trim(),
      nameJa: form.nameJa.trim(),
      descriptionVi: form.descriptionVi.trim(),
      descriptionJa: form.descriptionJa.trim(),
      category: form.category,
      rarity: form.rarity,
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder) || 0,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const data = await createAdminBadge(payload);
        const created = data?.badge;
        if (iconFile && created?._id) {
          await uploadAdminBadgeIcon(String(created._id), iconFile);
        }
        toast.success("Đã tạo huy hiệu");
      } else if (badge?._id) {
        const id = String(badge._id);
        await updateAdminBadge(id, payload);
        if (removeIcon) {
          await clearAdminBadgeIcon(id);
        } else if (iconFile) {
          await uploadAdminBadgeIcon(id, iconFile);
        }
        toast.success("Đã cập nhật huy hiệu");
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
        <form className="admin-quote-modal-body" onSubmit={handleSubmit}>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-key`}>
              Mã nội bộ (key) <span className="admin-quote-req">*</span>
            </label>
            <input
              id={`${baseId}-key`}
              className="admin-quote-input"
              value={form.key}
              onChange={(e) => setField("key", e.target.value)}
              placeholder="vd: streak_7"
              autoComplete="off"
              disabled={keyLocked || saving}
              spellCheck={false}
            />
            {keyLocked ? (
              <p className="admin-quote-delete-hint" style={{ marginTop: 6 }}>
                Mã cố định sau khi tạo — tránh đổi để không lệch dữ liệu gán
                thưởng.
              </p>
            ) : (
              <p className="admin-quote-delete-hint" style={{ marginTop: 6 }}>
                Dùng trong code khi user đạt thành tựu (duy nhất, không dấu
                cách).
              </p>
            )}
          </div>

          <div className="badge-form-icon-block">
            <span className="admin-quote-label" id={`${baseId}-icon-label`}>
              {t("adminBadgesPage.formIconLabel")}
            </span>
            <div
              className="badge-form-icon-preview-wrap"
              aria-labelledby={`${baseId}-icon-label`}
            >
              {previewSrc ? (
                <img
                  className="badge-form-icon-preview-img"
                  src={previewSrc}
                  alt={t("adminBadgesPage.formIconPreviewAlt")}
                  decoding="async"
                />
              ) : (
                <span className="badge-form-icon-preview-empty">
                  {removeIcon
                    ? t("adminBadgesPage.formIconWillClear")
                    : "—"}
                </span>
              )}
            </div>
            <div className="badge-form-icon-actions">
              <input
                id={`${baseId}-icon-file`}
                className="badge-form-icon-file"
                type="file"
                accept="image/png,image/webp,image/gif,image/jpeg"
                disabled={saving}
                onChange={handleIconChange}
              />
              <label
                className="badge-form-icon-file-label"
                htmlFor={`${baseId}-icon-file`}
              >
                {t("adminBadgesPage.formIconChoose")}
              </label>
              <button
                type="button"
                className="badge-form-icon-btn-clear"
                disabled={
                  saving || (!iconFile && !hasServerIcon) || removeIcon
                }
                onClick={handleClearIcon}
              >
                {t("adminBadgesPage.formIconRemove")}
              </button>
            </div>
            <p className="badge-form-icon-hint">
              {t("adminBadgesPage.formIconHint")}
            </p>
          </div>

          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-nameVi`}>
              Tên (VI) <span className="admin-quote-req">*</span>
            </label>
            <input
              id={`${baseId}-nameVi`}
              className="admin-quote-input"
              value={form.nameVi}
              onChange={(e) => setField("nameVi", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-nameJa`}>
              Tên (JA) <span className="admin-quote-req">*</span>
            </label>
            <input
              id={`${baseId}-nameJa`}
              className="admin-quote-input"
              value={form.nameJa}
              onChange={(e) => setField("nameJa", e.target.value)}
              disabled={saving}
              lang="ja"
            />
          </div>

          <div className="admin-quote-field">
            <label
              className="admin-quote-label"
              htmlFor={`${baseId}-descVi`}
            >
              Mô tả thành tựu (VI)
            </label>
            <textarea
              id={`${baseId}-descVi`}
              className="admin-quote-textarea"
              value={form.descriptionVi}
              onChange={(e) => setField("descriptionVi", e.target.value)}
              disabled={saving}
              rows={2}
            />
          </div>
          <div className="admin-quote-field">
            <label
              className="admin-quote-label"
              htmlFor={`${baseId}-descJa`}
            >
              Mô tả thành tựu (JA)
            </label>
            <textarea
              id={`${baseId}-descJa`}
              className="admin-quote-textarea"
              value={form.descriptionJa}
              onChange={(e) => setField("descriptionJa", e.target.value)}
              disabled={saving}
              rows={2}
              lang="ja"
            />
          </div>

          <div className="admin-quote-row-2">
            <div className="admin-quote-field" style={{ marginBottom: 0 }}>
              <label
                className="admin-quote-label"
                htmlFor={`${baseId}-category`}
              >
                Danh mục
              </label>
              <select
                id={`${baseId}-category`}
                className="admin-quote-select"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                disabled={saving}
              >
                {BADGE_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-quote-field" style={{ marginBottom: 0 }}>
              <label
                className="admin-quote-label"
                htmlFor={`${baseId}-rarity`}
              >
                Độ hiếm
              </label>
              <select
                id={`${baseId}-rarity`}
                className="admin-quote-select"
                value={form.rarity}
                onChange={(e) => setField("rarity", e.target.value)}
                disabled={saving}
              >
                {BADGE_RARITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-quote-row-2" style={{ marginTop: 14 }}>
            <div className="admin-quote-field" style={{ marginBottom: 0 }}>
              <label
                className="admin-quote-label"
                htmlFor={`${baseId}-order`}
              >
                Thứ tự hiển thị
              </label>
              <input
                id={`${baseId}-order`}
                type="number"
                min={0}
                className="admin-quote-input"
                value={form.displayOrder}
                onChange={(e) => setField("displayOrder", e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="admin-quote-field" style={{ marginBottom: 0 }}>
              <span className="admin-quote-label">Trạng thái</span>
              <div className="admin-quote-switch-wrap">
                <button
                  type="button"
                  className={`admin-quote-switch${form.isActive ? " admin-quote-switch--on" : ""}`}
                  aria-pressed={form.isActive}
                  disabled={saving}
                  onClick={() => setField("isActive", !form.isActive)}
                >
                  <span className="admin-quote-switch-thumb" />
                </button>
                <span className="admin-quote-switch-caption">
                  {form.isActive ? "Đang bật" : "Đang tắt"}
                </span>
              </div>
            </div>
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
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

BadgeFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  badge: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    key: PropTypes.string,
    nameVi: PropTypes.string,
    nameJa: PropTypes.string,
    iconImage: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
