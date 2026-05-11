import { useState, useEffect, createContext, useContext } from 'react';
import API from '../services/api.js';

const AuthContext = createContext();

/**
 * Auth Context Provider
 */
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const response = await API.get('/auth/me');
				setUser(response.data);
			} catch (error) {
				localStorage.removeItem('token');
			}
		}
		setLoading(false);
	};

	const login = async (email, password) => {
		const response = await API.post('/auth/login', { email, password });
		localStorage.setItem('token', response.data.token);
		setUser(response.data.user);
		return response;
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};
