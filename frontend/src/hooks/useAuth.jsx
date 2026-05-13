import { useState, useEffect, createContext, useContext } from 'react';
import * as authService from '../services/authService.js';
import {
	clearUserToken,
	getUserToken,
	setUserToken,
} from '../services/tokenStorage.js';

const AuthContext = createContext();

/**
 * Auth Context Provider
 */
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const ac = new AbortController();
		(async () => {
			const token = getUserToken();
			if (token) {
				try {
					const { user: profile } = await authService.fetchCurrentUser({
						signal: ac.signal,
					});
					if (!ac.signal.aborted) {
						setUser(profile);
					}
				} catch {
					if (!ac.signal.aborted) {
						clearUserToken();
					}
				}
			}
			if (!ac.signal.aborted) {
				setLoading(false);
			}
		})();
		return () => ac.abort();
	}, []);

	const login = async (email, password, remember = true) => {
		const { user: nextUser, token } = await authService.login({
			email,
			password,
		});
		setUserToken(token, remember);
		setUser(nextUser);
		return { user: nextUser, token };
	};

	const register = async (name, email, password, remember = true) => {
		const { user: nextUser, token } = await authService.register({
			name,
			email,
			password,
		});
		setUserToken(token, remember);
		setUser(nextUser);
		return { user: nextUser, token };
	};

	const logout = () => {
		clearUserToken();
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
