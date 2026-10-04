/** Model Gemini — cấu hình qua GEMINI_MODEL trong .env */
export const GEMINI_MODEL =
	process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

const DEFAULT_FALLBACK_MODELS = 'gemini-flash-lite-latest,gemini-flash-latest';

/**
 * Model chính + model dự phòng (GEMINI_FALLBACK_MODELS, phân tách bằng dấu phẩy; để trống = tắt dự phòng).
 * @returns {string[]}
 */
export function getGeminiModels() {
	const raw = process.env.GEMINI_FALLBACK_MODELS ?? DEFAULT_FALLBACK_MODELS;
	const fallbacks = raw
		.split(',')
		.map((m) => m.trim())
		.filter(Boolean);
	return [...new Set([GEMINI_MODEL, ...fallbacks])];
}

/**
 * Danh sách API key: GEMINI_API_KEYS (phân tách bằng dấu phẩy), hoặc GEMINI_API_KEY đơn.
 * @returns {string[]}
 */
export function getGeminiApiKeys() {
	const multi = process.env.GEMINI_API_KEYS?.trim();
	if (multi) {
		const keys = multi
			.split(',')
			.map((k) => k.trim())
			.filter(Boolean);
		if (keys.length > 0) return keys;
	}
	const single = process.env.GEMINI_API_KEY?.trim();
	return single ? [single] : [];
}

export const isGeminiConfigured = () => getGeminiApiKeys().length > 0;

/**
 * @param {unknown} error
 */
export function isGeminiQuotaError(error) {
	const msg = String(
		/** @type {{ message?: string }} */ (error)?.message ?? error ?? '',
	).toLowerCase();
	const status =
		/** @type {{ status?: number, statusCode?: number }} */ (error)?.status ??
		/** @type {{ statusCode?: number }} */ (error)?.statusCode;
	return (
		status === 429 ||
		msg.includes('quota') ||
		msg.includes('resource_exhausted') ||
		msg.includes('rate limit') ||
		msg.includes('too many requests') ||
		msg.includes('exceeded')
	);
}

/**
 * @param {unknown} error
 */
export function shouldTryNextGeminiKey(error) {
	if (isGeminiQuotaError(error)) return true;
	const msg = String(
		/** @type {{ message?: string }} */ (error)?.message ?? error ?? '',
	).toLowerCase();
	return (
		msg.includes('api key not valid') ||
		msg.includes('invalid api key') ||
		msg.includes('permission denied') ||
		msg.includes('api_key_invalid')
	);
}

/**
 * Model quá tải / hết quota riêng của model / model không tồn tại / trả JSON hỏng → thử model dự phòng.
 * @param {unknown} error
 */
export function shouldTryNextGeminiModel(error) {
	if (isGeminiQuotaError(error)) return true;
	if (/** @type {{ name?: string }} */ (error)?.name === 'SyntaxError') return true;
	const status =
		/** @type {{ status?: number }} */ (error)?.status ??
		/** @type {{ statusCode?: number }} */ (error)?.statusCode;
	const msg = String(
		/** @type {{ message?: string }} */ (error)?.message ?? error ?? '',
	).toLowerCase();
	return (
		[404, 500, 503, 504].includes(status) ||
		msg.includes('503') ||
		msg.includes('500 internal') ||
		msg.includes('404 not found') ||
		msg.includes('high demand') ||
		msg.includes('overloaded') ||
		msg.includes('unavailable') ||
		msg.includes('deadline') ||
		msg.includes('json') ||
		msg.includes('empty ai response')
	);
}
