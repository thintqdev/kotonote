/**
 * Origin máy chủ Socket.IO.
 * Dev + API relative (`/api`): dùng cùng origin Vite để cookie httpOnly được gửi qua proxy.
 */
export function getSocketBaseUrl() {
	if (import.meta.env.DEV && typeof window !== 'undefined') {
		const api = import.meta.env.VITE_API_URL;
		if (!api || (typeof api === 'string' && api.startsWith('/'))) {
			return window.location.origin;
		}
	}

	const socketOrigin = import.meta.env.VITE_SOCKET_ORIGIN?.trim();
	if (socketOrigin) {
		try {
			const u = new URL(socketOrigin);
			return `${u.protocol}//${u.host}`;
		} catch {
			/* fall through */
		}
	}

	const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

	if (typeof api === 'string' && api.startsWith('/')) {
		const origin =
			import.meta.env.VITE_API_ORIGIN?.trim() || 'http://localhost:8000';
		try {
			const u = new URL(origin);
			return `${u.protocol}//${u.host}`;
		} catch {
			return 'http://localhost:8000';
		}
	}

	try {
		const u = new URL(api);
		return `${u.protocol}//${u.host}`;
	} catch {
		return 'http://localhost:8000';
	}
}
