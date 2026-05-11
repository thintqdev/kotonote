import { useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./useAuth.jsx";
import { buildDemoProfile } from "../data/dashboardHomeMock.js";
import {
  loadOverrides,
  subscribeProfileOverrides,
  getProfileOverridesSnapshot,
} from "../utils/profileStorage.js";

/**
 * Hồ sơ gộp: demo + localStorage override + user đăng nhập (cùng logic Profile).
 */
export function useMergedProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const version = useSyncExternalStore(
    subscribeProfileOverrides,
    getProfileOverridesSnapshot,
    getProfileOverridesSnapshot,
  );

  const overrides = useMemo(() => {
    void version;
    return loadOverrides();
  }, [version]);

  const demoProfile = useMemo(() => buildDemoProfile(t), [t]);

  const profile = useMemo(() => {
    const merged = { ...demoProfile, ...overrides };
    if (user?.email?.trim()) merged.email = user.email.trim();
    if (user?.name?.trim()) merged.displayName = user.name.trim();
    return merged;
  }, [demoProfile, overrides, user]);

  return profile;
}
