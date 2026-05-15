import { useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./useAuth.jsx";
import { buildDemoProfile } from "../data/dashboardHomeMock.js";
import {
  loadOverrides,
  subscribeProfileOverrides,
  getProfileOverridesSnapshot,
} from "../utils/profileStorage.js";
import {
  buildProfileSliceFromUser,
  stripServerSyncedProfileOverrides,
} from "../utils/mapUserProfile.js";

/**
 * Hồ sơ gộp: demo + localStorage override + user đăng nhập (cùng logic Profile).
 */
export function useMergedProfile() {
  const { t, i18n } = useTranslation();
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
    const localOnly = stripServerSyncedProfileOverrides(overrides);
    const serverSlice = buildProfileSliceFromUser(
      user,
      demoProfile,
      t,
      i18n.language,
    );
    return { ...demoProfile, ...localOnly, ...serverSlice };
  }, [demoProfile, overrides, user, t, i18n.language]);

  return profile;
}
