import { ADMIN_AI } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

/**
 * @param {{
 *   deckId?: string,
 *   templateName: string,
 *   prompt?: string,
 *   count?: number,
 *   autoCreate?: boolean,
 * }} payload
 */
export async function generateAdminVocabulary(payload) {
	const body = await adminApi.post(ADMIN_AI.generateVocabulary, payload);
	return getApiData(body);
}

/**
 * @param {{
 *   deckId?: string,
 *   templateName: string,
 *   prompt?: string,
 *   count?: number,
 *   autoCreate?: boolean,
 * }} payload
 */
export async function generateAdminKanji(payload) {
	const body = await adminApi.post(ADMIN_AI.generateKanji, payload);
	return getApiData(body);
}

/**
 * @param {{
 *   templateName: string,
 *   prompt?: string,
 *   jlpt?: string,
 *   patternHint?: string,
 * }} payload
 */
export async function generateAdminGrammar(payload) {
	const body = await adminApi.post(ADMIN_AI.generateGrammar, payload);
	return getApiData(body);
}

/**
 * @param {{
 *   templateName: string,
 *   prompt?: string,
 *   jlpt?: string,
 * }} payload
 */
export async function generateAdminReading(payload) {
	const body = await adminApi.post(ADMIN_AI.generateReading, payload);
	return getApiData(body);
}

/**
 * @param {{
 *   templateName: string,
 *   prompt?: string,
 *   jlpt?: string,
 *   category?: string,
 * }} payload
 */
export async function generateAdminKaiwa(payload) {
	const body = await adminApi.post(ADMIN_AI.generateKaiwa, payload);
	return getApiData(body);
}

export async function testAdminAIConnection() {
	const body = await adminApi.get(ADMIN_AI.test);
	return getApiData(body);
}
