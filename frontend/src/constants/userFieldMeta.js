/** Bám enum backend User.status / User.role / User.authProvider */

export const USER_STATUS_OPTIONS = [
	{ value: 'active', label: 'Hoạt động' },
	{ value: 'locked', label: 'Đã khóa' },
	{ value: 'suspended', label: 'Tạm ngưng' },
];

export const USER_ROLE_OPTIONS = [
	{ value: 'user', label: 'Người dùng' },
	{ value: 'admin', label: 'Quản trị' },
];

export const AUTH_PROVIDER_OPTIONS = [
	{ value: 'local', label: 'Email / mật khẩu' },
	{ value: 'google', label: 'Google' },
];

export function userStatusLabel(value) {
	return USER_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function userRoleLabel(value) {
	return USER_ROLE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function authProviderLabel(value) {
	return AUTH_PROVIDER_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
