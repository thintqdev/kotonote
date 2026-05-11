/** @param {Date} date @param {(k: string, o?: object) => string} t i18n t */
export function formatTimeAgo(date, t) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return t("time.justNow");
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return t("time.minutesAgo", { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("time.hoursAgo", { count: hours });
  }

  const days = Math.floor(hours / 24);
  return t("time.daysAgo", { count: days });
}
