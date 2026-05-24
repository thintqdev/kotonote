import axios from 'axios';
import {
	getApiErrorMessage,
	translateMessageCode,
} from '../utils/apiErrorMessage.js';
import {
	clearAdminToken,
	clearUserToken,
	getAdminToken,
	getUserToken,
} from './tokenStorage.js';

/** Dev: `/api` qua Vite proxy → backend (xem VITE_API_PROXY_TARGET). */
const baseURL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.DEV ? '/api' : 'http://localhost:8000/api');

const defaultHeaders = {
	'Content-Type': 'application/json',
};

/**
 * @param {import('axios').AxiosInstance} instance
 * @param {{ getToken: () => string | null, clearToken: () => void, unauthorizedHref: string | null }} opts
 *   unauthorizedHref: null → không redirect; string → window.location khi 401 (và điều kiện path)
 */
function attachAuthInterceptors(instance, opts) {
	const { getToken, clearToken, unauthorizedHref } = opts;

	instance.interceptors.request.use(
		(config) => {
			const token = getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			if (
				typeof FormData !== 'undefined' &&
				config.data instanceof FormData
			) {
				if (config.headers) {
					delete config.headers['Content-Type'];
					delete config.headers['content-type'];
				}
			}
			return config;
		},
		(error) => Promise.reject(error)
	);

	instance.interceptors.response.use(
		(response) => response.data,
		(error) => {
			if (error.response?.status === 401) {
				clearToken();
				if (
					unauthorizedHref &&
					typeof window !== 'undefined'
				) {
					const path = window.location.pathname;
					if (unauthorizedHref === '/login') {
						if (
							!path.startsWith('/admin') &&
							path !== '/login' &&
							path !== '/register'
						) {
							window.location.href = unauthorizedHref;
						}
					} else if (unauthorizedHref === '/admin/login') {
						if (
							path.startsWith('/admin') &&
							path !== '/admin/login'
						) {
							window.location.href = unauthorizedHref;
						}
					}
				}
			}
			const code =
				typeof error.response?.data?.messageCode === 'string'
					? error.response.data.messageCode.trim()
					: '';
			const message = code
				? translateMessageCode(code)
				: getApiErrorMessage(error);
			const err = new Error(message);
			if (code) {
				/** @type {Error & { messageCode?: string }} */ (err).messageCode =
					code;
			}
			return Promise.reject(err);
		}
	);
}

/** Client cho người dùng app (JWT trong localStorage `token`) */
export const api = axios.create({
	baseURL,
	headers: { ...defaultHeaders },
});
attachAuthInterceptors(api, {
	getToken: getUserToken,
	clearToken: clearUserToken,
	unauthorizedHref: '/login',
});


export const adminApi = axios.create({
	baseURL,
	headers: { ...defaultHeaders },
});
attachAuthInterceptors(adminApi, {
	getToken: getAdminToken,
	clearToken: clearAdminToken,
	unauthorizedHref: '/admin/login',
});

export default api;
