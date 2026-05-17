/**
 * Tài khoản local phải xác minh email trước khi dùng app / khảo sát.
 * @param {{ authProvider?: string, isEmailVerified?: boolean } | null | undefined} user
 */
export function needsEmailVerification(user) {
	if (!user) return false;
	const provider = user.authProvider || 'local';
	return provider === 'local' && user.isEmailVerified !== true;
}
