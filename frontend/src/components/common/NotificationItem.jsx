import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { formatTimeAgo } from "../../utils/formatTimeAgo.js";
import "./NotificationItem.css";

/**
 * Một dòng thông báo — dùng chung dropdown header và trang /notifications.
 * @param {{ id: string, type: string, titleKey: string, messageKey: string, timestamp: Date, read?: boolean }} notif
 */
function NotificationItem({ notif, unreadLabel, onClick }) {
  const { t } = useTranslation();
  const unread = !notif.read;

  const ariaLabel = unread
    ? `${t(notif.titleKey)} — ${unreadLabel}`
    : t(notif.titleKey);

  return (
    <button
      type="button"
      className={`notif-item notif-item--${notif.type}${
        unread ? " notif-item--unread" : " notif-item--read"
      }`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className="notif-item__body">
        <span className="notif-item__row">
          {unread ? (
            <span className="notif-item__dot" aria-hidden />
          ) : null}
          <span className="notif-item__content">
            <span className="notif-item__title">{t(notif.titleKey)}</span>
            <span className="notif-item__message">{t(notif.messageKey)}</span>
          </span>
        </span>
      </span>
      <span className="notif-item__meta">
        {unread ? (
          <span className="notif-item__pill">{unreadLabel}</span>
        ) : null}
        <span className="notif-item__time">
          {formatTimeAgo(notif.timestamp, t)}
        </span>
      </span>
    </button>
  );
}

NotificationItem.propTypes = {
  notif: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    titleKey: PropTypes.string.isRequired,
    messageKey: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    read: PropTypes.bool,
  }).isRequired,
  unreadLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default NotificationItem;
