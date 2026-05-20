import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import * as authService from '../services/authService.js';
import {
	clearUserToken,
	getUserToken,
	setUserToken,
} from '../services/tokenStorage.js';
import { needsEmailVerification } from '../utils/authVerification.js';
import { translateMessageCode } from '../utils/apiErrorMessage.js';

const AuthContext = createContext();

/**
 * Auth Context Provider
 */
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const token = getUserToken();
			if (token) {
				try {
					const { user: profile } = await authService.fetchCurrentUser();
					if (!cancelled) {
						if (needsEmailVerification(profile)) {
							clearUserToken();
							setUser(null);
						} else {
							setUser(profile);
						}
					}
				} catch {
					if (!cancelled) {
						clearUserToken();
						setUser(null);
					}
				}
			}
			if (!cancelled) {
				setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const login = async (email, password, remember = true) => {
		const { user: nextUser, token } = await authService.login({
			email,
			password,
		});
		if (needsEmailVerification(nextUser)) {
			clearUserToken();
			setUser(null);
			const err = new Error(translateMessageCode('MSG_113'));
			/** @type {Error & { messageCode?: string }} */ (err).messageCode = 'MSG_113';
			throw err;
		}
		setUserToken(token, remember);
		setUser(nextUser);
		return { user: nextUser, token };
	};

	/** Đăng ký — không đăng nhập; chờ xác minh email. */
	const signUp = useCallback(async (name, email, password) => {
		clearUserToken();
		setUser(null);
		return authService.register({ name, email, password });
	}, []);

	/** Sau khi bấm link trong email — đăng nhập và vào khảo sát. */
	const completeEmailVerification = useCallback(async (token, remember = true) => {
		const { user: nextUser, token: jwt } = await authService.verifyEmail(token);
		setUserToken(jwt, remember);
		setUser(nextUser);
		return { user: nextUser, token: jwt };
	}, []);

	const logout = () => {
		clearUserToken();
		setUser(null);
	};

	const refreshUser = useCallback(async (axiosConfig = {}) => {
		const token = getUserToken();
		if (!token) return null;
		try {
			const { user: next } = await authService.fetchCurrentUser(axiosConfig);
			setUser(next);
			return next;
		} catch {
			return null;
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				signUp,
				completeEmailVerification,
				logout,
				setUser,
				refreshUser,
			}}
		>
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
