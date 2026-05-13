import axios from 'axios';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';
import {
	clearAdminToken,
	clearUserToken,
	getAdminToken,
	getUserToken,
} from './tokenStorage.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
			return Promise.reject(new Error(getAxiosErrorMessage(error)));
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
