import { STORAGE_KEYS } from '../constants/storageKeys.js';

export function getUserToken() {
	return (
		sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN) ||
		localStorage.getItem(STORAGE_KEYS.USER_TOKEN)
	);
}

/**
 * @param {string} token
 * @param {boolean} [remember=true] — true: localStorage; false: chỉ phiên (sessionStorage)
 */
export function setUserToken(token, remember = true) {
	if (remember) {
		sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
		localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
	} else {
		localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
		sessionStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
	}
}

export function clearUserToken() {
	sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
	localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
}

/**
 * @param {string} token
 * @param {boolean} remember — true: localStorage, false: sessionStorage
 */
export function setAdminToken(token, remember) {
	if (remember) {
		sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
		localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
	} else {
		localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
		sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
	}
}

export function getAdminToken() {
	return (
		sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) ||
		localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)
	);
}

export function clearAdminToken() {
	sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
	localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
}
