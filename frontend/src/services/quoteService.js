import { QUOTES } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import api from './api.js';

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
