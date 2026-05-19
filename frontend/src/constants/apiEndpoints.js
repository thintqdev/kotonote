/** Đường dẫn API (relative tới VITE_API_URL / base /api) */

export const AUTH = {
	LOGIN: '/auth/login',
	ADMIN_LOGIN: '/auth/admin/login',
	REGISTER: '/auth/register',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_VERIFICATION: '/auth/resend-verification',
	GOOGLE: '/auth/google',
	CHANGE_PASSWORD: '/auth/change-password',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
};

/** Ngữ pháp (user đã đăng nhập) — `/api/grammar/*`, Bearer JWT */
export const GRAMMAR = {
	BASE: '/grammar',
	bySlug: (slug) => `/grammar/${encodeURIComponent(slug)}`,
};

/** Đọc hiểu (user) — `/api/reading/*` */
export const READING = {
	BASE: '/reading',
	SUMMARY: '/reading/summary',
	bySlug: (slug) => `/reading/${encodeURIComponent(slug)}`,
	progress: (slug) => `/reading/${encodeURIComponent(slug)}/progress`,
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
	confirmCheckout: (checkoutId) =>
		`/membership/checkout/${encodeURIComponent(checkoutId)}/confirm`,
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

/** Streak — `/api/streaks/*` (user: Bearer JWT) */
export const STREAK = {
	ME: '/streaks/me',
	CHECK_IN: '/streaks/check-in',
	FREEZE: '/streaks/freeze',
	WEEKLY: '/streaks/weekly',
	LEADERBOARD: '/streaks/leaderboard',
};

/** Thông báo người dùng — `/api/notifications` */
export const NOTIFICATIONS = {
	LIST: '/notifications',
	UNREAD_COUNT: '/notifications/unread-count',
	markRead: (id) => `/notifications/${encodeURIComponent(id)}/read`,
};

/** Đọc deck/từ vựng (user đã đăng nhập) — `/api/vocabulary/*`, Bearer JWT */
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

/** Người dùng — `/api/admin/users` */
export const ADMIN_USERS = {
	BASE: '/admin/users',
	statistics: '/admin/users/statistics',
	user: (id) => `/admin/users/${id}`,
	status: (id) => `/admin/users/${id}/status`,
	bulkStatus: '/admin/users/bulk/status',
};

/** Khảo sát — `/api/admin/surveys` */
export const ADMIN_SURVEYS = {
	stats: '/admin/surveys/stats',
};

/** Thông báo / chiến dịch — `/api/admin/notifications` */
export const ADMIN_NOTIFICATIONS = {
	campaigns: '/admin/notifications/campaigns',
	campaignCancel: (id) => `/admin/notifications/campaigns/${encodeURIComponent(id)}/cancel`,
};
