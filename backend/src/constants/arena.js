export const ARENA_SETTINGS_ID = 'global';

export const ARENA_DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const ARENA_DEFAULT_START = '20:00';
export const ARENA_DEFAULT_END = '24:00';
export const ARENA_DEFAULT_WEEKDAYS = [6];
export const ARENA_DEFAULT_REMINDER_MINUTES = 30;
export const ARENA_DEFAULT_JLPT = 'N4';

export const ARENA_LEADERBOARD_LIMIT = 50;

/** Số trò tối đa được bật trong một phiên đấu trường. */
export const ARENA_MAX_ACTIVE_GAMES = 3;

export const ARENA_ATTEMPT_STATUS = Object.freeze({
	IN_PROGRESS: 'in_progress',
	SUBMITTED: 'submitted',
});

export const ARENA_GAME_KEYS = Object.freeze({
	KANJI_RAIN: 'kanji_rain',
	VOCAB_BOX: 'vocab_box',
	PARTICLE_QUIZ: 'particle_quiz',
	READING_RUSH: 'reading_rush',
	MEANING_RUSH: 'meaning_rush',
});

export const ARENA_GAME_ORDER = [
	ARENA_GAME_KEYS.KANJI_RAIN,
	ARENA_GAME_KEYS.VOCAB_BOX,
	ARENA_GAME_KEYS.PARTICLE_QUIZ,
	ARENA_GAME_KEYS.READING_RUSH,
	ARENA_GAME_KEYS.MEANING_RUSH,
];

/** Trợ từ hay gặp — ưu tiên đưa vào mỗi câu trắc nghiệm. */
export const ARENA_PARTICLE_MCQ_CORE = [
	'は',
	'が',
	'を',
	'に',
	'で',
	'と',
	'の',
	'へ',
	'も',
	'か',
];

/** Ứng viên trợ từ bổ sung (phiên build 8 lựa chọn / câu). */
export const ARENA_PARTICLE_MCQ_POOL = [
	...ARENA_PARTICLE_MCQ_CORE,
	'から',
	'まで',
	'ね',
	'よ',
	'より',
	'など',
];

export const ARENA_PARTICLE_MCQ_SIZE = 8;

export const ARENA_KANJI_DEFAULT_DURATION_SEC = 120;
export const ARENA_KANJI_DEFAULT_PENALTY_SEC = 5;

export const ARENA_GAME_DEFAULTS = {
	[ARENA_GAME_KEYS.KANJI_RAIN]: {
		order: 1,
		durationSeconds: ARENA_KANJI_DEFAULT_DURATION_SEC,
		pointsPerCorrect: 10,
		penaltySeconds: ARENA_KANJI_DEFAULT_PENALTY_SEC,
		poolPickCount: 60,
	},
	[ARENA_GAME_KEYS.VOCAB_BOX]: {
		order: 2,
		boxCount: 12,
		pointsPerCorrect: 10,
		hopeStarBonus: 20,
		hopeStarPenalty: -10,
		maxHopeStars: 3,
	},
	[ARENA_GAME_KEYS.PARTICLE_QUIZ]: {
		order: 3,
		questionCount: 20,
		pointsPerCorrect: 10,
	},
	[ARENA_GAME_KEYS.READING_RUSH]: {
		order: 4,
		questionCount: 15,
		pointsPerCorrect: 10,
	},
	[ARENA_GAME_KEYS.MEANING_RUSH]: {
		order: 5,
		questionCount: 15,
		pointsPerCorrect: 10,
	},
};

export const ARENA_READING_MCQ_SIZE = 4;
export const ARENA_MEANING_MCQ_SIZE = 4;
