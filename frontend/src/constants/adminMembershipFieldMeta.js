/** Nhãn hiển thị gói membership (admin) */
export const MEMBERSHIP_TIER_OPTIONS = [
	{ value: 'free', label: 'Free' },
	{ value: 'pro', label: 'Pro' },
	{ value: 'ultra', label: 'Ultra' },
	{ value: 'ultimate', label: 'Ultimate' },
];

export const MEMBERSHIP_BILLING_OPTIONS = [
	{ value: 'free', label: 'Tặng bởi admin (không thu phí)' },
	{ value: 'yearly', label: 'Theo năm' },
	{ value: 'lifetime', label: 'Trọn đời' },
];

export const MEMBERSHIP_STATUS_OPTIONS = [
	{ value: 'active', label: 'Đang hoạt động' },
	{ value: 'expired', label: 'Hết hạn' },
];

export const CHECKOUT_STATUS_OPTIONS = [
	{ value: '', label: 'Tất cả' },
	{ value: 'pending', label: 'Chờ thanh toán' },
	{ value: 'paid', label: 'Đã thanh toán' },
	{ value: 'refunded', label: 'Đã hoàn tiền' },
	{ value: 'expired', label: 'Hết phiên' },
	{ value: 'cancelled', label: 'Đã hủy' },
];

/** @param {string} tierId */
export function membershipTierLabel(tierId) {
	return MEMBERSHIP_TIER_OPTIONS.find((t) => t.value === tierId)?.label ?? tierId;
}

/** @param {string} status */
export function checkoutStatusLabel(status) {
	return CHECKOUT_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}
