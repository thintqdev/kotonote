import { QUOTES } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { dedupePromise } from '../utils/dedupePromise.js';
import api from './api.js';

const QUOTE_CACHE_TTL_MS = 90_000;
/** @type {{ data: object | null, at: number }} */
let quoteCache = { data: null, at: 0 };

/**
 * Chọn nội dung hiển thị theo ngôn ngữ UI (ưu tiên bản tương ứng, fallback bản còn lại).
 * @param {object | null | undefined} quote — document từ API
 * @param {string} [language] — ví dụ `vi`, `ja`
 */
export function pickQuoteLineForLanguage(quote, language) {
	if (!quote || typeof quote !== 'object') return '';
	const vi = typeof quote.quoteVi === 'string' ? quote.quoteVi.trim() : '';
	const ja = typeof quote.quoteJa === 'string' ? quote.quoteJa.trim() : '';
	const lang = String(language || '').toLowerCase();
	if (lang.startsWith('ja')) {
		return ja || vi;
	}
	return vi || ja;
}

/**
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 * @returns {Promise<{ quote?: object }>}
 */
export async function getRandomQuote(axiosConfig = {}) {
	const body = await api.get(QUOTES.RANDOM, axiosConfig);
	return getApiData(body);
}

/**
 * Quote ngẫu nhiên dùng chung (dashboard footer, banner, daily note) — dedupe + cache ngắn.
 * @param {import('axios').AxiosRequestConfig} [axiosConfig]
 */
export async function getSharedRandomQuote(axiosConfig = {}) {
	if (axiosConfig.signal?.aborted) {
		throw new DOMException('Aborted', 'AbortError');
	}
	const now = Date.now();
	if (quoteCache.data && now - quoteCache.at < QUOTE_CACHE_TTL_MS) {
		return quoteCache.data;
	}
	return dedupePromise('quotes-random', async () => {
		const data = await getRandomQuote(axiosConfig);
		quoteCache = { data, at: Date.now() };
		return data;
	});
}
