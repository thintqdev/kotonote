/** Model Gemini — cấu hình qua GEMINI_MODEL trong .env */
export const GEMINI_MODEL =
	process.env.GEMINI_MODEL?.trim() || 'gemini-flash-latest';

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
