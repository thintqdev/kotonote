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

/** Mục tiêu gợi ý trong khối “Hôm nay” */
export const DASHBOARD_TODAY_TARGETS = {
	grammar: { detailKey: 'g', target: 2 },
	vocab: { detailKey: 'v', target: 15 },
	kanji: { detailKey: 'k', target: 8 },
};

export const DASHBOARD_TODAY_SUBJECT_IDS = ['grammar', 'vocab', 'kanji'];
