import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import {
  FEEDBACK_CATEGORY_OPTIONS,
  FEEDBACK_MAX_FILE_BYTES,
  FEEDBACK_MAX_FILES,
} from "../constants/feedbackFieldMeta.js";
import { mockStreak } from "../data/dashboardHomeMock.js";
import {
  listMyFeedbacks,
  submitFeedback,
  uploadFeedbackMedia,
} from "../services/feedbackService.js";
import {
  getApiErrorMessage,
  getAxiosErrorMessage,
} from "../utils/apiErrorMessage.js";
import { resolvePublicMediaUrl } from "../utils/resolveAvatarUrl.js";
import "./AuthPage.css";
import "./Profile.css";
import "./DashboardHome.css";
import "./Settings.css";
import "./FeedbackPage.css";

const MESSAGE_MAX = 2000;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function acceptAttr() {
  return Array.from(ALLOWED_MIME).join(",");
}

function formatFeedbackDate(v, locale) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString(locale === "ja" ? "ja-JP" : "vi-VN", {
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

/** @typedef {{ url: string, kind: 'image'|'video', localKey: string }} LocalAttachment */

export default function FeedbackPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState(
    /** @type {LocalAttachment[]} */ ([]),
  );
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await listMyFeedbacks({ page: 1, limit: 10 });
      setHistory(data.feedbacks ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const messageLength = message.trim().length;
  const canSubmit = messageLength > 0 && messageLength <= MESSAGE_MAX;

  const removeAttachment = useCallback((localKey) => {
    setAttachments((prev) => prev.filter((x) => x.localKey !== localKey));
  }, []);

  const processSelectedFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []).filter(Boolean);
      if (!files.length) return;

      let count = attachments.length;

      for (const file of files) {
        if (count >= FEEDBACK_MAX_FILES) {
          toast.error(
            t("feedbackPage.attachments.limitReached", {
              max: FEEDBACK_MAX_FILES,
            }),
          );
          break;
        }
        const mt = file.type || "";
        if (!ALLOWED_MIME.has(mt)) {
          toast.error(t("feedbackPage.attachments.badType"));
          continue;
        }
        if (file.size > FEEDBACK_MAX_FILE_BYTES) {
          toast.error(
            t("feedbackPage.attachments.tooLarge", {
              maxMb: FEEDBACK_MAX_FILE_BYTES / (1024 * 1024),
            }),
          );
          continue;
        }

        setUploadingMedia(true);
        try {
          const { url, kind } = await uploadFeedbackMedia(file);
          if (!url) {
            toast.error(t("feedbackPage.attachments.uploadFailed"));
            continue;
          }
          const localKey = `${url}-${kind}-${Math.random()}`;
          setAttachments((prev) => [...prev, { url, kind, localKey }]);
          count += 1;
        } catch (err) {
          toast.error(t("feedbackPage.attachments.uploadFailed"), {
            description:
              getAxiosErrorMessage(err) || getApiErrorMessage(err, t),
          });
        } finally {
          setUploadingMedia(false);
        }
      }
    },
    [attachments.length, t],
  );

  const handleFileChange = async (e) => {
    const input = e.target;
    await processSelectedFiles(input.files);
    input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting || uploadingMedia) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        category,
        message: message.trim(),
        attachments: attachments.map(({ url, kind }) => ({ url, kind })),
        pageUrl:
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "",
        locale: i18n.language || "vi",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
        appVersion: import.meta.env.VITE_APP_VERSION || "",
      });
      setSubmitted(true);
      setMessage("");
      setAttachments([]);
      toast.success(t("feedbackPage.successToast"));
      await loadHistory();
    } catch (err) {
      const code =
        err && typeof err === "object" && "messageCode" in err
          ? /** @type {{ messageCode?: string }} */ (err).messageCode
          : undefined;
      if (code === "MSG_1225") {
        toast.error(t("message.MSG_1225"));
      } else if (code === "MSG_1227") {
        toast.error(t("message.MSG_1227"));
      } else {
        toast.error(t("feedbackPage.errors.submitFailed"), {
          description:
            getAxiosErrorMessage(err) || getApiErrorMessage(err, t),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formBusy = submitting || uploadingMedia;

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      mainInnerClassName="profile-main settings-page feedback-page-shell"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.feedback") },
        ]}
      />

      <div className="settings-layout">
        <section className="settings-card profile-card settings-card--pinned">
          <span className="profile-card-tape" aria-hidden />
          <h1 className="settings-page-title profile-section-title">
            {t("feedbackPage.title")}
          </h1>
          <p className="settings-daily-progress-desc feedback-page-lead-flush">
            {t("feedbackPage.lead")}
          </p>

          {submitted ? (
            <div className="settings-saved-banner feedback-banner-spaced">
              {t("feedbackPage.successBanner")}
            </div>
          ) : null}

          <form
            className="feedback-unified-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="settings-field-block">
              <label
                className="settings-select-label"
                htmlFor="feedback-category"
              >
                {t("feedbackPage.categoryLabel")}
              </label>
              <select
                id="feedback-category"
                className="settings-select sketch-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={formBusy}
              >
                {FEEDBACK_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-field-block">
              <label
                className="settings-select-label"
                htmlFor="feedback-message"
              >
                {t("feedbackPage.messageLabel")}
              </label>
              <textarea
                id="feedback-message"
                className="profile-textarea sketch-input feedback-message-body"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedbackPage.messagePlaceholder")}
                maxLength={MESSAGE_MAX}
                disabled={formBusy}
                required
              />
            </div>

            <div className="settings-field-block">
              <span
                className="settings-select-label"
                id="feedback-files-label"
              >
                {t("feedbackPage.attachments.label")}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptAttr()}
                multiple
                className="feedback-file-input-hidden"
                aria-labelledby="feedback-files-label"
                onChange={handleFileChange}
                disabled={formBusy || attachments.length >= FEEDBACK_MAX_FILES}
              />
              <div className="feedback-attach-row">
                <button
                  type="button"
                  className="feedback-attach-pick"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    formBusy || attachments.length >= FEEDBACK_MAX_FILES
                  }
                >
                  {uploadingMedia
                    ? t("feedbackPage.attachments.uploading")
                    : t("feedbackPage.attachments.pick")}
                </button>
                <span className="feedback-attach-meta">
                  {t("feedbackPage.attachments.count", {
                    n: attachments.length,
                    max: FEEDBACK_MAX_FILES,
                  })}
                </span>
              </div>
              {attachments.length > 0 ? (
                <ul className="feedback-attach-strip">
                  {attachments.map((a) => {
                    const src = resolvePublicMediaUrl(a.url);
                    return (
                      <li
                        key={a.localKey}
                        className={`feedback-attach-tile feedback-attach-tile--${a.kind}`}
                      >
                        {a.kind === "video" && src ? (
                          <video
                            className="feedback-attach-thumb"
                            src={src}
                            preload="metadata"
                            muted
                            playsInline
                          />
                        ) : (
                          src && (
                            <img
                              className="feedback-attach-thumb"
                              src={src}
                              alt=""
                            />
                          )
                        )}
                        <button
                          type="button"
                          className="feedback-attach-remove"
                          onClick={() => removeAttachment(a.localKey)}
                          disabled={formBusy}
                          aria-label={t(
                            "feedbackPage.attachments.removeAria",
                          )}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <button
              type="submit"
              className="btn-primary btn-login settings-save-btn"
              disabled={!canSubmit || formBusy}
            >
              {submitting ? (
                <span className="btn-loading">...</span>
              ) : (
                <span className="btn-primary-line1">
                  <span className="btn-primary-main">
                    {t("feedbackPage.submit")}
                  </span>
                  <span className="btn-arrow">→</span>
                </span>
              )}
            </button>
          </form>

          <hr className="feedback-section-rule" />

          <h2 className="settings-subsection-title feedback-subsection-reset">
            {t("feedbackPage.historyTitle")}
          </h2>
          {historyLoading ? (
            <p className="feedback-history-muted">{t("feedbackPage.loading")}</p>
          ) : history.length === 0 ? (
            <p className="feedback-history-muted">
              {t("feedbackPage.historyEmpty")}
            </p>
          ) : (
            <ul className="feedback-history-compact">
              {history.map((item) => (
                <li key={item._id} className="feedback-history-compact-row">
                  <div className="feedback-history-compact-top">
                    <time dateTime={item.createdAt}>
                      {formatFeedbackDate(item.createdAt, i18n.language)}
                    </time>
                    <span
                      className={`feedback-status-pill feedback-status-pill--${item.status}`}
                    >
                      {t(`feedbackPage.status.${item.status}`)}
                    </span>
                  </div>
                  <p className="feedback-history-compact-msg">{item.message}</p>
                  {(item.attachments?.length ?? 0) > 0 ? (
                    <div className="feedback-history-compact-medias">
                      {item.attachments.map((att) => {
                        const url = resolvePublicMediaUrl(att.url);
                        return (
                          <span
                            key={att.url}
                            className="feedback-history-mini-media"
                          >
                            {att.kind === "video" && url ? (
                              <video
                                src={url}
                                controls
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              url && (
                                <a href={url} target="_blank" rel="noreferrer noopener">
                                  <img src={url} alt="" />
                                </a>
                              )
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <nav
            className="settings-quick-links feedback-back-nav"
            aria-label={t("settingsPage.sectionAccount")}
          >
            <Link className="settings-quick-link" to="/settings">
              {t("feedbackPage.backToSettings")}
            </Link>
          </nav>
        </section>
      </div>
    </Layout>
  );
}
