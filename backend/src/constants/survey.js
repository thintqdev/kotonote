// Survey Constants

export const SURVEY_LEVEL = {
	BEGIN: 'begin',
	N5: 'n5',
	N4: 'n4',
	N3: 'n3',
	N2UP: 'n2up',
};

export const SURVEY_GOAL = {
	JLPT: 'jlpt',
	TRAVEL: 'travel',
	WORK: 'work',
	SCHOOL: 'school',
	HOBBY: 'hobby',
};

export const SURVEY_DAILY_TIME = {
	LT15: 'lt15',
	M15_30: '15-30',
	M30_60: '30-60',
	GT60: 'gt60',
};

export const SURVEY_WEAK_AREA = {
	GRAMMAR: 'grammar',
	VOCAB: 'vocab',
	KANJI: 'kanji',
	LISTEN: 'listen',
	READ: 'read',
};

export const SURVEY_DISCOVERY = {
	FRIEND: 'friend',
	SNS: 'sns',
	SEARCH: 'search',
	OTHER: 'other',
};

/** Thứ tự cố định cho trục biểu đồ / bảng thống kê */
export const SURVEY_LEVEL_KEYS = Object.freeze([
	'begin',
	'n5',
	'n4',
	'n3',
	'n2up',
]);
export const SURVEY_GOAL_KEYS = Object.freeze([
	'jlpt',
	'travel',
	'work',
	'school',
	'hobby',
]);
export const SURVEY_DAILY_TIME_KEYS = Object.freeze([
	'lt15',
	'15-30',
	'30-60',
	'gt60',
]);
export const SURVEY_WEAK_AREA_KEYS = Object.freeze([
	'grammar',
	'vocab',
	'kanji',
	'listen',
	'read',
]);
export const SURVEY_DISCOVERY_KEYS = Object.freeze([
	'friend',
	'sns',
	'search',
	'other',
	'unspecified',
]);
