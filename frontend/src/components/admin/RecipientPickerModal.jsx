import { useCallback, useEffect, useId, useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { listAdminUsers } from "../../services/adminUserService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "../../pages/admin/AdminQuotesPage.css";

/** Số user mỗi trang — đủ lớn để ít phải lật; totalPages luôn tính từ `total` API. */
const PAGE_LIMIT = 50;

/**
 * Chọn nhiều user làm người nhận thông báo.
 */
export default function RecipientPickerModal({
  open,
  selectedIds,
  onClose,
  onApply,
}) {
  const { t } = useTranslation();
  const baseId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localSelected, setLocalSelected] = useState(() => new Set(selectedIds));

  useEffect(() => {
    if (!open) return;
    setLocalSelected(new Set(selectedIds));
  }, [open, selectedIds]);

  useLayoutEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminUsers({
        search: search.trim() || undefined,
        page,
        limit: PAGE_LIMIT,
        status: "active",
      });
      setUsers(data.users ?? []);
      const totalRaw = Number(data.total);
      const safeTotal = Number.isFinite(totalRaw) ? Math.max(0, totalRaw) : 0;
      setTotal(safeTotal);
      const pages = Math.max(1, Math.ceil(safeTotal / PAGE_LIMIT));
      setTotalPages(pages);
    } catch (e) {
      setError(getAxiosErrorMessage(e));
      setUsers([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (!open) return undefined;
    const tmr = setTimeout(() => {
      void fetchUsers();
    }, 280);
    return () => clearTimeout(tmr);
  }, [open, fetchUsers]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id) => {
    const sid = String(id);
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  const apply = () => {
    onApply([...localSelected]);
    onClose();
  };

  const canPrev = !loading && page > 1;
  const canNext = !loading && page < totalPages;

  return (
    <div
      className="admin-quote-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-quote-modal"
        style={{ width: "min(640px, 100%)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-quote-modal-header">
          <h2 id={`${baseId}-title`} className="admin-quote-modal-title">
            {t("adminNotificationsDemo.recipientPickerTitle")}
          </h2>
          <button
            type="button"
            className="admin-quote-modal-close"
            aria-label={t("adminNotificationsDemo.modalClose")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="admin-quote-modal-body">
          <div className="admin-quote-field">
            <label className="admin-quote-label" htmlFor={`${baseId}-search`}>
              {t("adminNotificationsDemo.recipientSearch")}
            </label>
            <input
              id={`${baseId}-search`}
              type="search"
              className="admin-quote-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              autoComplete="off"
            />
          </div>
          {error ? (
            <p className="admin-quote-delete-hint" style={{ color: "#a33" }}>
              {error}
            </p>
          ) : null}
          <div
            style={{
              maxHeight: "min(48vh, 360px)",
              overflow: "auto",
              borderRadius: 10,
              border: "1px solid rgba(90, 107, 56, 0.28)",
            }}
          >
            {loading ? (
              <p className="admin-quote-delete-hint" style={{ padding: 12 }}>
                {t("adminNotificationsDemo.recipientLoading")}
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {users.map((u) => {
                  const id = String(u._id);
                  const checked = localSelected.has(id);
                  return (
                    <li
                      key={id}
                      style={{
                        borderBottom: "1px solid rgba(90,107,56,0.12)",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          cursor: "pointer",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                        />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          {u.name || "—"}{" "}
                          <span
                            style={{
                              fontWeight: 500,
                              color: "var(--admin-ink-soft)",
                            }}
                          >
                            {u.email}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 10,
            }}
          >
            <span className="admin-quote-delete-hint">
              {t("adminNotificationsDemo.recipientSelectedCount", {
                count: localSelected.size,
              })}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span
                className="admin-quote-delete-hint"
                style={{ fontWeight: 600 }}
              >
                {t("adminNotificationsDemo.recipientPager", {
                  page,
                  pages: totalPages,
                  total,
                })}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="admin-quote-btn admin-quote-btn--muted"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("adminNotificationsDemo.recipientPrev")}
                </button>
                <button
                  type="button"
                  className="admin-quote-btn admin-quote-btn--muted"
                  disabled={!canNext}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("adminNotificationsDemo.recipientNext")}
                </button>
              </div>
            </div>
          </div>
          <div className="admin-quote-modal-actions">
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--muted"
              onClick={onClose}
            >
              {t("adminNotificationsDemo.modalCancel")}
            </button>
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--primary"
              onClick={apply}
            >
              {t("adminNotificationsDemo.recipientApply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

RecipientPickerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};
