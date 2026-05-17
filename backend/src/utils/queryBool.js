/**
 * Parse boolean từ query string (Express luôn là string; axios có thể gửi boolean).
 * @param {unknown} value
 * @returns {boolean | undefined}
 */
export function parseQueryBool(value) {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}
	if (value === true || value === 'true' || value === '1' || value === 1) {
		return true;
	}
	if (value === false || value === 'false' || value === '0' || value === 0) {
		return false;
	}
	return undefined;
}

/** @param {import('express').Request} req */
export function isAdminRequest(req) {
	return req.user?.role === 'admin';
}
