/** Đường dẫn API (relative tới VITE_API_URL / base /api) */

export const AUTH = {
	LOGIN: '/auth/login',
	ADMIN_LOGIN: '/auth/admin/login',
	REGISTER: '/auth/register',
	GOOGLE: '/auth/google',
};

export const PROFILE = {
	ME: '/profile/me',
};

/** Đọc deck/từ (public `/api/vocabulary/*`, cần JWT admin khi gọi qua adminApi) */
export const VOCABULARY = {
	DECKS: '/vocabulary/decks',
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

/** Đọc deck/kanji (public `/api/kanji/*`) */
export const KANJI = {
	DECKS: '/kanji/decks',
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
};
