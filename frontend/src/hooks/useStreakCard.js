import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "./useAuth.jsx";
import {
  checkInStreak,
  getMyStreak,
  mapStreakToCardState,
} from "../services/streakService.js";

/** Ngày local YYYY-MM-DD */
export function isoDateLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(base) {
  const x = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const mondayOffset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - mondayOffset);
  return x;
}

/** 7 ngày tuần hiện tại (Thứ Hai → CN), YYYY-MM-DD local */
export function weekIsoDatesLocal(base = new Date()) {
  const mon = startOfWeekMonday(base);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const t = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    dates.push(isoDateLocal(t));
  }
  return dates;
}

/**
 * State streak + check-in (dùng chung header / sidebar).
 * @param {number} [daysFallback]
 */
export function useStreakCard(daysFallback = 0) {
  const { user } = useAuth();
  const todayStr = isoDateLocal(new Date());
  const weekDates = weekIsoDatesLocal(new Date());

  const [streak, setStreak] = useState(() => ({
    count: daysFallback,
    checkIns: [],
  }));
  const [loading, setLoading] = useState(Boolean(user));
  const [checkingIn, setCheckingIn] = useState(false);

  const refreshStreak = useCallback(async () => {
    const data = await getMyStreak();
    setStreak(mapStreakToCardState(data, daysFallback));
  }, [daysFallback]);

  useEffect(() => {
    if (!user) {
      setStreak({ count: daysFallback, checkIns: [] });
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMyStreak();
        if (!cancelled) {
          setStreak(mapStreakToCardState(data, daysFallback));
        }
      } catch {
        if (!cancelled) {
          setStreak({ count: daysFallback, checkIns: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, daysFallback]);

  const checkInSet = useMemo(() => new Set(streak.checkIns), [streak.checkIns]);
  const checkedToday = checkInSet.has(todayStr);
  const displayCount = loading ? daysFallback : streak.count;

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

  return {
    user,
    todayStr,
    weekDates,
    checkInSet,
    checkedToday,
    displayCount,
    loading,
    checkingIn,
    onTodayCheckIn,
  };
}
