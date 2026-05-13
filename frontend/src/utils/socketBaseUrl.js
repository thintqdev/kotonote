/**
 * Origin máy chủ chạy Socket.IO (cùng process với API HTTP).
 *
 * - `VITE_API_URL` tuyệt đối (`http://localhost:8000/api`) → lấy host từ đó.
 * - `VITE_API_URL` tương đối (`/api`) → **không** dùng `window.location` cho socket (sẽ thành
 *   port Vite 5173, handshake sai). Cần `VITE_SOCKET_ORIGIN` hoặc `VITE_API_ORIGIN`.
 *
 * @returns {string} ví dụ `http://localhost:8000`
 */
export function getSocketBaseUrl() {
  const socketOrigin = import.meta.env.VITE_SOCKET_ORIGIN?.trim();
  if (socketOrigin) {
    try {
      const u = new URL(socketOrigin);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* fall through */
    }
  }

  const api = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  if (typeof api === "string" && api.startsWith("/")) {
    const origin =
      import.meta.env.VITE_API_ORIGIN?.trim() || "http://localhost:8000";
    try {
      const u = new URL(origin);
      return `${u.protocol}//${u.host}`;
    } catch {
      return "http://localhost:8000";
    }
  }

  try {
    const u = new URL(api);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:8000";
  }
}
