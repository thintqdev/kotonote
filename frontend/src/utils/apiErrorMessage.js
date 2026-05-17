import i18n from '../i18n.js';

const MSG_CODE_RE = /^MSG_\d+$/;

/**
 * @param {string} code
 * @param {(key: string, opts?: object) => string} [tFn]
 * @returns {string}
 */
export function translateMessageCode(code, tFn) {
	if (!code || typeof code !== 'string') {
		return '';
	}
	const trimmed = code.trim();
	if (!MSG_CODE_RE.test(trimmed)) {
		return trimmed;
	}

	const key = `message.${trimmed}`;
	const tr = tFn ?? ((k, opts) => i18n.t(k, opts));

	if (i18n.exists(key)) {
		return tr(key);
	}

	const fallbackKey = 'message.MSG_002';
	return i18n.exists(fallbackKey) ? tr(fallbackKey) : trimmed;
}

/**
 * Lấy thông báo lỗi hiển thị từ lỗi Axios, Error đã chuẩn hóa (api.js), hoặc mã MSG_*.
 * @param {unknown} error
 * @param {(key: string, opts?: object) => string} [tFn] — `t` từ useTranslation (tùy chọn)
 * @returns {string}
 */
export function getApiErrorMessage(error, tFn) {
	if (error && typeof error === 'object' && 'response' in error) {
		const data = /** @type {{ response?: { data?: Record<string, unknown> } }} */ (
			error
		).response?.data;
		if (data && typeof data === 'object') {
			const rawCode = data.messageCode;
			if (typeof rawCode === 'string' && rawCode.trim()) {
				return translateMessageCode(rawCode, tFn);
			}
			if (typeof data.message === 'string' && data.message.trim()) {
				return data.message.trim();
			}
		}
	}

	if (error && typeof error === 'object' && 'messageCode' in error) {
		const rawCode = /** @type {{ messageCode?: string }} */ (error).messageCode;
		if (typeof rawCode === 'string' && rawCode.trim()) {
			return translateMessageCode(rawCode, tFn);
		}
	}

	if (error instanceof Error && error.message) {
		const msg = error.message.trim();
		if (MSG_CODE_RE.test(msg)) {
			return translateMessageCode(msg, tFn);
		}
		return msg;
	}

	const fallbackKey = 'common.apiError';
	if (tFn) {
		return tFn(fallbackKey);
	}
	return i18n.t(fallbackKey, {
		defaultValue: 'Đã xảy ra lỗi, vui lòng thử lại.',
	});
}

/** @deprecated Dùng getApiErrorMessage */
export const getAxiosErrorMessage = getApiErrorMessage;
