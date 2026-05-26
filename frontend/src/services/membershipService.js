import { MEMBERSHIP } from '../constants/apiEndpoints.js';
import api from './api.js';

export async function getMembershipPlans() {
	const body = await api.get(MEMBERSHIP.PLANS);
	return body.data?.plans ?? [];
}

export async function getMyMembership() {
	const body = await api.get(MEMBERSHIP.ME);
	return body.data?.membership ?? null;
}

/**
 * @param {{ page?: number, limit?: number, status?: string }} [params]
 */
export async function getMembershipCheckoutHistory(params = {}) {
	const body = await api.get(MEMBERSHIP.CHECKOUT_HISTORY, { params });
	return {
		checkouts: body.data?.checkouts ?? [],
		pagination: body.data?.pagination ?? null,
	};
}

/**
 * @param {{ tierId: string, billing: 'yearly'|'lifetime' }} payload
 */
export async function createMembershipCheckout(payload) {
	const body = await api.post(MEMBERSHIP.CHECKOUT, payload);
	return body.data?.checkout ?? null;
}

/**
 * @param {string} checkoutId
 */
export async function getMembershipCheckoutStatus(checkoutId) {
	const body = await api.get(MEMBERSHIP.checkoutStatus(checkoutId));
	return body.data ?? {};
}

export async function confirmMembershipCheckout(checkoutId) {
	const body = await api.post(MEMBERSHIP.confirmCheckout(checkoutId));
	return body.data ?? {};
}

export async function getMembershipCheckoutReceipt(checkoutId) {
	const body = await api.get(MEMBERSHIP.checkoutReceipt(checkoutId));
	return body.data?.receipt ?? null;
}
