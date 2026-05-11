/** @param {string} iso YYYY-MM-DD */
export function parseIsoToLocalDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** @param {Date} d */
export function localDateToIso(d) {
  if (!d || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Hiển thị ngày đẹp theo ngôn ngữ (dùng chung Profile, DateField, …).
 * @param {string} iso YYYY-MM-DD
 * @param {string} language i18n code (vi, ja, …)
 */
export function formatIsoDateLong(iso, language) {
  const d = parseIsoToLocalDate(iso);
  if (!d) return "";
  const locale = language === "ja" ? "ja-JP" : "vi-VN";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

/**
 * Số ngày lịch so với hôm nay (giờ địa phương, noon để tránh DST).
 * @param {string} iso YYYY-MM-DD
 * @returns {number | null}
 */
export function calendarDaysFromToday(iso) {
  const d = parseIsoToLocalDate(iso);
  if (!d) return null;
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0,
    0,
  );
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

/** Thứ Hai = 0 … Chủ nhật = 6 */
export function mondayWeekIndex(date) {
  return (date.getDay() + 6) % 7;
}
