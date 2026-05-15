import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotificationItem from "./NotificationItem.jsx";
import "./NotificationDropdown.css";

function NotificationDropdown({
  isOpen,
  notifications,
  onClose,
  onSelectNotification,
  viewAllTo = "/notifications",
}) {
  const { t } = useTranslation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadLabel = t("notificationsPage.unreadLabel");

  return (
    <div className="dash-notification-dropdown" ref={dropdownRef}>
      <div className="dash-notification-header">
        <h3 className="dash-notification-title">
          {t("header.notificationsTitle")}
        </h3>
      </div>
      <div className="dash-notification-list">
        {notifications.length === 0 ? (
          <div className="dash-notification-empty">
            <p>{t("header.noNotifications")}</p>
          </div>
        ) : (
          <ul className="notif-item-list notif-item-list--dropdown">
            {notifications.map((notif) => (
              <li key={notif.id}>
                <NotificationItem
                  notif={notif}
                  unreadLabel={unreadLabel}
                  onClick={() => {
                    onSelectNotification?.(notif);
                    onClose();
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="dash-notification-footer">
        <Link
          className="dash-notification-view-all"
          to={viewAllTo}
          onClick={onClose}
        >
          {t("header.viewAllNotifications")}
        </Link>
      </div>
    </div>
  );
}

NotificationDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.instanceOf(Date).isRequired,
      read: PropTypes.bool,
      actionType: PropTypes.string,
      actionData: PropTypes.object,
    }),
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectNotification: PropTypes.func,
  viewAllTo: PropTypes.string,
};

export default NotificationDropdown;
