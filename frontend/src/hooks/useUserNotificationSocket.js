import { useEffect, useState } from "react";
import { getUserToken } from "../services/tokenStorage.js";
import { getSocketBaseUrl } from "../utils/socketBaseUrl.js";

/**
 * Socket.IO cho user app — chỉ kết nối khi `enabled` (trang thông báo / dropdown mở).
 * Dynamic import `socket.io-client` để không tải ~42KB khi chưa cần.
 * @param {boolean} enabled
 */
export function useUserNotificationSocket(enabled) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      setSocket(null);
      return undefined;
    }

    const token = getUserToken();
    if (!token) return undefined;

    let activeSocket = null;
    let cancelled = false;
    let onConnect = null;
    let onDisconnect = null;

    (async () => {
      const { io } = await import("socket.io-client");
      if (cancelled) return;

      const s = io(getSocketBaseUrl(), {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      onConnect = () => setConnected(true);
      onDisconnect = () => setConnected(false);

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      activeSocket = s;
      setSocket(s);
    })();

    return () => {
      cancelled = true;
      if (activeSocket) {
        if (onConnect) activeSocket.off("connect", onConnect);
        if (onDisconnect) activeSocket.off("disconnect", onDisconnect);
        activeSocket.disconnect();
      }
      setConnected(false);
      setSocket(null);
    };
  }, [enabled]);

  return { socket, connected };
}
