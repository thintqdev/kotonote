/** Đường dẫn API (relative tới VITE_API_URL / base /api) */

export const AUTH = {
	LOGIN: '/auth/login',
	ADMIN_LOGIN: '/auth/admin/login',
	REGISTER: '/auth/register',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_VERIFICATION: '/auth/resend-verification',
	GOOGLE: '/auth/google',
	LOGOUT: '/auth/logout',
	ADMIN_LOGOUT: '/auth/admin/logout',
	CHANGE_PASSWORD: '/auth/change-password',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
};

/** Ngữ pháp (user đã đăng nhập) — `/api/grammar/*`, Bearer JWT */
export const GRAMMAR = {
	BASE: '/grammar',
	PRACTICE_QUIZ: '/grammar/practice/quiz',
	bySlug: (slug) => `/grammar/${encodeURIComponent(slug)}`,
};

/** Đọc hiểu (user) — `/api/reading/*` */
export const READING = {
	BASE: '/reading',
	SUMMARY: '/reading/summary',
	bySlug: (slug) => `/reading/${encodeURIComponent(slug)}`,
	progress: (slug) => `/reading/${encodeURIComponent(slug)}/progress`,
};

/** Đề thi JLPT (user) — `/api/exam-papers/*` */
export const EXAM_PAPERS = {
	BASE: '/exam-papers',
	bySlug: (slug) => `/exam-papers/${encodeURIComponent(slug)}`,
	history: '/exam-papers/history',
	historyById: (attemptId) =>
		`/exam-papers/history/${encodeURIComponent(attemptId)}`,
	historyReview: (attemptId) =>
		`/exam-papers/history/${encodeURIComponent(attemptId)}/review`,
	submit: (slug) => `/exam-papers/${encodeURIComponent(slug)}/submit`,
	review: (slug) => `/exam-papers/${encodeURIComponent(slug)}/review`,
};

/** Trích dẫn công khai — `/api/quotes/*` */
export const QUOTES = {
	RANDOM: '/quotes/random',
	ACTIVE: '/quotes/active',
};

/** Gói membership — `/api/membership/*` */
export const MEMBERSHIP = {
	PLANS: '/membership/plans',
	ME: '/membership/me',
	CHECKOUT: '/membership/checkout',
	CHECKOUT_HISTORY: '/membership/checkout-history',
	checkoutStatus: (checkoutId) =>
		`/membership/checkout/${encodeURIComponent(checkoutId)}/status`,
	checkoutReceipt: (checkoutId) =>
		`/membership/checkout/${encodeURIComponent(checkoutId)}/receipt`,
	confirmCheckout: (checkoutId) =>
		`/membership/checkout/${encodeURIComponent(checkoutId)}/confirm`,
	refundRequest: (checkoutId) =>
		`/membership/checkout/${encodeURIComponent(checkoutId)}/refund-request`,
};

/** GET/PUT hồ sơ người đăng nhập — `/api/users/me` (alias tương thích: `/api/profile/me`) */
export const PROFILE = {
	ME: '/users/me',
	LEARNING_SUMMARY: '/users/me/learning-summary',
	DASHBOARD_HOME: '/users/me/dashboard-home',
	FOCUS_AREAS: '/users/me/focus-areas',
	SETTINGS: '/users/me/settings',
	/** POST multipart field `avatar` — lưu file, trả về `user.avatar` dạng `/uploads/avatars/...` */
	AVATAR: '/users/me/avatar',
	/** POST JSON `{ badgeKey }` — chỉ bật khi không phải production */
	BADGE_TEST_UNLOCK: '/users/me/badges/test-unlock',
};

/** Sổ tay ghi chú — `/api/notebook/*` */
export const NOTEBOOK = {
	NOTES: '/notebook/notes',
	note: (id) => `/notebook/notes/${encodeURIComponent(id)}`,
	IMAGES: '/notebook/images',
};

/** Nhật ký tiếng Nhật — `/api/journal/*` */
export const JOURNAL = {
	QUOTA: '/journal/quota',
	ENTRIES: '/journal/entries',
	ANALYZE: '/journal/entries/analyze',
	entry: (id) => `/journal/entries/${encodeURIComponent(id)}`,
};

/** Streak — `/api/streaks/*` (user: Bearer JWT) */
export const STREAK = {
	ME: '/streaks/me',
	CHECK_IN: '/streaks/check-in',
	FREEZE: '/streaks/freeze',
	WEEKLY: '/streaks/weekly',
	LEADERBOARD: '/streaks/leaderboard',
};

/** Bảng xếp hạng — `/api/leaderboard` */
export const LEADERBOARD = {
	BASE: '/leaderboard',
};

/** Thông báo người dùng — `/api/notifications` */
export const NOTIFICATIONS = {
	LIST: '/notifications',
	UNREAD_COUNT: '/notifications/unread-count',
	markRead: (id) => `/notifications/${encodeURIComponent(id)}/read`,
};

/** Đọc deck/từ vựng (user đã đăng nhập) — `/api/vocabulary/*`, Bearer JWT */
export const USER_VOCABULARY = {
	DECKS: '/vocabulary/my/decks',
	deck: (id) => `/vocabulary/my/decks/${encodeURIComponent(id)}`,
	deckVocabulary: (id) =>
		`/vocabulary/my/decks/${encodeURIComponent(id)}/vocabulary`,
	deckWords: (deckId) =>
		`/vocabulary/my/decks/${encodeURIComponent(deckId)}/words`,
	deckImport: (deckId) =>
		`/vocabulary/my/decks/${encodeURIComponent(deckId)}/import`,
	word: (vocabId) => `/vocabulary/my/words/${encodeURIComponent(vocabId)}`,
};

/** Bộ Kanji riêng (Pro+) — `/api/kanji/my/*` */
export const USER_KANJI = {
	DECKS: '/kanji/my/decks',
	deck: (id) => `/kanji/my/decks/${encodeURIComponent(id)}`,
	deckKanji: (id) => `/kanji/my/decks/${encodeURIComponent(id)}/kanji`,
	deckKanjiCreate: (deckId) =>
		`/kanji/my/decks/${encodeURIComponent(deckId)}/kanji`,
	deckImport: (deckId) => `/kanji/my/decks/${encodeURIComponent(deckId)}/import`,
	kanji: (kanjiId) => `/kanji/my/kanji/${encodeURIComponent(kanjiId)}`,
};

export const VOCABULARY = {
	DECKS: '/vocabulary/decks',
	PROGRESS: '/vocabulary/progress',
	deckProgress: (deckId) => `/vocabulary/progress/${encodeURIComponent(deckId)}`,
	advanceProgress: (deckId) =>
		`/vocabulary/progress/${encodeURIComponent(deckId)}/advance`,
	deck: (id) => `/vocabulary/decks/${id}`,
	deckWithVocabulary: (id) => `/vocabulary/decks/${id}/vocabulary`,
	wordsByDeck: (deckId) => `/vocabulary/deck/${deckId}/words`,
};

/** Ghi deck/từ — `/api/admin/vocabulary/*` */
export const ADMIN_VOCABULARY = {
	DECKS: '/admin/vocabulary/decks',
	deck: (id) => `/admin/vocabulary/decks/${id}`,
	import: (deckId) => `/admin/vocabulary/decks/${deckId}/import`,
	WORDS: '/admin/vocabulary/words',
	word: (id) => `/admin/vocabulary/words/${id}`,
};

/** Đọc deck/kanji (user đã đăng nhập) — `/api/kanji/*`, Bearer JWT */
export const KANJI = {
	DECKS: '/kanji/decks',
	PROGRESS: '/kanji/progress',
	deckProgress: (deckId) => `/kanji/progress/${encodeURIComponent(deckId)}`,
	advanceProgress: (deckId) =>
		`/kanji/progress/${encodeURIComponent(deckId)}/advance`,
	deck: (id) => `/kanji/decks/${id}`,
	deckWithKanji: (id) => `/kanji/decks/${id}/kanji`,
};

/** Ghi deck/kanji — `/api/admin/kanji/*` */
export const ADMIN_KANJI = {
	DECKS: '/admin/kanji/decks',
	deck: (id) => `/admin/kanji/decks/${id}`,
	import: (deckId) => `/admin/kanji/decks/${deckId}/import`,
	KANJI: '/admin/kanji/kanji',
	kanji: (id) => `/admin/kanji/kanji/${id}`,
};

/** Huy hiệu / thành tựu — `/api/admin/badges` */
export const ADMIN_BADGES = {
	BASE: '/admin/badges',
	badge: (id) => `/admin/badges/${encodeURIComponent(id)}`,
	icon: (id) => `/admin/badges/${encodeURIComponent(id)}/icon`,
};

/** Ngữ pháp — `/api/admin/grammar` */
export const ADMIN_GRAMMAR = {
	BASE: '/admin/grammar',
	grammar: (id) => `/admin/grammar/${encodeURIComponent(id)}`,
	PRACTICE_BASE: '/admin/grammar/practice',
	practice: (id) => `/admin/grammar/practice/${encodeURIComponent(id)}`,
	PRACTICE_GENERATE: '/admin/grammar/practice/generate',
	PRACTICE_IMPORT: '/admin/grammar/practice/import',
};

/** Kaiwa — bối cảnh hội thoại (user) — `/api/kaiwa` */
export const KAIWA = {
	BASE: '/kaiwa',
	context: (id) => `/kaiwa/${encodeURIComponent(id)}`,
	practiceTurn: (id) =>
		`/kaiwa/${encodeURIComponent(id)}/practice/turn`,
	SESSIONS: '/kaiwa/sessions',
	session: (sessionId) =>
		`/kaiwa/sessions/${encodeURIComponent(sessionId)}`,
	contextSessions: (contextId) =>
		`/kaiwa/${encodeURIComponent(contextId)}/sessions`,
};

/** Kaiwa — bối cảnh hội thoại — `/api/admin/kaiwa` */
export const ADMIN_KAIWA = {
	BASE: '/admin/kaiwa',
	context: (id) => `/admin/kaiwa/${encodeURIComponent(id)}`,
};

/** JLPT đề thi — `/api/admin/exam-papers` */
export const ADMIN_EXAM_PAPERS = {
	BASE: '/admin/exam-papers',
	TEMPLATE: '/admin/exam-papers/sections/template',
	UPLOAD_MEDIA: '/admin/exam-papers/upload-media',
	UPLOAD_THUMBNAIL: '/admin/exam-papers/upload-thumbnail',
	paper: (id) => `/admin/exam-papers/${encodeURIComponent(id)}`,
	sections: (id) => `/admin/exam-papers/${encodeURIComponent(id)}/sections`,
	sectionsInit: (id) =>
		`/admin/exam-papers/${encodeURIComponent(id)}/sections/init`,
	sectionsImport: (id) =>
		`/admin/exam-papers/${encodeURIComponent(id)}/sections/import`,
};

/** Khung cấu trúc JLPT — `/api/admin/exam-structures` */
export const ADMIN_EXAM_STRUCTURES = {
	BASE: '/admin/exam-structures',
	META: '/admin/exam-structures/meta',
	CATALOG: '/admin/exam-structures/part-catalog',
	SEED: '/admin/exam-structures/seed',
	template: (id) => `/admin/exam-structures/${encodeURIComponent(id)}`,
	defaultByJlpt: (jlpt) =>
		`/admin/exam-structures/default/${encodeURIComponent(jlpt)}`,
	reset: (id) => `/admin/exam-structures/${encodeURIComponent(id)}/reset`,
};

/** Luyện nghe (Choukai) — `/api/admin/listening` */
export const ADMIN_LISTENING = {
	BASE: '/admin/listening',
	UPLOAD_AUDIO: '/admin/listening/upload/audio',
	UPLOAD_IMAGE: '/admin/listening/upload/image',
	item: (id) => `/admin/listening/${encodeURIComponent(id)}`,
};

/** Đọc hiểu — `/api/admin/reading` */
export const ADMIN_READING = {
	BASE: '/admin/reading',
	UPLOAD_COVER: '/admin/reading/upload-cover',
	article: (id) => `/admin/reading/${encodeURIComponent(id)}`,
	cover: (id) => `/admin/reading/${encodeURIComponent(id)}/cover`,
};

/** Trích dẫn — `/api/admin/quotes` */
export const ADMIN_QUOTES = {
	BASE: '/admin/quotes',
	quote: (id) => `/admin/quotes/${id}`,
};

/** Prompt AI generate — `/api/admin/prompts` */
export const ADMIN_PROMPTS = {
	BASE: '/admin/prompts',
	prompt: (id) => `/admin/prompts/${id}`,
};

/** AI generate — `/api/admin/ai/*` */
export const ADMIN_AI = {
	generateVocabulary: '/admin/ai/generate/vocabulary',
	generateKanji: '/admin/ai/generate/kanji',
	generateGrammar: '/admin/ai/generate/grammar',
	generateReading: '/admin/ai/generate/reading',
	generateKaiwa: '/admin/ai/generate/kaiwa',
	test: '/admin/ai/test',
};

/** Người dùng — `/api/admin/users` */
export const ADMIN_USERS = {
	BASE: '/admin/users',
	statistics: '/admin/users/statistics',
	user: (id) => `/admin/users/${id}`,
	status: (id) => `/admin/users/${id}/status`,
	bulkStatus: '/admin/users/bulk/status',
};

/** Gói membership / subscription — `/api/admin/memberships` */
export const ADMIN_MEMBERSHIPS = {
	statistics: '/admin/memberships/statistics',
	users: '/admin/memberships/users',
	checkouts: '/admin/memberships/checkouts',
	checkoutReceipt: (checkoutId) =>
		`/admin/memberships/checkouts/${encodeURIComponent(checkoutId)}/receipt`,
	refundCheckout: (checkoutId) =>
		`/admin/memberships/checkouts/${encodeURIComponent(checkoutId)}/refund`,
	user: (id) => `/admin/memberships/users/${encodeURIComponent(id)}`,
};

/** Cài đặt studio — `/api/admin/settings` */
export const ADMIN_SETTINGS = {
	BASE: '/admin/settings',
};

/** Khảo sát — `/api/admin/surveys` */
export const ADMIN_SURVEYS = {
	stats: '/admin/surveys/stats',
	overview: '/admin/surveys/overview',
};

/** Góp ý người dùng — `/api/admin/feedback` */
export const ADMIN_FEEDBACK = {
	BASE: '/admin/feedback',
	feedback: (id) => `/admin/feedback/${encodeURIComponent(id)}`,
};

/** Hiệu suất / sức khỏe hệ thống — `/api/admin/system` */
export const ADMIN_SYSTEM = {
	health: '/admin/system/health',
};

/** Thông báo / chiến dịch — `/api/admin/notifications` */
export const ADMIN_NOTIFICATIONS = {
	campaigns: '/admin/notifications/campaigns',
	campaignCancel: (id) => `/admin/notifications/campaigns/${encodeURIComponent(id)}/cancel`,
};
