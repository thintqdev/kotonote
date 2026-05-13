import * as userRepository from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwt.js';
import { AUTH } from '../constants/messages.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { generateVerificationToken, hashToken } from '../utils/token.js';
import { sendVerificationEmail } from './emailService.js';
import { USER_STATUS, AUTH_PROVIDER, TOKEN_EXPIRY, USER_ROLE } from '../constants/userStatus.js';

export const register = async (userData) => {
	const existingUser = await userRepository.findUserByEmail(userData.email);

	if (existingUser) {
		throw { messageCode: AUTH.REGISTER_FAILED, statusCode: 400 };
	}

	/** Luồng onboarding: đăng ký → khảo sát → app (không chặn bằng email). */
	const user = await userRepository.createUser({
		email: userData.email,
		password: userData.password,
		name: userData.name,
		authProvider: userData.authProvider ?? AUTH_PROVIDER.LOCAL,
		isActive: true,
		status: USER_STATUS.ACTIVE,
		isEmailVerified: true,
	});

	const token = generateToken(user._id);

	return {
		user: user.toJSON(),
		token,
		messageCode: AUTH.REGISTER_SUCCESS,
	};
};

export const login = async (email, password) => {
	const user = await userRepository.findUserByEmail(email);
	
	if (!user) {
		throw { messageCode: AUTH.EMAIL_NOT_FOUND, statusCode: 401 };
	}
	
	// Check if account is locked
	if (user.isLocked) {
		throw { messageCode: AUTH.ACCOUNT_LOCKED, statusCode: 423 };
	}
	
	// Check if account is suspended
	if (user.status === USER_STATUS.SUSPENDED) {
		throw { messageCode: AUTH.ACCOUNT_SUSPENDED, statusCode: 403 };
	}
	
	// Check if account is active
	if (!user.isActive) {
		throw { messageCode: AUTH.LOGIN_FAILED, statusCode: 403 };
	}
	
	// Check if email is verified (only for local auth)
	if (user.authProvider === AUTH_PROVIDER.LOCAL && !user.isEmailVerified) {
		throw { messageCode: AUTH.EMAIL_NOT_VERIFIED, statusCode: 403 };
	}
	
	const isPasswordValid = await user.comparePassword(password);
	
	if (!isPasswordValid) {
		await user.incLoginAttempts();
		throw { messageCode: AUTH.PASSWORD_INCORRECT, statusCode: 401 };
	}
	
	// Reset login attempts on successful login
	await user.resetLoginAttempts();
	
	const token = generateToken(user._id);
	
	return {
		user: user.toJSON(),
		token,
	};
};

export const googleLogin = async (googleToken) => {
	const googleUser = await verifyGoogleToken(googleToken);
	
	if (!googleUser || !googleUser.emailVerified) {
		throw { messageCode: AUTH.GOOGLE_AUTH_FAILED, statusCode: 401 };
	}
	
	let user = await userRepository.findUserByGoogleId(googleUser.googleId);
	
	if (!user) {
		user = await userRepository.findUserByEmail(googleUser.email);
		
		if (user) {
			// Check account status before linking
			if (user.status === USER_STATUS.SUSPENDED) {
				throw { messageCode: AUTH.ACCOUNT_SUSPENDED, statusCode: 403 };
			}
			
			user.googleId = googleUser.googleId;
			user.authProvider = AUTH_PROVIDER.GOOGLE;
			user.avatar = googleUser.avatar;
			user.lastLogin = Date.now();
			await user.save();
		} else {
			user = await userRepository.createUser({
				email: googleUser.email,
				name: googleUser.name,
				avatar: googleUser.avatar,
				googleId: googleUser.googleId,
				authProvider: AUTH_PROVIDER.GOOGLE,
				lastLogin: Date.now(),
			});
		}
	} else {
		// Check account status
		if (user.status === USER_STATUS.SUSPENDED) {
			throw { messageCode: AUTH.ACCOUNT_SUSPENDED, statusCode: 403 };
		}
		
		// Update last login
		user.lastLogin = Date.now();
		await user.save();
	}
	
	const token = generateToken(user._id);
	
	return {
		user: user.toJSON(),
		token,
	};
};

export const verifyEmail = async (token) => {
	const hashedToken = hashToken(token);
	
	const user = await userRepository.findUserByVerificationToken(hashedToken);
	
	if (!user) {
		throw { messageCode: AUTH.VERIFICATION_TOKEN_INVALID, statusCode: 400 };
	}
	
	if (user.emailVerificationExpires < Date.now()) {
		throw { messageCode: AUTH.TOKEN_EXPIRED, statusCode: 400 };
	}
	
	user.isEmailVerified = true;
	user.isActive = true;
	user.emailVerificationToken = undefined;
	user.emailVerificationExpires = undefined;
	await user.save();
	
	const jwtToken = generateToken(user._id);
	
	return {
		user: user.toJSON(),
		token: jwtToken,
	};
};

export const resendVerificationEmail = async (email) => {
	const user = await userRepository.findUserByEmail(email);
	
	if (!user) {
		throw { messageCode: AUTH.EMAIL_NOT_FOUND, statusCode: 404 };
	}
	
	if (user.isEmailVerified) {
		throw { messageCode: AUTH.EMAIL_VERIFIED_SUCCESS, statusCode: 400 };
	}
	
	const verificationToken = generateVerificationToken();
	const hashedToken = hashToken(verificationToken);
	
	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpires = Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION;
	await user.save();
	
	await sendVerificationEmail(user.email, user.name, verificationToken);
	
	return {
		messageCode: AUTH.VERIFICATION_EMAIL_SENT,
	};
};

export const adminLogin = async (email, password) => {
	const user = await userRepository.findUserByEmail(email);
	
	if (!user) {
		throw { messageCode: AUTH.EMAIL_NOT_FOUND, statusCode: 401 };
	}
	
	// Check if user is admin
	if (user.role !== USER_ROLE.ADMIN) {
		throw { messageCode: AUTH.LOGIN_FAILED, statusCode: 403 };
	}
	
	// Check if account is active
	if (!user.isActive) {
		throw { messageCode: AUTH.LOGIN_FAILED, statusCode: 403 };
	}
	
	const isPasswordValid = await user.comparePassword(password);
	
	if (!isPasswordValid) {
		throw { messageCode: AUTH.PASSWORD_INCORRECT, statusCode: 401 };
	}
	
	// Update last login only
	user.lastLogin = Date.now();
	await user.save();
	
	const token = generateToken(user._id);
	
	return {
		user: user.toJSON(),
		token,
	};
};
