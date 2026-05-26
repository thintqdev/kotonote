import { ADMIN_MEMBERSHIPS } from '../constants/apiEndpoints.js';
import { getApiData } from '../utils/apiEnvelope.js';
import { adminApi } from './api.js';

export async function getAdminMembershipStatistics() {
	const body = await adminApi.get(ADMIN_MEMBERSHIPS.statistics);
	return getApiData(body);
}

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminMembershipUsers(params = {}) {
	const body = await adminApi.get(ADMIN_MEMBERSHIPS.users, { params });
	return getApiData(body);
}

/**
 * @param {Record<string, unknown>} [params]
 */
export async function listAdminMembershipCheckouts(params = {}) {
	const body = await adminApi.get(ADMIN_MEMBERSHIPS.checkouts, { params });
	return getApiData(body);
}

/**
 * @param {string} userId
 * @param {{ tierId: string, billing: string, status: string, expiresAt?: string|null }} payload
 */
export async function patchAdminUserMembership(userId, payload) {
	const body = await adminApi.patch(ADMIN_MEMBERSHIPS.user(userId), payload);
	return getApiData(body);
}

export async function getAdminCheckoutReceipt(checkoutId) {
	const body = await adminApi.get(ADMIN_MEMBERSHIPS.checkoutReceipt(checkoutId));
	return getApiData(body)?.receipt ?? null;
}

/**
 * @param {string} checkoutId
 * @param {{ reason?: string, revokeMembership?: boolean }} payload
 */
export async function refundAdminCheckout(checkoutId, payload = {}) {
	const body = await adminApi.post(
		ADMIN_MEMBERSHIPS.refundCheckout(checkoutId),
		payload,
	);
	return getApiData(body);
}
