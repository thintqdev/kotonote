import { getSocketBaseUrl } from './socketBaseUrl.js';

/**
 * URL đầy đủ để hiển thị media từ API (avatar, v.v.).
 * — `http(s)://…`, `data:…` giữ nguyên
 * — đường dẫn tuyệt đối `/uploads/…` nối **origin backend** (cùng host với API / static).
 *   Dùng `getSocketBaseUrl()` để đúng khi `VITE_API_URL` tuyệt đối hoặc tương đối (`/api` + `VITE_API_ORIGIN`).
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function resolvePublicMediaUrl(value) {
	if (value == null || value === '') return null;
	const s = String(value).trim();
	if (!s) return null;
	if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) {
		return s;
	}
	if (s.startsWith('/')) {
		const origin = getSocketBaseUrl();
		return `${origin}${s}`;
	}
	return s;
}

/** Alias — avatar user lưu trên server dạng path hoặc URL tuyệt đối */
export const resolveAvatarUrl = resolvePublicMediaUrl;
