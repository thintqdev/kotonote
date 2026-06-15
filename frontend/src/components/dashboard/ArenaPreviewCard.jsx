import { memo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ArenaPreviewCard.css";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function formatWeekdays(weekdays, t) {
  const list = (weekdays ?? [6])
    .slice()
    .sort((a, b) => a - b)
    .map((d) => t(`arenaPage.weekday.${WEEKDAY_KEYS[d] ?? "sat"}`));
  return list.join(", ");
}

function ArenaPreviewCard({ arena, loading, error }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "ja";

  const settings = arena?.settings;
  const window = arena?.window;
  const title =
    lang.startsWith("vi")
      ? settings?.titleVi || t("arenaPage.title")
      : settings?.titleJa || t("arenaPage.title");

  const scheduleDays = formatWeekdays(settings?.weekdays, t);
  const scheduleTime = t("arenaPage.schedule", {
    start: settings?.startTime ?? "20:00",
    end: settings?.endTime ?? "24:00",
    tz: settings?.timezone ?? "Asia/Ho_Chi_Minh",
  });

  let statusKey = "upcoming";
  let statusLabel = t("dashboard.arenaPreview.statusUpcoming");
  if (!settings?.enabled) {
    statusKey = "off";
    statusLabel = t("dashboard.arenaPreview.statusOff");
  } else if (window?.isOpen) {
    statusKey = "live";
    statusLabel = t("dashboard.arenaPreview.statusLive");
  } else if (arena?.isReminderSoon) {
    statusKey = "soon";
    statusLabel = t("dashboard.arenaPreview.statusSoon", {
      minutes: arena?.minutesUntilOpen ?? settings?.reminderMinutesBefore ?? 30,
    });
  } else if (window?.isScheduledDay && arena?.minutesUntilOpen != null) {
    statusKey = "today";
    statusLabel = t("dashboard.arenaPreview.statusToday", {
      minutes: arena.minutesUntilOpen,
    });
  } else if (arena?.nextSession) {
    statusKey = "next";
    const dayLabel = t(
      `arenaPage.weekday.${WEEKDAY_KEYS[arena.nextSession.weekday] ?? "sat"}`,
    );
    statusLabel = t("dashboard.arenaPreview.statusNext", {
      day: dayLabel,
      start: arena.nextSession.startTime,
    });
  }

  const played = arena?.myAttempt?.status === "submitted";
  const top = arena?.leaderboard?.[0];

  return (
    <section className="dash-arena-preview" aria-labelledby="dash-arena-preview-title">
      <div className="dash-arena-preview-head">
        <div>
          <h2 id="dash-arena-preview-title" className="dash-arena-preview-title">
            {title}
          </h2>
          <p className="dash-arena-preview-sub">
            {t("dashboard.arenaPreview.subtitle", { days: scheduleDays })}
          </p>
        </div>
        <Link className="dash-arena-preview-link" to="/arena">
          {window?.isOpen ? t("dashboard.arenaPreview.enter") : t("dashboard.arenaPreview.view")}
        </Link>
      </div>

      {error ? (
        <p className="dash-arena-preview-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className={`dash-arena-preview-badge dash-arena-preview-badge--${statusKey}`}>
        {loading ? t("common.loading") : statusLabel}
      </div>

      <p className="dash-arena-preview-meta">{scheduleTime}</p>

      {played ? (
        <p className="dash-arena-preview-meta">
          {t("dashboard.arenaPreview.played", {
            score: arena.myAttempt.score,
            rank: arena.myRank?.rank ?? "—",
          })}
        </p>
      ) : null}

      {top ? (
        <p className="dash-arena-preview-meta">
          {t("dashboard.arenaPreview.leader", {
            name: top.name,
            score: top.score,
          })}
        </p>
      ) : (
        <p className="dash-arena-preview-meta">{t("dashboard.arenaPreview.noLeader")}</p>
      )}
    </section>
  );
}

ArenaPreviewCard.propTypes = {
  arena: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default memo(ArenaPreviewCard);
