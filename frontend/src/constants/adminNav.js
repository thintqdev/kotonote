/**
 * Cấu trúc menu sidebar Studio / Admin (nhãn qua i18n: adminLayout.sidebar.*).
 * @typedef {{ id: string, to: string, end?: boolean, iconSrc?: string, icon?: 'audio'|'image'|'doc'|'user' }} AdminNavItem
 * @typedef {{ id: string, titleKey: string, items: AdminNavItem[] }} AdminNavSection
 */

/** @type {AdminNavItem} */
const overview = {
  id: "overview",
  to: "/admin",
  end: true,
  iconSrc: "/assets/menu-icons/home.png",
  labelKey: "adminLayout.sidebar.overview",
};

/** @type {ReadonlyArray<AdminNavSection>} */
export const ADMIN_SIDEBAR_SECTIONS = [
  {
    id: "single",
    titleKey: "",
    items: [overview],
  },
  {
    id: "content",
    titleKey: "adminLayout.sidebar.sectionContent",
    items: [
      {
        id: "kanji",
        to: "/admin/kanji",
        iconSrc: "/assets/menu-icons/kanji.png",
        labelKey: "adminLayout.sidebar.kanji",
      },
      {
        id: "vocabulary",
        to: "/admin/vocabulary",
        iconSrc: "/assets/menu-icons/vocab.png",
        labelKey: "adminLayout.sidebar.vocabulary",
      },
      {
        id: "grammar",
        to: "/admin/grammar",
        iconSrc: "/assets/menu-icons/grammar.png",
        labelKey: "adminLayout.sidebar.grammar",
      },
      {
        id: "reading",
        to: "/admin/reading",
        iconSrc: "/assets/menu-icons/reading.png",
        labelKey: "adminLayout.sidebar.reading",
      },
      {
        id: "listening",
        to: "/admin/listening",
        iconSrc: "/assets/menu-icons/listening.png",
        labelKey: "adminLayout.sidebar.listening",
      },
      {
        id: "kaiwa",
        to: "/admin/kaiwa",
        icon: "audio",
        labelKey: "adminLayout.sidebar.kaiwa",
      },
      {
        id: "examPapers",
        to: "/admin/exam-papers",
        icon: "doc",
        labelKey: "adminLayout.sidebar.examPapers",
      },
      {
        id: "examStructures",
        to: "/admin/exam-structures",
        icon: "doc",
        labelKey: "adminLayout.sidebar.examStructures",
      },
    ],
  },
  // {
  //   id: "media",
  //   titleKey: "adminLayout.sidebar.sectionMedia",
  //   items: [
  //     {
  //       id: "mediaAudio",
  //       to: "/admin/media/audio",
  //       icon: "audio",
  //       labelKey: "adminLayout.sidebar.mediaAudio",
  //     },
  //     {
  //       id: "mediaImages",
  //       to: "/admin/media/images",
  //       icon: "image",
  //       labelKey: "adminLayout.sidebar.mediaImages",
  //     },
  //     {
  //       id: "mediaDocs",
  //       to: "/admin/media/documents",
  //       icon: "doc",
  //       labelKey: "adminLayout.sidebar.mediaDocs",
  //     },
  //   ],
  // },
  {
    id: "system",
    titleKey: "adminLayout.sidebar.sectionSystem",
    items: [
      {
        id: "users",
        to: "/admin/users",
        icon: "user",
        labelKey: "adminLayout.sidebar.users",
      },
      {
        id: "subscriptions",
        to: "/admin/subscriptions",
        icon: "doc",
        labelKey: "adminLayout.sidebar.subscriptions",
      },
      {
        id: "quotes",
        to: "/admin/quotes",
        icon: "user",
        labelKey: "adminLayout.sidebar.quotes",
      },
      {
        id: "prompts",
        to: "/admin/prompts",
        icon: "doc",
        labelKey: "adminLayout.sidebar.prompts",
      },
      {
        id: "badges",
        to: "/admin/badges",
        icon: "doc",
        labelKey: "adminLayout.sidebar.badges",
      },
      {
        id: "systemHealth",
        to: "/admin/analytics",
        iconSrc: "/assets/menu-icons/statistics.png",
        labelKey: "adminLayout.sidebar.systemHealth",
      },
      {
        id: "notifications",
        to: "/admin/notifications",
        icon: "doc",
        labelKey: "adminLayout.sidebar.notifications",
      },
      {
        id: "feedback",
        to: "/admin/feedback",
        icon: "doc",
        labelKey: "adminLayout.sidebar.feedback",
      },
      {
        id: "arena",
        to: "/admin/arena",
        iconSrc: "/assets/menu-icons/practice.png",
        labelKey: "adminLayout.sidebar.arena",
      },
      {
        id: "settings",
        to: "/admin/settings",
        iconSrc: "/assets/menu-icons/settings.png",
        labelKey: "adminLayout.sidebar.studioSettings",
      },
    ],
  },
];
