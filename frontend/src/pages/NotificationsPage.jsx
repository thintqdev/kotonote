import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import { useUserNotifications } from "../context/UserNotificationContext.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import { mockStreak } from "../data/dashboardHomeMock.js";
import { fetchNotifications } from "../services/userNotificationService.js";
import { mapNotificationToUi } from "../utils/mapUserNotification.js";
import NotificationItem from "../components/common/NotificationItem.jsx";
import "./AuthPage.css";
import "./Profile.css";
import "./DashboardHome.css";
import "./NotificationsPage.css";

const LIST_LIMIT = 50;

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { markOneRead, inboxVersion } = useUserNotifications();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadList = useCallback(async () => {
    if (!user) {
      setItems([]);
      setListLoading(false);
      return;
    }
    setListLoading(true);
    try {
      const { notifications } = await fetchNotifications({
        limit: LIST_LIMIT,
        skip: 0,
      });
      const raw = Array.isArray(notifications) ? notifications : [];
      setItems(raw.map(mapNotificationToUi).filter(Boolean));
    } catch {
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadList();
  }, [loadList, inboxVersion]);

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const unreadCount = useMemo(
    () => items.filter((x) => !x.read).length,
    [items],
  );

  const visibleItems = useMemo(() => {
    if (filter === "unread") {
      return items.filter((x) => !x.read);
    }
    return items;
  }, [items, filter]);

  const handleRowClick = useCallback(
    async (id, read) => {
      if (!read) {
        await markOneRead(id);
        setItems((prev) =>
          prev.map((row) => (row.id === id ? { ...row, read: true } : row)),
        );
      }
    },
    [markOneRead],
  );

  return (
    <Layout
      userName={headerName}
      footerQuote={t("dashboard.quotes.footer")}
      streakDays={mockStreak.days}
      mainInnerClassName="profile-main notifications-page"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.notifications") },
        ]}
      />

      <div className="notifications-page-shell profile-card profile-card--hero">
        <span className="profile-card-tape" aria-hidden />
        <div className="notifications-page-header-row">
          <div className="notifications-page-heading-block">
            <h1 className="notifications-page-title profile-section-title">
              {t("notificationsPage.title")}
            </h1>
            <p className="notifications-page-lead">
              {t("notificationsPage.subtitle")}
            </p>
          </div>
          <div
            className="notifications-page-filters"
            role="tablist"
            aria-label={t("notificationsPage.filterAria")}
          >
            <button
              type="button"
              role="tab"
              id="notif-tab-all"
              aria-selected={filter === "all"}
              aria-controls="notif-panel"
              className={`notifications-page-filter-btn${
                filter === "all" ? " notifications-page-filter-btn--active" : ""
              }`}
              onClick={() => setFilter("all")}
            >
              {t("notificationsPage.filterAll")}
            </button>
            <button
              type="button"
              role="tab"
              id="notif-tab-unread"
              aria-selected={filter === "unread"}
              aria-controls="notif-panel"
              className={`notifications-page-filter-btn${
                filter === "unread"
                  ? " notifications-page-filter-btn--active"
                  : ""
              }`}
              onClick={() => setFilter("unread")}
            >
              <span>{t("notificationsPage.filterUnread")}</span>
              {unreadCount > 0 ? (
                <span className="notifications-page-unread-chip">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div
          id="notif-panel"
          role="tabpanel"
          aria-labelledby={
            filter === "unread" ? "notif-tab-unread" : "notif-tab-all"
          }
          className="notifications-page-panel"
        >
          {listLoading ? (
            <div className="notifications-page-empty">
              <p className="notifications-page-empty-text">
                {t("common.loading")}
              </p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="notifications-page-empty">
              <p className="notifications-page-empty-text">
                {filter === "unread"
                  ? t("notificationsPage.emptyUnread")
                  : t("header.noNotifications")}
              </p>
            </div>
          ) : (
            <ul className="notif-item-list notif-item-list--page">
              {visibleItems.map((notif) => (
                <li key={notif.id}>
                  <NotificationItem
                    notif={notif}
                    unreadLabel={t("notificationsPage.unreadLabel")}
                    onClick={() => handleRowClick(notif.id, notif.read)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
