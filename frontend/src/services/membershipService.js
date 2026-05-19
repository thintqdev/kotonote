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
 * @param {{ tierId: string, billing: 'yearly'|'lifetime' }} payload
 */
export async function createMembershipCheckout(payload) {
	const body = await api.post(MEMBERSHIP.CHECKOUT, payload);
	return body.data?.checkout ?? null;
}

/**
 * @param {string} checkoutId
 */
export async function confirmMembershipCheckout(checkoutId) {
	const body = await api.post(MEMBERSHIP.confirmCheckout(checkoutId));
	return body.data ?? {};
}
