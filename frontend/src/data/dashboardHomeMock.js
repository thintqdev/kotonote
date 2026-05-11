/** Dữ liệu demo dashboard — sau này thay bằng API. Nhãn UI lấy từ i18n. */

/**
 * Hồ sơ demo — Profile; `t` từ useTranslation.
 * @param {(key: string) => string} t
 */
export function buildDemoProfile(t) {
  return {
    displayName: t("demoProfile.displayName"),
    readingName: t("demoProfile.readingName"),
    title: t("demoProfile.title"),
    email: t("demoProfile.email"),
    joinedLabel: t("demoProfile.joinedLabel"),
    location: t("demoProfile.location"),
    timeZoneLabel: t("demoProfile.timeZoneLabel"),
    bio: t("demoProfile.bio"),
    examTypeKey: "jlpt",
    examLevelKey: "n3",
    examDateIso: "2026-07-05",
    examOtherNote: "",
    examTarget: t("demoProfile.examTarget"),
    examDateLabel: t("demoProfile.examDateLabel"),
    streakDays: 12,
    totalXp: 8420,
    weeklyStudyMin: 320,
    levelLabel: t("demoProfile.levelLabel"),
    badges: [
      { id: "b1", emoji: "🔥", label: t("demoProfile.badges.b1") },
      { id: "b2", emoji: "📓", label: t("demoProfile.badges.b2") },
      { id: "b3", emoji: "✨", label: t("demoProfile.badges.b3") },
      { id: "b4", emoji: "🎧", label: t("demoProfile.badges.b4") },
    ],
    focusAreas: [
      { label: t("demoProfile.focus.grammar") },
      { label: t("demoProfile.focus.vocab") },
      { label: t("demoProfile.focus.kanji") },
    ],
    avatarDataUrl: null,
  };
}

/** Định nghĩa môn — nhãn qua subjects.<id> trong i18n */
export const mockSubjectDefs = [
  {
    id: "grammar",
    progress: 68,
    tint: "cream",
  },
  {
    id: "vocab",
    progress: 45,
    tint: "yellow",
    variant: "binder",
  },
  {
    id: "kanji",
    progress: 52,
    tint: "pink",
  },
  {
    id: "reading",
    progress: 33,
    tint: "blue",
  },
  {
    id: "listening",
    progress: 41,
    tint: "green",
  },
];

export const mockTodayTaskDefs = [
  { subjectId: "grammar", detailKey: "g" },
  { subjectId: "vocab", detailKey: "v" },
  { subjectId: "kanji", detailKey: "k" },
];

export const mockTodayProgress = {
  percent: 60,
};

export const mockStreak = {
  days: 12,
};

/** Số thông báo chưa đọc (khớp mockNotificationList khi chưa tương tác UI). */
export const mockNotifications = 2;

export const mockNotificationList = [
  {
    id: "n1",
    type: "reminder",
    titleKey: "notif.n1.title",
    messageKey: "notif.n1.message",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    read: false,
  },
  {
    id: "n2",
    type: "progress",
    titleKey: "notif.n2.title",
    messageKey: "notif.n2.message",
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "n3",
    type: "achievement",
    titleKey: "notif.n3.title",
    messageKey: "notif.n3.message",
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
    read: true,
  },
];
