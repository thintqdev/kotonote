import PropTypes from "prop-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import StreakFlameIcon from "./StreakFlameIcon.jsx";

const WEEK_FALLBACK = ["?", "?", "?", "?", "?", "?", "?"];

function StreakWeekGrid({
  weekDates,
  todayStr,
  checkInSet,
  onTodayCheckIn,
  checkingIn,
  user,
  compact = false,
}) {
  const { t, i18n } = useTranslation();
  const weekShort = useMemo(() => {
    const arr = t("streak.weekDays", { returnObjects: true });
    return Array.isArray(arr) ? arr : WEEK_FALLBACK;
  }, [t, i18n.language]);

  const gridClass = compact
    ? "streak-week streak-week--compact"
    : "streak-week";

  return (
    <div
      className={gridClass}
      role="group"
      aria-label={t("streak.weekAria")}
    >
      {weekShort.map((label, i) => {
        const dateStr = weekDates[i];
        const isToday = dateStr === todayStr;
        const didCheck = checkInSet.has(dateStr);

        let flameMod = "streak-day-flame--off";
        if (didCheck) {
          flameMod = isToday
            ? "streak-day-flame--lit"
            : "streak-day-flame--lit-done";
        } else if (isToday) {
          flameMod = "streak-day-flame--idle";
        }

        const cellClass = [
          "streak-day",
          compact && "streak-day--compact",
          isToday ? "streak-day--today" : "streak-day--weekday",
          didCheck && "streak-day--checked",
          isToday && didCheck && "streak-day--today-checked",
        ]
          .filter(Boolean)
          .join(" ");

        if (isToday) {
          return (
            <button
              key={`${label}-${dateStr}`}
              type="button"
              className={cellClass}
              onClick={() => void onTodayCheckIn()}
              disabled={!user || checkingIn}
              aria-pressed={didCheck}
              aria-busy={checkingIn}
              title={
                didCheck ? t("streak.checkedToday") : t("streak.tapToCheck")
              }
            >
              <span className="streak-day-icon-slot" aria-hidden>
                <StreakFlameIcon
                  className={`streak-day-flame ${flameMod}`}
                />
              </span>
              <span className="streak-day-label">{label}</span>
            </button>
          );
        }

        return (
          <div
            key={`${label}-${dateStr}`}
            className={cellClass}
            aria-hidden="true"
          >
            <span className="streak-day-icon-slot" aria-hidden>
              <StreakFlameIcon className={`streak-day-flame ${flameMod}`} />
            </span>
            <span className="streak-day-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

StreakWeekGrid.propTypes = {
  weekDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  todayStr: PropTypes.string.isRequired,
  checkInSet: PropTypes.instanceOf(Set).isRequired,
  onTodayCheckIn: PropTypes.func.isRequired,
  checkingIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
  compact: PropTypes.bool,
};

export default StreakWeekGrid;
