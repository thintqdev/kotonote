import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getAdminToken } from "../services/tokenStorage.js";
import { getSocketBaseUrl } from "../utils/socketBaseUrl.js";

/**
 * Socket.IO cho tài khoản admin (cùng JWT với REST).
 * @param {boolean} enabled
 */
export function useAdminNotificationSocket(enabled) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const token = getAdminToken();
    if (!token) return undefined;

    const s = io(getSocketBaseUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    setSocket(s);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [enabled]);

  return { socket, connected };
}
