/** Metadata thẻ môn học trên dashboard (route + style) */
export const DASHBOARD_SUBJECT_ORDER = [
	'grammar',
	'vocab',
	'kanji',
	'reading',
	'listening',
];

export const DASHBOARD_SUBJECT_ROUTES = {
	grammar: '/grammar',
	vocab: '/vocabulary',
	kanji: '/kanji',
	reading: '/reading',
	listening: '/listening',
};

export const DASHBOARD_SUBJECT_STYLE = {
	grammar: { tint: 'cream', variant: 'default' },
	vocab: { tint: 'yellow', variant: 'binder' },
	kanji: { tint: 'pink', variant: 'default' },
	reading: { tint: 'blue', variant: 'default' },
	listening: { tint: 'green', variant: 'default' },
};

/** Khóa i18n chi tiết task “Hôm nay” theo môn */
export const DASHBOARD_TODAY_DETAIL_KEYS = {
	grammar: 'g',
	vocab: 'v',
	kanji: 'k',
};

export const DASHBOARD_TODAY_SUBJECT_IDS = ['grammar', 'vocab', 'kanji'];
