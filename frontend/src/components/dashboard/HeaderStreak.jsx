import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useStreakCard } from "../../hooks/useStreakCard.js";
import StreakFlameIcon from "./StreakFlameIcon.jsx";
import StreakWeekGrid from "./StreakWeekGrid.jsx";
import "./StreakCard.css";
import "./HeaderStreak.css";

function IconChevron({ open }) {
  return (
    <svg
      className={`header-streak-chevron${open ? " header-streak-chevron--open" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

IconChevron.propTypes = {
  open: PropTypes.bool.isRequired,
};

function HeaderStreak({ days = 0 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const {
    user,
    todayStr,
    weekDates,
    checkInSet,
    checkedToday,
    displayCount,
    loading,
    checkingIn,
    onTodayCheckIn,
  } = useStreakCard(days);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(/** @type {Node} */ (event.target))
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const litThisWeek = weekDates.filter((d) => checkInSet.has(d)).length;

  return (
    <div
      ref={wrapRef}
      className={`header-streak${open ? " header-streak--open" : ""}${
        loading ? " header-streak--loading" : ""
      }`}
    >
      <button
        type="button"
        className="header-streak-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="header-streak-panel"
        onClick={() => setOpen((o) => !o)}
        title={t("streak.headerToggle")}
      >
        <span className="header-streak-flame-wrap" aria-hidden>
          <StreakFlameIcon size="lg" className="header-streak-flame" />
        </span>
        <span className="header-streak-text">
          <span className="header-streak-count-row">
            <span className="header-streak-count" aria-live="polite">
              {displayCount}
            </span>
          </span>
        </span>
        <span className="header-streak-mini" aria-hidden>
          {weekDates.map((dateStr) => {
            const didCheck = checkInSet.has(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <span
                key={dateStr}
                className={[
                  "header-streak-dot",
                  didCheck && "header-streak-dot--lit",
                  isToday && "header-streak-dot--today",
                  isToday && !didCheck && "header-streak-dot--idle",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </span>
        <IconChevron open={open} />
      </button>

      {open ? (
        <div
          id="header-streak-panel"
          className="header-streak-panel"
          role="dialog"
          aria-label={t("streak.headline")}
        >
          <div className="header-streak-panel-head">
            <p className="header-streak-panel-title">{t("streak.headline")}</p>
            <p className="header-streak-panel-meta">
              {t("streak.headerWeekLit", { count: litThisWeek })}
            </p>
          </div>
          <div className="header-streak-panel-hero">
            <span className="header-streak-panel-num" aria-live="polite">
              {displayCount}
            </span>
            <span className="header-streak-panel-sub">
              {t("streak.subline")}
            </span>
          </div>
          {!checkedToday && user ? (
            <p className="header-streak-panel-hint">{t("streak.tapToCheck")}</p>
          ) : null}
          {checkedToday ? (
            <p className="header-streak-panel-hint header-streak-panel-hint--done">
              {t("streak.checkedToday")}
            </p>
          ) : null}
          <StreakWeekGrid
            weekDates={weekDates}
            todayStr={todayStr}
            checkInSet={checkInSet}
            onTodayCheckIn={onTodayCheckIn}
            checkingIn={checkingIn}
            user={user}
            compact
          />
        </div>
      ) : null}
    </div>
  );
}

HeaderStreak.propTypes = {
  days: PropTypes.number,
};

export default HeaderStreak;
