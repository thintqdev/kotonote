export const PROFILE_STORAGE_KEY = "kotonote-profile-overrides";

const EVENT_NAME = "kotonote-profile-overrides";

/** @type {number} */
let profileOverridesVersion = 0;

export function getProfileOverridesVersion() {
  return profileOverridesVersion;
}

/**
 * @param {(v: number) => void} onStoreChange
 * @returns {() => void}
 */
export function subscribeProfileOverrides(onStoreChange) {
  const handler = () => onStoreChange();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getProfileOverridesSnapshot() {
  return getProfileOverridesVersion();
}

export function normalizeLegacyOverrides(raw) {
  if (!raw || typeof raw !== "object") return {};
  const x = { ...raw };
  if (x.examTarget != null && x.examTypeKey == null) {
    x.examTypeKey = "other";
    x.examLevelKey = "";
    x.examOtherNote = String(x.examTarget);
    if (x.examDateIso == null) x.examDateIso = "";
  }
  if (x.title == null && x.titleVn != null) x.title = x.titleVn;
  if (x.bio == null && x.bioVn != null) x.bio = x.bioVn;
  if (x.readingName == null && x.displayNameJp != null)
    x.readingName = x.displayNameJp;
  if (x.location == null && x.locationVn != null) x.location = x.locationVn;
  if (x.joinedLabel == null && x.joinedLabelVn != null)
    x.joinedLabel = x.joinedLabelVn;
  if (x.examTarget == null && x.examTargetVn != null)
    x.examTarget = x.examTargetVn;
  if (x.examDateLabel == null && x.examDateLabelVn != null)
    x.examDateLabel = x.examDateLabelVn;
  return x;
}

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    if (typeof p !== "object" || p === null) return {};
    return normalizeLegacyOverrides(p);
  } catch {
    return {};
  }
}

export function persistOverrides(next) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    profileOverridesVersion += 1;
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    /* quota or private mode */
  }
}
