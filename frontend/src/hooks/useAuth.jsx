import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import * as authService from '../services/authService.js';
import { clearLegacyStoredTokens } from '../services/tokenStorage.js';
import { needsEmailVerification } from '../utils/authVerification.js';
import { translateMessageCode } from '../utils/apiErrorMessage.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		clearLegacyStoredTokens();
	}, []);

	useEffect(() => {
		let cancelled = false;
		const path =
			typeof window !== 'undefined' ? window.location.pathname : '';
		/** Admin Studio / trang pháp lý công khai — không gọi /users/me. */
		if (
			path.startsWith('/admin') ||
			path === '/terms' ||
			path === '/privacy'
		) {
			setLoading(false);
			return undefined;
		}
		(async () => {
			try {
				const { user: profile } = await authService.fetchCurrentUser();
				if (!cancelled) {
					if (needsEmailVerification(profile)) {
						setUser(null);
					} else {
						setUser(profile);
					}
				}
			} catch {
				if (!cancelled) {
					setUser(null);
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

	const login = async (email, password, remember = false) => {
		const { user: nextUser } = await authService.login({
			email,
			password,
			remember,
		});
		if (needsEmailVerification(nextUser)) {
			setUser(null);
			const err = new Error(translateMessageCode('MSG_113'));
			/** @type {Error & { messageCode?: string }} */ (err).messageCode = 'MSG_113';
			throw err;
		}
		setUser(nextUser);
		return { user: nextUser };
	};

	const loginWithGoogle = async (googleIdToken, remember = false, password) => {
		const { user: nextUser } = await authService.googleLogin({
			token: googleIdToken,
			remember,
			...(password ? { password } : {}),
		});
		if (needsEmailVerification(nextUser)) {
			setUser(null);
			const err = new Error(translateMessageCode('MSG_113'));
			/** @type {Error & { messageCode?: string }} */ (err).messageCode = 'MSG_113';
			throw err;
		}
		setUser(nextUser);
		return { user: nextUser };
	};

	const signUp = useCallback(async (name, email, password) => {
		setUser(null);
		return authService.register({ name, email, password });
	}, []);

	const completeEmailVerification = useCallback(async (token) => {
		const { user: nextUser } = await authService.verifyEmail(token);
		setUser(nextUser);
		return { user: nextUser };
	}, []);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch {
			/* ignore */
		}
		setUser(null);
	}, []);

	const refreshUser = useCallback(async (axiosConfig = {}) => {
		try {
			const { user: next } = await authService.fetchCurrentUser(axiosConfig);
			setUser(next);
			return next;
		} catch {
			setUser(null);
			return null;
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				loginWithGoogle,
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

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};
