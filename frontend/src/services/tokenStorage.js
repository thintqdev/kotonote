import { STORAGE_KEYS } from '../constants/storageKeys.js';

/** Xóa JWT cũ trong localStorage/sessionStorage (migration sang httpOnly cookie). */
export function clearLegacyStoredTokens() {
	if (typeof window === 'undefined') return;
	for (const key of Object.values(STORAGE_KEYS)) {
		localStorage.removeItem(key);
		sessionStorage.removeItem(key);
	}
}

/** @deprecated JWT nằm trong httpOnly cookie — luôn null. */
export function getUserToken() {
	return null;
}

/** @deprecated */
export function setUserToken() {}

/** @deprecated */
export function clearUserToken() {
	clearLegacyStoredTokens();
}

/** @deprecated */
export function setAdminToken() {}

/** @deprecated JWT admin trong httpOnly cookie — luôn null. */
export function getAdminToken() {
	return null;
}

/** @deprecated */
export function clearAdminToken() {
	clearLegacyStoredTokens();
}
