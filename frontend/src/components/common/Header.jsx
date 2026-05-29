import { useMemo, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { getNavigationTargetFromNotification } from "../../utils/notificationNavigation.js";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useUserNotifications } from "../../context/UserNotificationContext.jsx";
import {
  isResolvableAvatar,
  resolveAvatarUrl,
} from "../../utils/resolveAvatarUrl.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import HeaderStreak from "../dashboard/HeaderStreak.jsx";
import "./Header.css";

function IconBell(props) {
  return (
    <svg
      className="dash-notify-bell-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Bell body */}
      <path
        d="M6.5 9a5.5 5.5 0 0111 0c0 1.2.3 2.3.9 3.2l.8 1.4c.3.4.1.9-.3 1.1l-1.2.5H6.3l-1.2-.5c-.4-.2-.6-.7-.3-1.1l.8-1.4c.6-.9.9-2 .9-3.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Clapper */}
      <circle cx="12" cy="20" r="1.2" fill="currentColor" opacity="0.8" />
      {/* Clapper connector */}
      <path
        d="M11.8 17.8a1.2 1.2 0 012.4 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevron(props) {
  return (
    <svg
      className="dash-topbar-svg dash-topbar-chevron"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
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

/** Hoa/decoration nhỏ — SVG đơn giản; có thể thay bằng minh họa thương hiệu */
function DecoFlower(props) {
  return (
    <svg
      className="dash-topbar-deco-flower"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="16" cy="14" r="3.8" fill="#e8c86a" fillOpacity="0.55" />
      <ellipse
        cx="16"
        cy="9"
        rx="3.5"
        ry="5"
        transform="rotate(0 16 14)"
        fill="#f5e090"
        stroke="#c4a872"
        strokeWidth="1"
        opacity="0.9"
      />
      <ellipse
        cx="22"
        cy="14"
        rx="3.5"
        ry="5"
        transform="rotate(72 16 14)"
        fill="#f5e090"
        stroke="#c4a872"
        strokeWidth="1"
        opacity="0.9"
      />
      <ellipse
        cx="19.8"
        cy="19.8"
        rx="3.5"
        ry="5"
        transform="rotate(144 16 14)"
        fill="#f5e090"
        stroke="#c4a872"
        strokeWidth="1"
        opacity="0.9"
      />
      <ellipse
        cx="12.2"
        cy="19.8"
        rx="3.5"
        ry="5"
        transform="rotate(216 16 14)"
        fill="#f5e090"
        stroke="#c4a872"
        strokeWidth="1"
        opacity="0.9"
      />
      <ellipse
        cx="10"
        cy="14"
        rx="3.5"
        ry="5"
        transform="rotate(-72 16 14)"
        fill="#f5e090"
        stroke="#c4a872"
        strokeWidth="1"
        opacity="0.9"
      />
    </svg>
  );
}

const Header = ({ userName, notificationCount, streakDays = 0 }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [avatarBroken, setAvatarBroken] = useState(false);
  const { recentNotifications, markOneRead } = useUserNotifications();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userBarRef = useRef(null);
  const notifyLabel = t("header.notifications");
  const accountLabel = t("header.account");

  const userMenuLabels = useMemo(
    () => ({
      profile: t("header.profile"),
      history: t("header.examHistory"),
      password: t("header.changePassword"),
      settings: t("header.settingsMenu"),
      feedback: t("header.feedbackMenu"),
      membership: t("header.membershipMenu"),
      logout: t("header.logout"),
    }),
    [t],
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userBarRef.current &&
        !userBarRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleUserLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate("/login");
  };

  const dateLine = useMemo(() => {
    const d = new Date();
    const locale = i18n.language === "ja" ? "ja-JP" : "vi-VN";
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(d);
    } catch {
      return "";
    }
  }, [i18n.language]);

  const initial = useMemo(() => {
    const t = String(userName || "").trim();
    const ch = t ? [...t][0] : "?";
    return typeof ch === "string" ? ch.toUpperCase() : "?";
  }, [userName]);

  useEffect(() => {
    setAvatarBroken(false);
  }, [user?._id, user?.avatar]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatar || avatarBroken || !isResolvableAvatar(user.avatar)) {
      return null;
    }
    return resolveAvatarUrl(user.avatar)?.trim() || null;
  }, [user?.avatar, avatarBroken]);

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-sheet">
        <span
          className="dash-topbar-washi dash-topbar-washi--tape1"
          aria-hidden
        />
        <span
          className="dash-topbar-washi dash-topbar-washi--tape2"
          aria-hidden
        />
        <span
          className="dash-topbar-washi dash-topbar-washi--tape3"
          aria-hidden
        />
        <DecoFlower />
        <div className="dash-topbar-body">
          <div className="dash-topbar-leading">
            <div className="dash-topbar-brand">
              <div className="dash-topbar-kicker-row">
                <span className="dash-topbar-kicker">{t("header.today")}</span>
                <span className="dash-topbar-date" suppressHydrationWarning>
                  {dateLine}
                </span>
              </div>
            </div>
            <HeaderStreak days={streakDays} />
          </div>

          <div className="dash-topbar-actions">
            <LanguageSwitcher className="dash-topbar-lang" />
            <div className="dash-notify-wrapper">
              <button
                type="button"
                className="dash-notify-btn"
                aria-label={notifyLabel}
                onClick={() => {
                  setIsNotificationOpen((o) => !o);
                  setIsUserMenuOpen(false);
                }}
                aria-expanded={isNotificationOpen}
              >
                <span className="dash-notify-btn-inner">
                  <IconBell />
                </span>
                {notificationCount > 0 && (
                  <span className="dash-notify-badge">{notificationCount}</span>
                )}
              </button>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                notifications={recentNotifications}
                onClose={() => setIsNotificationOpen(false)}
                onSelectNotification={(n) => {
                  if (!n.read) void markOneRead(n.id);
                  const to = getNavigationTargetFromNotification(n);
                  if (to) navigate(to);
                }}
              />
            </div>
            <div className="dash-user-wrapper" ref={userBarRef}>
              <button
                type="button"
                id="dash-user-menu-button"
                className={`dash-user-block${
                  isUserMenuOpen ? " dash-user-block--open" : ""
                }`}
                aria-label={accountLabel}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                aria-controls="dash-user-menu"
                onClick={() => {
                  setIsUserMenuOpen((o) => !o);
                  setIsNotificationOpen(false);
                }}
              >
                <span className="dash-user-visual" aria-hidden="true">
                  <span className="dash-user-avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="dash-user-avatar-img"
                        decoding="async"
                        onError={() => setAvatarBroken(true)}
                      />
                    ) : (
                      initial
                    )}
                  </span>
                </span>
                <span className="dash-user-name">{userName}</span>
                <IconChevron />
              </button>
              {isUserMenuOpen && (
                <div
                  id="dash-user-menu"
                  className="dash-user-dropdown"
                  role="menu"
                  aria-labelledby="dash-user-menu-button"
                >
                  <Link
                    className="dash-user-menu-item"
                    role="menuitem"
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {userMenuLabels.profile}
                  </Link>
                  <Link
                    className="dash-user-menu-item"
                    role="menuitem"
                    to="/practice/history"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {userMenuLabels.history}
                  </Link>
                  <Link
                    className="dash-user-menu-item"
                    role="menuitem"
                    to="/change-password"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {userMenuLabels.password}
                  </Link>
                  <Link
                    className="dash-user-menu-item"
                    role="menuitem"
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {userMenuLabels.settings}
                  </Link>
                  <Link
                    className="dash-user-menu-item"
                    role="menuitem"
                    to="/feedback"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {userMenuLabels.feedback}
                  </Link>
                  <Link
                    className="dash-user-menu-item"
                    role="menuitem"
                    to="/membership"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {userMenuLabels.membership}
                  </Link>
                  <div className="dash-user-menu-divider" role="separator" />
                  <button
                    type="button"
                    className="dash-user-menu-item dash-user-menu-item--danger"
                    role="menuitem"
                    onClick={handleUserLogout}
                  >
                    {userMenuLabels.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  userName: PropTypes.string.isRequired,
  notificationCount: PropTypes.number.isRequired,
  streakDays: PropTypes.number,
};

export default Header;
