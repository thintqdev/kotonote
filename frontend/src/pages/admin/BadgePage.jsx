import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import BadgeFormModal from "../../components/admin/BadgeFormModal.jsx";
import BadgeDeleteConfirmModal from "../../components/admin/BadgeDeleteConfirmModal.jsx";
import {
  BADGE_CATEGORY_OPTIONS,
  badgeCategoryLabel,
  badgeRarityLabel,
} from "../../constants/badgeFieldMeta.js";
import {
  deleteAdminBadge,
  listAdminBadges,
} from "../../services/adminBadgeService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../../utils/resolveAvatarUrl.js";
import "./AdminQuotesPage.css";
import "./BadgePage.css";

function AdminBadgeTableIcon({ badge }) {
  const src = resolvePublicMediaUrl(badge.iconImage);
  const em = badge.emoji?.trim();
  return (
    <div className="admin-badges-thumb-wrap">
      {src ? (
        <img
          className="admin-badges-thumb-img"
          src={src}
          alt=""
          decoding="async"
        />
      ) : em ? (
        <span className="admin-badges-thumb-fallback" aria-hidden>
          {em}
        </span>
      ) : (
        <span className="admin-badges-thumb-fallback">—</span>
      )}
    </div>
  );
}

function sortBadges(list) {
  return [...list].sort((a, b) => {
    const oa = Number(a.displayOrder) || 0;
    const ob = Number(b.displayOrder) || 0;
    if (oa !== ob) return oa - ob;
    const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return tb - ta;
  });
}

/**
 * Studio: quản lý huy hiệu thưởng khi user đạt thành tựu (định nghĩa metadata + mã `key` cho tích hợp sau).
 */
export default function BadgePage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingBadge, setEditingBadge] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const queryParams = useMemo(() => {
    const p = {};
    if (category) p.category = category;
    if (activeFilter !== "all") {
      p.isActive = activeFilter === "true";
    }
    return p;
  }, [category, activeFilter]);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminBadges(queryParams);
      setBadges(sortBadges(data.badges ?? []));
    } catch (e) {
      const msg = getAxiosErrorMessage(e);
      setError(msg);
      toast.error(t("adminBadgesPage.toastLoadErrorTitle"), {
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [queryParams, t]);

  useEffect(() => {
    void fetchBadges();
  }, [fetchBadges]);

  const openCreate = () => {
    setFormMode("create");
    setEditingBadge(null);
    setFormOpen(true);
  };

  const openEdit = (b) => {
    setFormMode("edit");
    setEditingBadge(b);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingBadge(null);
  };

  const openDeleteConfirm = (b) => {
    setDeleteTarget(b);
    setDeleteOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (!deleteSaving) {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleteSaving(true);
    try {
      await deleteAdminBadge(String(deleteTarget._id));
      toast.success(t("adminBadgesPage.toastDeleted"));
      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchBadges();
    } catch (e) {
      toast.error(t("adminBadgesPage.toastDeleteFail"), {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <div className="admin-stub-main admin-quotes-page">
      <h1 className="admin-quotes-title">{t("adminBadgesPage.title")}</h1>
      <p className="admin-quotes-lead">{t("adminBadgesPage.lead")}</p>

      <div className="admin-quotes-toolbar">
        <div className="admin-quotes-filters">
          <div className="admin-quotes-field">
            <label htmlFor="admin-badges-filter-cat">
              {t("adminBadgesPage.filterCategory")}
            </label>
            <select
              id="admin-badges-filter-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t("adminBadgesPage.filterAll")}</option>
              {BADGE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-quotes-field">
            <label htmlFor="admin-badges-filter-active">
              {t("adminBadgesPage.filterStatus")}
            </label>
            <select
              id="admin-badges-filter-active"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">{t("adminBadgesPage.filterAll")}</option>
              <option value="true">{t("adminBadgesPage.filterActive")}</option>
              <option value="false">
                {t("adminBadgesPage.filterInactive")}
              </option>
            </select>
          </div>
        </div>
        <div className="admin-quotes-actions">
          <button
            type="button"
            className="admin-quotes-btn admin-quotes-btn--ghost"
            onClick={() => void fetchBadges()}
            disabled={loading}
          >
            {t("adminBadgesPage.refresh")}
          </button>
          <button
            type="button"
            className="admin-quotes-btn admin-quotes-btn--primary"
            onClick={openCreate}
          >
            {t("adminBadgesPage.addBadge")}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-quotes-status">{t("adminBadgesPage.loading")}</p>
      ) : error ? (
        <p
          className="admin-quotes-status admin-quotes-status--error"
          role="alert"
        >
          {error}
        </p>
      ) : badges.length === 0 ? (
        <p className="admin-quotes-status">{t("adminBadgesPage.empty")}</p>
      ) : (
        <div className="admin-quotes-table-wrap">
          <table className="admin-quotes-table">
            <thead>
              <tr>
                <th>{t("adminBadgesPage.colOrder")}</th>
                <th>{t("adminBadgesPage.colIcon")}</th>
                <th>{t("adminBadgesPage.colKey")}</th>
                <th>{t("adminBadgesPage.colNameVi")}</th>
                <th>{t("adminBadgesPage.colNameJa")}</th>
                <th>{t("adminBadgesPage.colCategory")}</th>
                <th>{t("adminBadgesPage.colRarity")}</th>
                <th>{t("adminBadgesPage.colActive")}</th>
                <th aria-label={t("adminBadgesPage.colActionsAria")}>
                  {t("adminBadgesPage.colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {badges.map((b) => (
                <tr key={b._id}>
                  <td>{Number(b.displayOrder) || 0}</td>
                  <td>
                    <AdminBadgeTableIcon badge={b} />
                  </td>
                  <td>
                    <code className="admin-quotes-cell-text" title={b.key}>
                      {b.key}
                    </code>
                  </td>
                  <td>
                    <div className="admin-quotes-cell-text" title={b.nameVi}>
                      {b.nameVi}
                    </div>
                  </td>
                  <td>
                    <div
                      className="admin-quotes-cell-text admin-quotes-cell-text--ja"
                      lang="ja"
                      title={b.nameJa}
                    >
                      {b.nameJa}
                    </div>
                  </td>
                  <td>
                    <span className="admin-quotes-chip">
                      {badgeCategoryLabel(b.category)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-quotes-chip">
                      {badgeRarityLabel(b.rarity)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-quotes-chip${b.isActive === false ? " admin-quotes-chip--off" : ""}`}
                    >
                      {b.isActive === false
                        ? t("adminBadgesPage.statusOff")
                        : t("adminBadgesPage.statusOn")}
                    </span>
                  </td>
                  <td>
                    <div className="admin-quotes-row-actions">
                      <button
                        type="button"
                        className="admin-quotes-btn admin-quotes-btn--ghost"
                        onClick={() => openEdit(b)}
                      >
                        {t("adminBadgesPage.edit")}
                      </button>
                      <button
                        type="button"
                        className="admin-quotes-btn admin-quotes-btn--danger"
                        disabled={deleteSaving}
                        onClick={() => openDeleteConfirm(b)}
                      >
                        {t("adminBadgesPage.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BadgeFormModal
        open={formOpen}
        mode={formMode}
        badge={editingBadge}
        onClose={closeForm}
        onSaved={fetchBadges}
      />

      <BadgeDeleteConfirmModal
        open={deleteOpen}
        badge={deleteTarget}
        deleting={deleteSaving}
        onClose={closeDeleteConfirm}
        onConfirm={executeDelete}
      />
    </div>
  );
}
