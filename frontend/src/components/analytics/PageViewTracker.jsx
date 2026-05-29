import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { recordPageView } from "../../services/analyticsService.js";

const DEDUPE_MS = 30_000;
const SKIP_PREFIXES = [
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

function shouldTrackPath(pathname) {
  const p = pathname || "/";
  return !SKIP_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  );
}

function dedupeKey(pathname) {
  const bucket = Math.floor(Date.now() / DEDUPE_MS);
  return `${pathname}|${bucket}`;
}

/**
 * Ghi nhận lượt xem trang (user đã đăng nhập) — phục vụ thống kê admin.
 */
export default function PageViewTracker() {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const lastSentRef = useRef("");
  const abortRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const path = `${pathname}${search || ""}`;
    if (!shouldTrackPath(pathname)) return;

    const key = dedupeKey(path);
    if (lastSentRef.current === key) return;
    lastSentRef.current = key;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void recordPageView(path, { signal: controller.signal }).catch(() => {
      /* không làm gián đoạn UX */
    });

    return () => controller.abort();
  }, [pathname, search, user]);

  return null;
}
