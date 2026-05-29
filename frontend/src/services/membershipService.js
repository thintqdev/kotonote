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

/** Chặn double-click / gọi create trùng khi đang xử lý. */
let checkoutCreateInflight = null;

/**
 * Chỉ gọi từ MembershipPage khi user bấm nâng cấp — không gọi trong useEffect.
 * @param {{ tierId: string, billing: 'yearly'|'lifetime' }} payload
 */
export async function createMembershipCheckout(payload) {
	if (checkoutCreateInflight) {
		return checkoutCreateInflight;
	}

	checkoutCreateInflight = api
		.post(MEMBERSHIP.CHECKOUT, payload)
		.then((body) => body.data?.checkout ?? null)
		.finally(() => {
			checkoutCreateInflight = null;
		});

	return checkoutCreateInflight;
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

/**
 * @param {string} checkoutId
 * @param {{ note?: string }} [payload]
 */
export async function requestMembershipRefund(checkoutId, payload = {}) {
	const body = await api.post(MEMBERSHIP.refundRequest(checkoutId), payload);
	return body.data ?? null;
}
