import axios from 'axios';
import {
	getApiErrorMessage,
	translateMessageCode,
} from '../utils/apiErrorMessage.js';
import { isPublicAuthRoute } from '../constants/publicAuthRoutes.js';

/** Dev: `/api` qua Vite proxy → backend (xem VITE_API_PROXY_TARGET). */
const baseURL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.DEV ? '/api' : 'http://localhost:8000/api');

const defaultHeaders = {
	'Content-Type': 'application/json',
};

/**
 * @param {import('axios').AxiosInstance} instance
 * @param {{ unauthorizedHref: string | null }} opts
 */
function attachAuthInterceptors(instance, opts) {
	const { unauthorizedHref } = opts;

	instance.interceptors.request.use(
		(config) => {
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
		(error) => Promise.reject(error),
	);

	instance.interceptors.response.use(
		(response) => response.data,
		(error) => {
			if (error.response?.status === 401) {
				if (
					unauthorizedHref &&
					typeof window !== 'undefined'
				) {
					const path = window.location.pathname;
					if (unauthorizedHref === '/login') {
						if (
							!path.startsWith('/admin') &&
							!isPublicAuthRoute(path)
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
			const apiErrors = error.response?.data?.errors;
			if (Array.isArray(apiErrors) && apiErrors.length) {
				/** @type {Error & { apiErrors?: Array<{ field?: string, message?: string }> }} */ (
					err
				).apiErrors = apiErrors;
			}
			return Promise.reject(err);
		},
	);
}

/** Client user — JWT trong httpOnly cookie (`kn_user_session`). */
export const api = axios.create({
	baseURL,
	withCredentials: true,
	headers: { ...defaultHeaders },
});
attachAuthInterceptors(api, {
	unauthorizedHref: '/login',
});

/** Client admin — JWT trong httpOnly cookie (`kn_admin_session`). */
export const adminApi = axios.create({
	baseURL,
	withCredentials: true,
	headers: { ...defaultHeaders },
});
attachAuthInterceptors(adminApi, {
	unauthorizedHref: '/admin/login',
});

export default api;
