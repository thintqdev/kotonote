import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth.jsx";
import { useUserNotificationSocket } from "../hooks/useUserNotificationSocket.js";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
} from "../services/userNotificationService.js";
import { mapNotificationToUi } from "../utils/mapUserNotification.js";

const UserNotificationContext = createContext(null);

const RECENT_LIMIT = 5;

export function UserNotificationProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useUserNotificationSocket(Boolean(user));
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inboxVersion, setInboxVersion] = useState(0);

  const refresh = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    if (!user) {
      setUnreadCount(0);
      setRecentNotifications([]);
      setInboxVersion(0);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [countRes, listRes] = await Promise.all([
        fetchUnreadCount(),
        fetchNotifications({ limit: RECENT_LIMIT, skip: 0 }),
      ]);
      const count = Number(countRes?.count);
      setUnreadCount(Number.isFinite(count) ? count : 0);
      const raw = Array.isArray(listRes?.notifications)
        ? listRes.notifications
        : [];
      setRecentNotifications(
        raw.map(mapNotificationToUi).filter(Boolean),
      );
    } catch {
      setUnreadCount(0);
      setRecentNotifications([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket || !user) return undefined;

    const bumpAndRefresh = () => {
      setInboxVersion((v) => v + 1);
      void refresh({ silent: true });
    };

    socket.on("notification:new", bumpAndRefresh);
    socket.on("notification:unread-count-updated", bumpAndRefresh);

    const onConnect = () => {
      void refresh({ silent: true });
    };
    socket.on("connect", onConnect);

    return () => {
      socket.off("notification:new", bumpAndRefresh);
      socket.off("notification:unread-count-updated", bumpAndRefresh);
      socket.off("connect", onConnect);
    };
  }, [socket, user, refresh]);

  const markOneRead = useCallback(
    async (id) => {
      if (!user || !id) return;
      try {
        await markNotificationRead(id);
        await refresh({ silent: true });
      } catch {
        await refresh({ silent: true });
      }
    },
    [user, refresh],
  );

  const value = useMemo(
    () => ({
      unreadCount,
      recentNotifications,
      loading,
      refresh,
      markOneRead,
      inboxVersion,
    }),
    [unreadCount, recentNotifications, loading, refresh, markOneRead, inboxVersion],
  );

  return (
    <UserNotificationContext.Provider value={value}>
      {children}
    </UserNotificationContext.Provider>
  );
}

UserNotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUserNotifications() {
  const ctx = useContext(UserNotificationContext);
  if (!ctx) {
    throw new Error(
      "useUserNotifications must be used within UserNotificationProvider",
    );
  }
  return ctx;
}
