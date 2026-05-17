import { useState, useCallback, useMemo, useId, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.jsx";
import {
  checkInStreak,
  getMyStreak,
  mapStreakToCardState,
} from "../../services/streakService.js";
import "./StreakCard.css";

const WEEK_FALLBACK = ["?", "?", "?", "?", "?", "?", "?"];

/** Lửa streak — gradient id duy nhất (useId) */
function StreakFlameIcon({ className = "" }) {
  const uid = useId().replace(/:/g, "");
  const gOuter = `streak-flame-outer-${uid}`;
  const gInner = `streak-flame-inner-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 32 40"
      width="18"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gOuter}
          x1="16"
          y1="38"
          x2="16"
          y2="2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#b84a32" />
          <stop offset="0.28" stopColor="#d4743a" />
          <stop offset="0.55" stopColor="#e8a050" />
          <stop offset="0.8" stopColor="#f2c878" />
          <stop offset="1" stopColor="#fff2c8" />
        </linearGradient>
        <radialGradient
          id={gInner}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16 24) rotate(90) scale(12 10)"
        >
          <stop stopColor="#fffef0" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffe870" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffb030" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        fill={`url(#${gOuter})`}
        d="M16 1.5c.9 1.8 1.2 3.3 1.7 5 .6 2.2 1.3 4.1 2.4 6.2 1.8 3.5 3.6 7.2 4.4 11.2.6 3.2.3 6.5-1.4 9.2C21.3 36 19 37.6 16 38c-3-.4-5.3-2-6.1-4.9-1.7-2.7-2-6-1.4-9.2.8-4 2.6-7.7 4.4-11.2 1.1-2.1 1.8-4 2.4-6.2.5-1.7.8-3.2 1.7-5z"
      />
      <path
        fill={`url(#${gInner})`}
        d="M16 16.5c.6 1.4 1.2 2.8 1.5 4.3.4 1.8.5 3.7-.2 5.5-.8 2-2.7 3.5-3.3 3.6-.6-.1-2.5-1.6-3.3-3.6-.7-1.8-.6-3.7-.2-5.5.3-1.5.9-2.9 1.5-4.3z"
      />
      <path
        fill={`url(#${gOuter})`}
        opacity="0.85"
        d="M12 10c.5 1.2.2 2.6-.2 3.8-.6 2-1 4.2 0 6.2.5 1 1.3 1.9 2.2 2.6-.8-2.5-.3-5.2.3-7.6.3-1.4.5-2.9-.3-4z"
      />
      <path
        fill={`url(#${gOuter})`}
        opacity="0.75"
        d="M21 11.5c-.4 1.5-.2 3.1.2 4.5.4 1.6.9 3.5.2 5.2-.5 1.2-1.4 2.2-2.4 3 .3-1.8 0-3.6-.4-5.4-.3-1.8-.5-3.8.2-5.6.4-1 .9-2 1.2-3.1z"
      />
    </svg>
  );
}

StreakFlameIcon.propTypes = {
  className: PropTypes.string,
};

/** Ngày local YYYY-MM-DD (tránh lệch UTC) */
function isoDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Thứ Hai 0:00 local của tuần chứa `base` */
function startOfWeekMonday(base) {
  const x = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const mondayOffset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - mondayOffset);
  return x;
}

/** 7 ngày tuần hiện tại (Thứ Hai → CN), YYYY-MM-DD local */
function weekIsoDatesLocal(base = new Date()) {
  const mon = startOfWeekMonday(base);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const t = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    dates.push(isoDateLocal(t));
  }
  return dates;
}

const StreakCard = ({ days = 0 }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const weekShort = useMemo(() => {
    const arr = t("streak.weekDays", { returnObjects: true });
    return Array.isArray(arr) ? arr : WEEK_FALLBACK;
  }, [t, i18n.language]);

  const todayStr = isoDateLocal(new Date());
  const weekDates = weekIsoDatesLocal(new Date());

  const [streak, setStreak] = useState(() => ({
    count: days,
    checkIns: [],
  }));
  const [loading, setLoading] = useState(Boolean(user));
  const [checkingIn, setCheckingIn] = useState(false);

  const refreshStreak = useCallback(async () => {
    const data = await getMyStreak();
    setStreak(mapStreakToCardState(data, days));
  }, [days]);

  useEffect(() => {
    if (!user) {
      setStreak({ count: days, checkIns: [] });
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMyStreak();
        if (!cancelled) {
          setStreak(mapStreakToCardState(data, days));
        }
      } catch {
        if (!cancelled) {
          setStreak({ count: days, checkIns: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, days]);

  const checkInSet = useMemo(() => new Set(streak.checkIns), [streak.checkIns]);

  const checkedToday = checkInSet.has(todayStr);

  const onTodayCheckIn = useCallback(async () => {
    if (!user || checkedToday || checkingIn) return;

    setCheckingIn(true);
    try {
      const result = await checkInStreak();
      if (typeof result.currentStreak === "number") {
        setStreak((prev) => ({
          count: result.currentStreak,
          checkIns: prev.checkIns.includes(todayStr)
            ? prev.checkIns
            : [...prev.checkIns, todayStr].sort(),
        }));
      }
      await refreshStreak();
    } catch (err) {
      if (/** @type {{ messageCode?: string }} */ (err).messageCode === "MSG_502") {
        await refreshStreak();
        return;
      }
      try {
        await refreshStreak();
      } catch {
        /* giữ state hiện tại */
      }
    } finally {
      setCheckingIn(false);
    }
  }, [user, checkedToday, checkingIn, todayStr, refreshStreak]);

  const displayCount = loading ? days : streak.count;

  return (
    <div
      className={`streak-card${loading ? " streak-card--loading" : ""}`}
      aria-busy={loading || checkingIn}
    >
      <img
        className="streak-card-pin"
        src="/assets/decorates/pin2.png"
        alt=""
        width="80"
        height="80"
        decoding="async"
      />
      <div className="streak-card-body">
        <p className="streak-card-headline">{t("streak.headline")}</p>

        <div className="streak-card-num-wrap">
          <span className="streak-card-num" aria-live="polite">
            {displayCount}
          </span>
        </div>

        <p className="streak-card-subline">{t("streak.subline")}</p>

        <div
          className="streak-week"
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
      </div>
    </div>
  );
};

StreakCard.propTypes = {
  days: PropTypes.number,
};

export default StreakCard;
