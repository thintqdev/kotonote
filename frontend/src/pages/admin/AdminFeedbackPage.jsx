import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  FEEDBACK_CATEGORY_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
} from "../../constants/feedbackFieldMeta.js";
import {
  listAdminFeedbacks,
  patchAdminFeedbackStatus,
} from "../../services/adminFeedbackService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../../utils/resolveAvatarUrl.js";
import "./AdminQuotesPage.css";
import "./AdminFeedbackPage.css";

const PAGE_LIMIT = 15;

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function userDisplay(feedback) {
  const u = feedback.userId;
  if (!u || typeof u !== "object") return "—";
  return u.name || u.email || "—";
}

export default function AdminFeedbackPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [feedbacks, setFeedbacks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        FEEDBACK_CATEGORY_OPTIONS.map((o) => [o.value, t(o.labelKey)]),
      ),
    [t],
  );

  const statusLabels = useMemo(
    () =>
      Object.fromEntries(
        FEEDBACK_STATUS_OPTIONS.map((o) => [o.value, t(o.labelKey)]),
      ),
    [t],
  );

  const queryParams = useMemo(() => {
    const p = { page, limit: PAGE_LIMIT };
    if (status) p.status = status;
    if (category) p.category = category;
    if (searchQuery.trim()) p.search = searchQuery.trim();
    return p;
  }, [page, status, category, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [status, category, searchQuery]);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminFeedbacks(queryParams);
      setFeedbacks(data.feedbacks ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (e) {
      const msg = getAxiosErrorMessage(e);
      setError(msg);
      toast.error(t("feedbackAdmin.errors.loadFailed"), { description: msg });
    } finally {
      setLoading(false);
    }
  }, [queryParams, t]);

  useEffect(() => {
    void fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await patchAdminFeedbackStatus(id, { status: newStatus });
      toast.success(t("feedbackAdmin.updatedToast"));
      await fetchFeedbacks();
    } catch (e) {
      toast.error(t("feedbackAdmin.errors.updateFailed"), {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const applySearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="admin-stub-main admin-quotes-page admin-feedback-screen">
      <h1 className="admin-quotes-title">{t("feedbackAdmin.title")}</h1>
      <p className="admin-quotes-lead">{t("feedbackAdmin.lead")}</p>

      <form className="admin-quotes-toolbar" onSubmit={applySearch}>
        <div className="admin-quotes-filters">
          <div className="admin-quotes-field">
            <label htmlFor="admin-fb-status">{t("feedbackAdmin.filterStatus")}</label>
            <select
              id="admin-fb-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t("feedbackAdmin.filterAll")}</option>
              {FEEDBACK_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-quotes-field">
            <label htmlFor="admin-fb-cat">{t("feedbackAdmin.filterCategory")}</label>
            <select
              id="admin-fb-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t("feedbackAdmin.filterAll")}</option>
              {FEEDBACK_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-quotes-field admin-feedback-search">
            <label htmlFor="admin-fb-search">{t("feedbackAdmin.filterSearch")}</label>
            <input
              id="admin-fb-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("feedbackAdmin.searchPlaceholder")}
            />
          </div>
        </div>
        <button type="submit" className="admin-feedback-search-btn">
          {t("feedbackAdmin.searchBtn")}
        </button>
      </form>

      {error && !loading && (
        <p className="admin-feedback-error" role="alert">
          {error}
        </p>
      )}

      <p className="admin-feedback-count">
        {t("feedbackAdmin.total", { count: total })}
      </p>

      {loading ? (
        <p className="admin-feedback-loading">{t("feedbackAdmin.loading")}</p>
      ) : feedbacks.length === 0 ? (
        <p className="admin-feedback-loading">{t("feedbackAdmin.empty")}</p>
      ) : (
        <div className="admin-feedback-table-wrap">
          <table className="admin-feedback-table">
            <thead>
              <tr>
                <th>{t("feedbackAdmin.colUser")}</th>
                <th>{t("feedbackAdmin.colCategory")}</th>
                <th>{t("feedbackAdmin.colMessage")}</th>
                <th>{t("feedbackAdmin.colMedia")}</th>
                <th>{t("feedbackAdmin.colPage")}</th>
                <th>{t("feedbackAdmin.colDate")}</th>
                <th>{t("feedbackAdmin.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb._id}>
                  <td className="admin-feedback-user">{userDisplay(fb)}</td>
                  <td>{categoryLabels[fb.category] ?? fb.category}</td>
                  <td className="admin-feedback-message">{fb.message}</td>
                  <td className="admin-feedback-media-cell">
                    {(fb.attachments?.length ?? 0) === 0 ? (
                      "—"
                    ) : (
                      <div className="admin-feedback-attachments">
                        {fb.attachments.map((att) => {
                          const href = resolvePublicMediaUrl(att.url);
                          if (!href) return null;
                          if (att.kind === "video") {
                            return (
                              <video
                                key={att.url}
                                className="admin-feedback-thumb"
                                src={href}
                                controls
                                playsInline
                                preload="metadata"
                              />
                            );
                          }
                          return (
                            <a
                              key={att.url}
                              href={href}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <img
                                className="admin-feedback-thumb admin-feedback-thumb--img"
                                src={href}
                                alt=""
                              />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td
                    className="admin-feedback-page-cell"
                    title={fb.pageUrl}
                  >
                    {fb.pageUrl || "—"}
                  </td>
                  <td>{formatDate(fb.createdAt)}</td>
                  <td>
                    <select
                      className="admin-feedback-status-select"
                      value={fb.status}
                      disabled={updatingId === fb._id}
                      onChange={(e) =>
                        void handleStatusChange(fb._id, e.target.value)
                      }
                      aria-label={t("feedbackAdmin.colStatus")}
                    >
                      {FEEDBACK_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {statusLabels[o.value]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="admin-feedback-pager" aria-label={t("feedbackAdmin.pager")}>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ←
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </button>
        </nav>
      )}
    </div>
  );
}
