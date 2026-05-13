import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getUserToken } from "../services/tokenStorage.js";
import { getSocketBaseUrl } from "../utils/socketBaseUrl.js";

/**
 * Socket.IO cho user app (JWT giống REST) — nhận `notification:new`, v.v.
 * @param {boolean} enabled
 */
export function useUserNotificationSocket(enabled) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const token = getUserToken();
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
