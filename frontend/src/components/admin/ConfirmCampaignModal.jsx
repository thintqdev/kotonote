import { useEffect, useId } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../../pages/admin/AdminQuotesPage.css";

export default function ConfirmCampaignModal({
  open,
  loading,
  summary,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const baseId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open || !summary) return null;

  return (
    <div
      className="admin-quote-modal-backdrop"
      role="presentation"
      onClick={() => !loading && onClose()}
    >
      <div
        className="admin-quote-modal admin-quote-modal--narrow"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-quote-modal-header">
          <h2 id={`${baseId}-title`} className="admin-quote-modal-title">
            {t("adminNotificationsDemo.confirmModalTitle")}
          </h2>
          <button
            type="button"
            className="admin-quote-modal-close"
            aria-label={t("adminNotificationsDemo.modalClose")}
            disabled={loading}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="admin-quote-modal-body">
          <p className="admin-quote-delete-hint">{summary.audienceLine}</p>
          {summary.scheduleLine ? (
            <p className="admin-quote-delete-hint">{summary.scheduleLine}</p>
          ) : null}
          <p className="admin-quote-label">{t("adminNotificationsDemo.fieldKind")}</p>
          <p className="admin-quote-delete-preview">{summary.kindLabel}</p>
          <p className="admin-quote-label">{t("adminNotificationsDemo.fieldTitle")}</p>
          <p className="admin-quote-delete-preview">{summary.title}</p>
          <p className="admin-quote-label">{t("adminNotificationsDemo.fieldBody")}</p>
          <p className="admin-quote-delete-preview">{summary.message}</p>
          <div className="admin-quote-modal-actions">
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--muted"
              disabled={loading}
              onClick={onClose}
            >
              {t("adminNotificationsDemo.modalCancel")}
            </button>
            <button
              type="button"
              className="admin-quote-btn admin-quote-btn--primary"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading
                ? t("adminNotificationsDemo.confirmSending")
                : t("adminNotificationsDemo.confirmSend")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ConfirmCampaignModal.propTypes = {
  open: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  summary: PropTypes.shape({
    audienceLine: PropTypes.string.isRequired,
    scheduleLine: PropTypes.string,
    kindLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
