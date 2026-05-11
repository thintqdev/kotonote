import axios from 'axios';

const API = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
	headers: {
		'Content-Type': 'application/json'
	}
});

// Request interceptor
API.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
API.interceptors.response.use(
	(response) => response.data,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			window.location.href = '/login';
		}

		const message = error.response?.data?.message || error.message;
		return Promise.reject(new Error(message));
	}
);

export default API;
