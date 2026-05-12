import { getAdminToken } from '../services/tokenStorage.js';

/**
 * Lấy `userId` từ JWT admin (payload do backend ký: `{ userId }`).
 * @returns {string | null}
 */
export function getAdminJwtUserId() {
	const token = getAdminToken();
	if (!token) return null;
	try {
		const part = token.split('.')[1];
		if (!part) return null;
		const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
		const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
		const json = JSON.parse(atob(padded));
		return json.userId != null ? String(json.userId) : null;
	} catch {
		return null;
	}
}
