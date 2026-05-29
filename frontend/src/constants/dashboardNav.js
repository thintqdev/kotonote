export const DASHBOARD_NAV_ITEMS = [
  { id: 'home', to: '/', end: true, iconSrc: '/assets/menu-icons/home.png' },
  { id: 'alphabet', to: '/alphabet', iconSrc: '/assets/menu-icons/alphabet.png' },
  { id: 'grammar', to: '/grammar', iconSrc: '/assets/menu-icons/grammar.png' },
  { id: 'vocab', to: '/vocabulary', iconSrc: '/assets/menu-icons/vocab.png' },
  { id: 'kanji', to: '/kanji', iconSrc: '/assets/menu-icons/kanji.png' },
  { id: 'reading', to: '/reading', iconSrc: '/assets/menu-icons/reading.png' },
  { id: 'listening', to: '/listening', iconSrc: '/assets/menu-icons/listening.png' },
  { id: 'kaiwa', to: '/kaiwa', iconSrc: '/assets/menu-icons/practice.png' },
  { id: 'practice', to: '/practice', iconSrc: '/assets/menu-icons/practice.png' },
  { id: 'notebook', to: '/notebook', iconSrc: '/assets/menu-icons/notebook.png' },
  { id: 'journal', to: '/journal', iconSrc: '/assets/menu-icons/notebook.png' },
  { id: 'stats', to: '/leaderboard', iconSrc: '/assets/menu-icons/statistics.png' },
  { id: 'settings', to: '/settings', iconSrc: '/assets/menu-icons/settings.png' },
];

export const NAV_MENU_ICON_BY_ID = Object.fromEntries(
  DASHBOARD_NAV_ITEMS.map((item) => [item.id, item.iconSrc]),
);

export const DASHBOARD_PIN_IMG_SRC = '/assets/decorates/pin.png';

/** Đường dẫn môn học từ thẻ dashboard */
export const SUBJECT_ROUTE_BY_ID = {
	grammar: '/grammar',
	vocab: '/vocabulary',
	kanji: '/kanji',
	reading: '/reading',
	listening: '/listening',
	kaiwa: '/kaiwa',
	practice: '/practice',
	alphabet: '/alphabet',
};
