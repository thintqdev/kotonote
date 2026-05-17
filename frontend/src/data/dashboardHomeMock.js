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
    location: "vn",
    timeZoneLabel: "gmt+7",
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
