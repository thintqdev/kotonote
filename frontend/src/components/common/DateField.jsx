import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  parseIsoToLocalDate,
  localDateToIso,
  formatIsoDateLong,
  mondayWeekIndex,
} from "../../utils/dateIso.js";
import "./DateField.css";

/** @param {number} y @param {number} m 0-11 */
function buildMonthCells(y, m) {
  const first = new Date(y, m, 1, 12, 0, 0, 0);
  const pad = mondayWeekIndex(first);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < pad; i += 1) {
    cells.push({ kind: "pad", key: `p-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ kind: "day", day: d, key: `d-${d}` });
  }
  const tail = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < tail; i += 1) {
    cells.push({ kind: "pad", key: `t-${i}` });
  }
  return cells;
}

function lastDayOfPrevMonth(y, m) {
  return new Date(y, m, 0, 12, 0, 0, 0);
}

function firstDayOfNextMonth(y, m) {
  return new Date(y, m + 1, 1, 12, 0, 0, 0);
}

function DateField({
  id,
  value = "",
  onChange,
  disabled = false,
  min,
  max,
  className,
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12, 0, 0, 0);
  }, []);

  const [cursor, setCursor] = useState(() => {
    const d = parseIsoToLocalDate(value);
    if (d) return { y: d.getFullYear(), m: d.getMonth() };
    return { y: today.getFullYear(), m: today.getMonth() };
  });

  const rootRef = useRef(null);

  useEffect(() => {
    const d = parseIsoToLocalDate(value);
    if (d) {
      setCursor({ y: d.getFullYear(), m: d.getMonth() });
    }
  }, [value]);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocMouseDown);
      return () => document.removeEventListener("mousedown", onDocMouseDown);
    }
  }, [open]);

  const minD = useMemo(() => (min ? parseIsoToLocalDate(min) : null), [min]);
  const maxD = useMemo(() => (max ? parseIsoToLocalDate(max) : null), [max]);

  useEffect(() => {
    setCursor((c) => {
      const lo = minD ? minD.getFullYear() : 1998;
      const hi = maxD ? maxD.getFullYear() : 2045;
      const y = Math.min(Math.max(c.y, lo), hi);
      if (y === c.y) return c;
      return { y, m: c.m };
    });
  }, [minD, maxD]);

  const canGoPrev = useMemo(() => {
    if (!minD) return true;
    const lastPrev = lastDayOfPrevMonth(cursor.y, cursor.m);
    return lastPrev.getTime() >= minD.getTime();
  }, [cursor, minD]);

  const canGoNext = useMemo(() => {
    if (!maxD) return true;
    const firstNext = firstDayOfNextMonth(cursor.y, cursor.m);
    return firstNext.getTime() <= maxD.getTime();
  }, [cursor, maxD]);

  const yearOptions = useMemo(() => {
    const lo = minD ? minD.getFullYear() : 1998;
    const hi = maxD ? maxD.getFullYear() : 2045;
    const yrs = [];
    for (let y = lo; y <= hi; y += 1) yrs.push(y);
    return yrs;
  }, [minD, maxD]);

  const locale = i18n.language === "ja" ? "ja-JP" : "vi-VN";

  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, mi) =>
      fmt.format(new Date(2000, mi, 15, 12, 0, 0, 0)),
    );
  }, [locale]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(2024, 0, 1 + i, 12, 0, 0, 0)),
    );
  }, [locale]);

  const cells = useMemo(
    () => buildMonthCells(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  );

  const labelText = value
    ? formatIsoDateLong(value, i18n.language)
    : "";

  const isDayDisabled = useCallback(
    (day) => {
      const d = new Date(cursor.y, cursor.m, day, 12, 0, 0, 0);
      const t0 = d.getTime();
      if (minD && t0 < minD.getTime()) return true;
      if (maxD && t0 > maxD.getTime()) return true;
      return false;
    },
    [cursor.y, cursor.m, minD, maxD],
  );

  const isSelected = (day) => {
    const iso = localDateToIso(
      new Date(cursor.y, cursor.m, day, 12, 0, 0, 0),
    );
    return iso === value;
  };

  const isTodayCell = (day) => {
    const d = new Date(cursor.y, cursor.m, day, 12, 0, 0, 0);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const pickDay = (day) => {
    if (isDayDisabled(day)) return;
    const iso = localDateToIso(
      new Date(cursor.y, cursor.m, day, 12, 0, 0, 0),
    );
    onChange(iso);
    setOpen(false);
  };

  const clear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange("");
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div
      ref={rootRef}
      className={`date-field${className ? ` ${className}` : ""}`}
    >
      <div className="date-field-trigger-wrap">
        <button
          type="button"
          id={id}
          className="date-field-trigger"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <span
            className={`date-field-trigger-text${
              !labelText ? " date-field-trigger-text--placeholder" : ""
            }`}
          >
            {labelText || t("dateField.placeholder")}
          </span>
          <span className="date-field-trigger-icon" aria-hidden>
            📅
          </span>
        </button>
        {value ? (
          <button
            type="button"
            className="date-field-clear--inline"
            disabled={disabled}
            onClick={clear}
            aria-label={t("dateField.clear")}
          >
            ×
          </button>
        ) : null}
      </div>

      {open && !disabled ? (
        <div
          className="date-field-panel"
          role="dialog"
          aria-label={t("dateField.dialogLabel")}
        >
          <div className="date-field-toolbar">
            <button
              type="button"
              className="date-field-nav"
              disabled={!canGoPrev}
              aria-label={t("dateField.prevMonth")}
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.y, c.m - 1, 1, 12, 0, 0, 0);
                  return { y: d.getFullYear(), m: d.getMonth() };
                })
              }
            >
              ‹
            </button>
            <div className="date-field-selects">
              <select
                className="date-field-select"
                aria-label={t("dateField.chooseMonth")}
                value={cursor.m}
                onChange={(e) =>
                  setCursor((c) => ({
                    y: c.y,
                    m: Number(e.target.value),
                  }))
                }
              >
                {monthLabels.map((name, mi) => (
                  <option key={name} value={mi}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="date-field-select"
                aria-label={t("dateField.chooseYear")}
                value={cursor.y}
                onChange={(e) =>
                  setCursor((c) => ({
                    y: Number(e.target.value),
                    m: c.m,
                  }))
                }
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="date-field-nav"
              disabled={!canGoNext}
              aria-label={t("dateField.nextMonth")}
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.y, c.m + 1, 1, 12, 0, 0, 0);
                  return { y: d.getFullYear(), m: d.getMonth() };
                })
              }
            >
              ›
            </button>
          </div>

          <div className="date-field-weekdays">
            {weekdayLabels.map((w) => (
              <div key={w} className="date-field-weekday">
                {w}
              </div>
            ))}
          </div>

          <div className="date-field-grid">
            {cells.map((cell) => {
              if (cell.kind === "pad") {
                return (
                  <div
                    key={cell.key}
                    className="date-field-cell date-field-cell--pad"
                  />
                );
              }
              const day = cell.day;
              const dis = isDayDisabled(day);
              const sel = isSelected(day);
              const tod = isTodayCell(day);
              return (
                <div key={cell.key} className="date-field-cell">
                  <button
                    type="button"
                    className={`date-field-day${
                      sel ? " date-field-day--selected" : ""
                    }${tod && !sel ? " date-field-day--today" : ""}`}
                    disabled={dis}
                    onClick={() => pickDay(day)}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="date-field-footer">
            <button
              type="button"
              className="date-field-panel-clear"
              onClick={(e) => clear(e)}
            >
              {t("dateField.clear")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

DateField.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  min: PropTypes.string,
  max: PropTypes.string,
  className: PropTypes.string,
};

export default DateField;
