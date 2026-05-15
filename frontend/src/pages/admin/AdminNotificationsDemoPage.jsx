import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import "../../components/common/NotificationItem.css";
import "./AdminQuotesPage.css";
import RecipientPickerModal from "../../components/admin/RecipientPickerModal.jsx";
import ConfirmCampaignModal from "../../components/admin/ConfirmCampaignModal.jsx";
import {
  listAdminNotificationCampaigns,
  createAdminNotificationCampaign,
  cancelAdminNotificationCampaign,
} from "../../services/adminNotificationCampaignService.js";
import { useAdminNotificationSocket } from "../../hooks/useAdminNotificationSocket.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminNotificationsDemoPage.css";

const KIND_VALUES = [
  "broadcast_maintenance",
  "broadcast_feature",
  "learning_streak",
  "learning_new_content",
  "learning_review_result",
];

const KIND_TO_NOTIF_CLASS = {
  broadcast_maintenance: "reminder",
  broadcast_feature: "update",
  learning_streak: "goal",
  learning_new_content: "progress",
  learning_review_result: "achievement",
};

function mapKindToApi(kind) {
  const m = {
    broadcast_maintenance: { type: "warning", category: "system" },
    broadcast_feature: { type: "info", category: "admin" },
    learning_streak: { type: "info", category: "streak" },
    learning_new_content: { type: "success", category: "kanji" },
    learning_review_result: { type: "success", category: "quiz" },
  };
  return m[kind] || { type: "info", category: "admin" };
}

function defaultTitle(t, kind) {
  return t(`adminNotificationsDemo.sampleTitle.${kind}`);
}

function defaultBody(t, kind) {
  return t(`adminNotificationsDemo.sampleBody.${kind}`);
}

function formatLocal(dt) {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

/** Studio: soạn thông báo, chọn người nhận, lên lịch / gửi ngay — REST + Socket admin. */
export default function AdminNotificationsDemoPage() {
  const { t } = useTranslation();
  const { socket, connected } = useAdminNotificationSocket(true);

  const [kind, setKind] = useState("broadcast_feature");
  const [title, setTitle] = useState(() =>
    defaultTitle(t, "broadcast_feature"),
  );
  const [body, setBody] = useState(() => defaultBody(t, "broadcast_feature"));
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [previewUnread, setPreviewUnread] = useState(true);

  const [audience, setAudience] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [scheduleMode, setScheduleMode] = useState("immediate");
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);

  const notifModifier = KIND_TO_NOTIF_CLASS[kind] ?? "update";
  const previewTime = useMemo(() => t("time.justNow"), [t]);

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const data = await listAdminNotificationCampaigns({ limit: 25, skip: 0 });
      setCampaigns(data.campaigns ?? []);
    } catch (e) {
      toast.error(t("adminNotificationsDemo.campaignsLoadError"), {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setCampaignsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (!socket) return undefined;
    const onAdmin = () => {
      void loadCampaigns();
    };
    socket.on("admin:notification", onAdmin);
    return () => {
      socket.off("admin:notification", onAdmin);
    };
  }, [socket, loadCampaigns]);

  const fillSample = useCallback(() => {
    setTitle(defaultTitle(t, kind));
    setBody(defaultBody(t, kind));
    setLinkUrl("");
    setLinkLabel("");
  }, [kind, t]);

  const resetAll = useCallback(() => {
    setKind("broadcast_feature");
    setTitle(defaultTitle(t, "broadcast_feature"));
    setBody(defaultBody(t, "broadcast_feature"));
    setLinkUrl("");
    setLinkLabel("");
    setPreviewUnread(true);
    setAudience("all");
    setSelectedUserIds([]);
    setScheduleMode("immediate");
    setScheduledAtLocal("");
  }, [t]);

  const kindLabel = t(`adminNotificationsDemo.kind.${kind}`);

  const openConfirm = () => {
    if (audience === "selected" && selectedUserIds.length === 0) {
      toast.error(t("adminNotificationsDemo.validationRecipients"));
      return;
    }
    if (scheduleMode === "scheduled" && !scheduledAtLocal.trim()) {
      toast.error(t("adminNotificationsDemo.validationScheduleDate"));
      return;
    }
    setConfirmOpen(true);
  };

  const buildPayload = useCallback(() => {
    const { type, category } = mapKindToApi(kind);
    let scheduledAt = null;
    if (scheduleMode === "scheduled" && scheduledAtLocal) {
      const d = new Date(scheduledAtLocal);
      scheduledAt = Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    let actionType = "none";
    let actionData = undefined;
    if (linkUrl.trim()) {
      actionType = "open_page";
      actionData = {
        url: linkUrl.trim(),
        label: linkLabel.trim() || linkUrl.trim(),
      };
    }
    return {
      title: title.trim(),
      message: body.trim(),
      type,
      category,
      audience,
      userIds: audience === "selected" ? selectedUserIds : [],
      scheduledAt,
      actionType,
      actionData,
    };
  }, [
    audience,
    body,
    kind,
    linkLabel,
    linkUrl,
    scheduleMode,
    scheduledAtLocal,
    selectedUserIds,
    title,
  ]);

  const confirmSummary = useMemo(() => {
    const audienceLine =
      audience === "all"
        ? t("adminNotificationsDemo.confirmAudienceAll")
        : t("adminNotificationsDemo.confirmAudienceSelected", {
            count: selectedUserIds.length,
          });
    let scheduleLine = "";
    if (scheduleMode === "scheduled" && scheduledAtLocal) {
      scheduleLine = t("adminNotificationsDemo.confirmScheduledFor", {
        when: formatLocal(scheduledAtLocal),
      });
    } else {
      scheduleLine = t("adminNotificationsDemo.confirmImmediate");
    }
    return {
      audienceLine,
      scheduleLine,
      kindLabel,
      title: title.trim() || t("adminNotificationsDemo.placeholderTitle"),
      message: body.trim() || t("adminNotificationsDemo.placeholderBody"),
    };
  }, [
    audience,
    body,
    kindLabel,
    scheduleMode,
    scheduledAtLocal,
    selectedUserIds.length,
    t,
    title,
  ]);

  const submitCampaign = async () => {
    setSubmitLoading(true);
    try {
      const payload = buildPayload();
      await createAdminNotificationCampaign(payload);
      toast.success(
        scheduleMode === "scheduled" && scheduledAtLocal
          ? t("adminNotificationsDemo.toastCampaignScheduled")
          : t("adminNotificationsDemo.toastCampaignSent"),
      );
      setConfirmOpen(false);
      await loadCampaigns();
    } catch (e) {
      toast.error(t("adminNotificationsDemo.toastCampaignError"), {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelCampaign = async (id) => {
    setCancelId(id);
    try {
      await cancelAdminNotificationCampaign(id);
      toast.success(t("adminNotificationsDemo.toastCampaignCancelled"));
      await loadCampaigns();
    } catch (e) {
      toast.error(t("adminNotificationsDemo.toastCancelError"), {
        description: getAxiosErrorMessage(e),
      });
    } finally {
      setCancelId(null);
    }
  };

  const previewRow = (isRead) => (
    <div
      className={`admin-notif-demo__notif notif-item notif-item--${notifModifier}${
        isRead
          ? " notif-item--read admin-notif-demo__notif--read"
          : " notif-item--unread"
      }`}
    >
      <div className="admin-notif-demo__notif-body notif-item__body">
        <div className="admin-notif-demo__notif-row notif-item__row">
          {!isRead ? (
            <span className="admin-notif-demo__dot" aria-hidden />
          ) : null}
          <div className="admin-notif-demo__notif-content notif-item__content">
            <span className="admin-notif-demo__notif-title notif-item__title">
              {title.trim() || t("adminNotificationsDemo.placeholderTitle")}
            </span>
            <span className="admin-notif-demo__notif-message notif-item__message">
              {body.trim() || t("adminNotificationsDemo.placeholderBody")}
            </span>
            {linkUrl.trim() ? (
              <span className="admin-notif-demo__notif-cta">
                {linkLabel.trim() || linkUrl.trim()}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="admin-notif-demo__notif-meta notif-item__meta">
        {!isRead ? (
          <span className="admin-notif-demo__notif-pill notif-item__pill">
            {t("notificationsPage.unreadLabel")}
          </span>
        ) : null}
        <span className="admin-notif-demo__notif-time notif-item__time">
          {previewTime}
        </span>
      </div>
    </div>
  );

  return (
    <div className="admin-stub-main admin-notif-demo">
      <h1 className="admin-notif-demo__title">
        {t("adminNotificationsDemo.title")}
      </h1>
      <p className="admin-notif-demo__lead">
        {t("adminNotificationsDemo.leadFull")}
      </p>

      <div className="admin-notif-demo__banner admin-notif-demo__banner--row">
        <div>
          <strong>{t("adminNotificationsDemo.bannerApiTitle")}</strong>
        </div>
        <span
          className={`admin-notif-demo__socket-pill${
            connected ? " admin-notif-demo__socket-pill--on" : ""
          }`}
        >
          {connected
            ? t("adminNotificationsDemo.socketConnected")
            : t("adminNotificationsDemo.socketDisconnected")}
        </span>
      </div>

      <div className="admin-notif-demo__grid">
        <div>
          <h2 className="admin-notif-demo__panel-title">
            {t("adminNotificationsDemo.sectionForm")}
          </h2>
          <form
            className="admin-notif-demo__form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="admin-notif-demo__field">
              <label htmlFor="notif-demo-kind">
                {t("adminNotificationsDemo.fieldKind")}
              </label>
              <select
                id="notif-demo-kind"
                value={kind}
                onChange={(e) => {
                  const next = e.target.value;
                  setKind(next);
                  setTitle(defaultTitle(t, next));
                  setBody(defaultBody(t, next));
                }}
              >
                {KIND_VALUES.map((k) => (
                  <option key={k} value={k}>
                    {t(`adminNotificationsDemo.kind.${k}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-notif-demo__field">
              <label>{t("adminNotificationsDemo.sectionRecipients")}</label>
              <div className="admin-notif-demo__segmented">
                <button
                  type="button"
                  className={`admin-notif-demo__seg-btn${
                    audience === "all"
                      ? " admin-notif-demo__seg-btn--active"
                      : ""
                  }`}
                  onClick={() => setAudience("all")}
                >
                  {t("adminNotificationsDemo.audienceAll")}
                </button>
                <button
                  type="button"
                  className={`admin-notif-demo__seg-btn${
                    audience === "selected"
                      ? " admin-notif-demo__seg-btn--active"
                      : ""
                  }`}
                  onClick={() => setAudience("selected")}
                >
                  {t("adminNotificationsDemo.audienceSelected")}
                  {audience === "selected" && selectedUserIds.length > 0
                    ? ` (${selectedUserIds.length})`
                    : ""}
                </button>
              </div>
              {audience === "selected" ? (
                <button
                  type="button"
                  className="admin-notif-demo__linkish"
                  onClick={() => setPickerOpen(true)}
                >
                  {t("adminNotificationsDemo.btnChooseRecipients")}
                </button>
              ) : null}
            </div>

            <div className="admin-notif-demo__field">
              <label>{t("adminNotificationsDemo.sectionSchedule")}</label>
              <div className="admin-notif-demo__segmented">
                <button
                  type="button"
                  className={`admin-notif-demo__seg-btn${
                    scheduleMode === "immediate"
                      ? " admin-notif-demo__seg-btn--active"
                      : ""
                  }`}
                  onClick={() => setScheduleMode("immediate")}
                >
                  {t("adminNotificationsDemo.scheduleImmediate")}
                </button>
                <button
                  type="button"
                  className={`admin-notif-demo__seg-btn${
                    scheduleMode === "scheduled"
                      ? " admin-notif-demo__seg-btn--active"
                      : ""
                  }`}
                  onClick={() => setScheduleMode("scheduled")}
                >
                  {t("adminNotificationsDemo.scheduleLater")}
                </button>
              </div>
              {scheduleMode === "scheduled" ? (
                <input
                  type="datetime-local"
                  className="admin-notif-demo__datetime"
                  value={scheduledAtLocal}
                  onChange={(e) => setScheduledAtLocal(e.target.value)}
                />
              ) : null}
            </div>

            <div className="admin-notif-demo__field">
              <label htmlFor="notif-demo-title">
                {t("adminNotificationsDemo.fieldTitle")}
              </label>
              <input
                id="notif-demo-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="admin-notif-demo__field">
              <label htmlFor="notif-demo-body">
                {t("adminNotificationsDemo.fieldBody")}
              </label>
              <textarea
                id="notif-demo-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="admin-notif-demo__field">
              <label htmlFor="notif-demo-link-url">
                {t("adminNotificationsDemo.fieldLinkUrl")}
              </label>
              <input
                id="notif-demo-link-url"
                type="url"
                inputMode="url"
                placeholder="https://"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="admin-notif-demo__field">
              <label htmlFor="notif-demo-link-label">
                {t("adminNotificationsDemo.fieldLinkLabel")}
              </label>
              <input
                id="notif-demo-link-label"
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                autoComplete="off"
              />
              <p className="admin-notif-demo__field-hint">
                {t("adminNotificationsDemo.hintLink")}
              </p>
            </div>

            <div className="admin-notif-demo__actions">
              <button
                type="button"
                className="admin-notif-demo__btn admin-notif-demo__btn--primary"
                onClick={fillSample}
              >
                {t("adminNotificationsDemo.btnFillSample")}
              </button>
              <button
                type="button"
                className="admin-notif-demo__btn"
                onClick={resetAll}
              >
                {t("adminNotificationsDemo.btnReset")}
              </button>
              <button
                type="button"
                className="admin-notif-demo__btn admin-notif-demo__btn--primary"
                style={{ marginLeft: "auto" }}
                onClick={openConfirm}
              >
                {t("adminNotificationsDemo.btnReviewSend")}
              </button>
            </div>
          </form>

          <h2
            className="admin-notif-demo__panel-title"
            style={{ marginTop: 28 }}
          >
            {t("adminNotificationsDemo.sectionCampaigns")}
          </h2>
          <div className="admin-notif-demo__campaign-toolbar">
            <button
              type="button"
              className="admin-notif-demo__btn"
              disabled={campaignsLoading}
              onClick={() => void loadCampaigns()}
            >
              {t("adminNotificationsDemo.campaignsRefresh")}
            </button>
          </div>
          <div className="admin-notif-demo__campaign-table-wrap">
            {campaignsLoading ? (
              <p className="admin-notif-demo__field-hint">
                {t("adminNotificationsDemo.campaignsLoading")}
              </p>
            ) : campaigns.length === 0 ? (
              <p className="admin-notif-demo__field-hint">
                {t("adminNotificationsDemo.campaignsEmpty")}
              </p>
            ) : (
              <table className="admin-notif-demo__campaign-table">
                <thead>
                  <tr>
                    <th>{t("adminNotificationsDemo.colCreated")}</th>
                    <th>{t("adminNotificationsDemo.colTitle")}</th>
                    <th>{t("adminNotificationsDemo.colStatus")}</th>
                    <th>{t("adminNotificationsDemo.colRecipients")}</th>
                    <th>{t("adminNotificationsDemo.colScheduled")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c._id}>
                      <td>{formatLocal(c.createdAt)}</td>
                      <td>{c.title}</td>
                      <td>
                        {t(`adminNotificationsDemo.campaignStatus.${c.status}`)}
                      </td>
                      <td>{c.recipientCount ?? "—"}</td>
                      <td>
                        {c.scheduledAt ? formatLocal(c.scheduledAt) : "—"}
                      </td>
                      <td>
                        {c.status === "scheduled" ? (
                          <button
                            type="button"
                            className="admin-notif-demo__btn admin-notif-demo__btn--small"
                            disabled={cancelId === c._id}
                            onClick={() => void handleCancelCampaign(c._id)}
                          >
                            {t("adminNotificationsDemo.cancelCampaign")}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="admin-notif-demo__panel-title">
            {t("adminNotificationsDemo.sectionPreview")}
          </h2>
          <div className="admin-notif-demo__preview-stack">
            <label className="admin-notif-demo__toggle">
              <input
                type="checkbox"
                checked={previewUnread}
                onChange={(e) => setPreviewUnread(e.target.checked)}
              />
              {t("adminNotificationsDemo.previewUnreadToggle")}
            </label>

            <div className="admin-notif-demo__preview-block">
              <span className="admin-notif-demo__kind-tag">{kindLabel}</span>
              <h3>{t("adminNotificationsDemo.previewDropdown")}</h3>
              <p className="admin-notif-demo__preview-note">
                {t("adminNotificationsDemo.previewNote")}
              </p>
              <div className="admin-notif-demo__dropdown-frame">
                {previewRow(!previewUnread)}
              </div>
            </div>

            <div className="admin-notif-demo__preview-block">
              <h3>{t("adminNotificationsDemo.previewPage")}</h3>
              <div className="admin-notif-demo__page-frame">
                <ul className="notif-item-list notif-item-list--page">
                  <li>{previewRow(!previewUnread)}</li>
                  <li>{previewRow(true)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipientPickerModal
        open={pickerOpen}
        selectedIds={selectedUserIds}
        onClose={() => setPickerOpen(false)}
        onApply={(ids) => {
          setSelectedUserIds(ids);
          setAudience("selected");
        }}
      />

      <ConfirmCampaignModal
        open={confirmOpen}
        loading={submitLoading}
        summary={confirmSummary}
        onClose={() => !submitLoading && setConfirmOpen(false)}
        onConfirm={() => void submitCampaign()}
      />
    </div>
  );
}
