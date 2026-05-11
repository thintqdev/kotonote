/** Menu sidebar — nhãn qua i18n: nav.<id> */
export const DASHBOARD_NAV_ITEMS = [
  { id: 'home', to: '/', end: true, iconSrc: '/assets/menu-icons/home.png' },
  { id: 'alphabet', to: null, iconSrc: '/assets/menu-icons/alphabet.png' },
  { id: 'grammar', to: '/grammar', iconSrc: '/assets/menu-icons/grammar.png' },
  { id: 'vocab', to: '/vocabulary', iconSrc: '/assets/menu-icons/vocab.png' },
  { id: 'kanji', to: null, iconSrc: '/assets/menu-icons/kanji.png' },
  { id: 'reading', to: null, iconSrc: '/assets/menu-icons/reading.png' },
  { id: 'listening', to: null, iconSrc: '/assets/menu-icons/listening.png' },
  { id: 'practice', to: null, iconSrc: '/assets/menu-icons/practice.png' },
  { id: 'notebook', to: null, iconSrc: '/assets/menu-icons/notebook.png' },
  { id: 'stats', to: null, iconSrc: '/assets/menu-icons/statistics.png' },
  { id: 'settings', to: null, iconSrc: '/assets/menu-icons/settings.png' },
];

/** icon menu theo id nav — dùng chung 学習科目 / SubjectGrid */
export const NAV_MENU_ICON_BY_ID = Object.fromEntries(
  DASHBOARD_NAV_ITEMS.map((item) => [item.id, item.iconSrc]),
);

/** Ghim trang trí (public) */
export const DASHBOARD_PIN_IMG_SRC = '/assets/decorates/pin.png';
