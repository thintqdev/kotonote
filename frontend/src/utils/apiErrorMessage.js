import i18n from '../i18n.js';

/**
 * Quy đổi mã backend (vd. MSG_108) sang chuỗi theo ngôn ngữ hiện tại (vi.json / ja.json → message.*).
 * @param {string} code
 * @returns {string}
 */
export function translateMessageCode(code) {
	if (!code || typeof code !== 'string') {
		return '';
	}
	const trimmed = code.trim();
	if (!trimmed) {
		return '';
	}
	return i18n.t(`message.${trimmed}`, { defaultValue: trimmed });
}

/**
 * Lấy thông báo lỗi hiển thị cho người dùng từ lỗi Axios / backend.
 * Ưu tiên messageCode → bản dịch; sau đó message chữ thường (legacy).
 * @param {unknown} error
 * @returns {string}
 */
export function getAxiosErrorMessage(error) {
	const res =
		error && typeof error === 'object' && 'response' in error
			? /** @type {{ response?: { data?: Record<string, unknown> } }} */ (error)
					.response
			: undefined;
	const data = res?.data;
	if (data && typeof data === 'object') {
		const rawCode = data.messageCode;
		if (typeof rawCode === 'string' && rawCode.trim()) {
			return translateMessageCode(rawCode);
		}
		if (typeof data.message === 'string' && data.message.trim()) {
			return data.message;
		}
	}
	if (error instanceof Error && error.message) {
		return translateMessageCode(error.message) || error.message;
	}
	return 'Đã xảy ra lỗi, vui lòng thử lại.';
}
