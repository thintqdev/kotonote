import { getSocketBaseUrl } from './socketBaseUrl.js';

const BLOCKED_SCHEME_RE = /^(javascript|vbscript)(?::|&)/i;

/** @returns {Set<string>} */
function getAllowedMediaOrigins() {
	const origins = new Set();
	try {
		origins.add(new URL(getSocketBaseUrl()).origin);
	} catch {
		/* ignore */
	}
	const apiOrigin = import.meta.env.VITE_API_ORIGIN?.trim();
	if (apiOrigin) {
		try {
			origins.add(new URL(apiOrigin).origin);
		} catch {
			/* ignore */
		}
	}
	const minioOrigin = import.meta.env.VITE_MINIO_PUBLIC_ORIGIN?.trim();
	if (minioOrigin) {
		try {
			origins.add(new URL(minioOrigin).origin);
		} catch {
			/* ignore */
		}
	}
	if (typeof window !== 'undefined' && window.location?.origin) {
		origins.add(window.location.origin);
	}
	return origins;
}

/**
 * URL đầy đủ để hiển thị media từ API (avatar, v.v.).
 * Chỉ cho path nội bộ, data:image/*, hoặc http(s) từ origin tin cậy.
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function resolvePublicMediaUrl(value) {
	if (value == null || value === '') return null;
	const s = String(value).trim();
	if (!s || BLOCKED_SCHEME_RE.test(s)) return null;

	if (s.startsWith('data:')) {
		return s.startsWith('data:image/') ? s : null;
	}

	if (s.startsWith('http://') || s.startsWith('https://')) {
		try {
			const u = new URL(s);
			if (!getAllowedMediaOrigins().has(u.origin)) return null;
			return u.href;
		} catch {
			return null;
		}
	}

	if (s.startsWith('/')) {
		if (s.startsWith('//') || s.startsWith('/\\')) return null;
		const origin = getSocketBaseUrl();
		return `${origin}${s}`;
	}

	return null;
}

/** Alias — avatar user lưu trên server dạng path hoặc URL tuyệt đối */
export const resolveAvatarUrl = resolvePublicMediaUrl;

/** Có thể hiển thị làm src ảnh đại diện (path, URL tin cậy, data:image). */
export function isResolvableAvatar(value) {
	return resolvePublicMediaUrl(value) != null;
}
