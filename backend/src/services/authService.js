import User from '../models/User.js';
import * as userRepository from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwt.js';
import { AUTH, USER, COMMON } from '../constants/messages.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { generateVerificationToken, hashToken } from '../utils/token.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';
import { USER_STATUS, AUTH_PROVIDER, TOKEN_EXPIRY, USER_ROLE } from '../constants/userStatus.js';
import { enrichUserWithBadges } from './userService.js';

export const register = async (userData) => {
	const existingUser = await userRepository.findUserByEmail(userData.email);

	if (existingUser) {
		throw { messageCode: AUTH.EMAIL_ALREADY_REGISTERED, statusCode: 409 };
	}

	const verificationToken = generateVerificationToken();
	const hashedToken = hashToken(verificationToken);

	const user = await userRepository.createUser({
		email: userData.email,
		password: userData.password,
		name: userData.name,
		authProvider: userData.authProvider ?? AUTH_PROVIDER.LOCAL,
		isActive: true,
		status: USER_STATUS.ACTIVE,
		isEmailVerified: false,
		emailVerificationToken: hashedToken,
		emailVerificationExpires: Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION,
	});

	const emailSent = await sendVerificationEmail(
		user.email,
		user.name,
		verificationToken,
	);

	if (!emailSent) {
		throw { messageCode: COMMON.SERVER_ERROR, statusCode: 503 };
	}

	return {
		email: user.email,
		messageCode: AUTH.VERIFICATION_EMAIL_SENT,
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
		user: await enrichUserWithBadges(user),
		token,
	};
};

/**
 * Đổi mật khẩu (tài khoản có mật khẩu cục bộ). Sai mật khẩu hiện tại → 400 (tránh 401 làm client xóa JWT).
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
	const user = await userRepository.findUserByIdWithPassword(userId);

	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}

	if (!user.password) {
		throw { messageCode: AUTH.PASSWORD_CHANGE_NOT_ALLOWED, statusCode: 403 };
	}

	const valid = await user.comparePassword(currentPassword);
	if (!valid) {
		throw { messageCode: AUTH.PASSWORD_INCORRECT, statusCode: 400 };
	}

	user.password = newPassword;
	await user.save();

	return { messageCode: AUTH.PASSWORD_CHANGED };
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
			user.isEmailVerified = true;
			user.lastLogin = Date.now();
			await user.save();
		} else {
			user = await userRepository.createUser({
				email: googleUser.email,
				name: googleUser.name,
				avatar: googleUser.avatar,
				googleId: googleUser.googleId,
				authProvider: AUTH_PROVIDER.GOOGLE,
				isEmailVerified: true,
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
		user: await enrichUserWithBadges(user),
		token,
	};
};

export const verifyEmail = async (token) => {
	const raw = String(token || '').trim();
	if (!raw) {
		throw { messageCode: AUTH.VERIFICATION_TOKEN_INVALID, statusCode: 400 };
	}

	const hashedToken = hashToken(raw);

	const user = await User.findOneAndUpdate(
		{
			emailVerificationToken: hashedToken,
			emailVerificationExpires: { $gt: new Date() },
			isEmailVerified: { $ne: true },
		},
		{
			$set: { isEmailVerified: true, isActive: true },
			$unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
		},
		{ new: true },
	);

	if (user) {
		const jwtToken = generateToken(user._id);
		return {
			user: await enrichUserWithBadges(user),
			token: jwtToken,
		};
	}

	const stale = await User.findOne({ emailVerificationToken: hashedToken });
	if (stale?.isEmailVerified) {
		const jwtToken = generateToken(stale._id);
		return {
			user: await enrichUserWithBadges(stale),
			token: jwtToken,
		};
	}
	if (stale) {
		throw { messageCode: AUTH.TOKEN_EXPIRED, statusCode: 400 };
	}

	throw { messageCode: AUTH.VERIFICATION_TOKEN_INVALID, statusCode: 400 };
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

/**
 * Quên mật khẩu — luôn trả thành công (không lộ email có tồn tại).
 * Chỉ gửi mail nếu user local có mật khẩu.
 */
export const requestPasswordReset = async (email) => {
	const normalized = String(email || '').trim().toLowerCase();
	const user = await userRepository.findUserByEmail(normalized);

	if (
		user &&
		user.password &&
		user.authProvider === AUTH_PROVIDER.LOCAL &&
		user.isActive &&
		user.status !== USER_STATUS.SUSPENDED
	) {
		const resetToken = generateVerificationToken();
		const hashedToken = hashToken(resetToken);

		user.passwordResetToken = hashedToken;
		user.passwordResetExpires = Date.now() + TOKEN_EXPIRY.PASSWORD_RESET;
		await user.save();

		await sendPasswordResetEmail(user.email, user.name, resetToken);
	}

	return { messageCode: AUTH.PASSWORD_RESET_EMAIL_SENT };
};

export const resetPassword = async (token, newPassword) => {
	const hashedToken = hashToken(token);
	const user = await userRepository.findUserByPasswordResetToken(hashedToken);

	if (!user) {
		throw { messageCode: AUTH.VERIFICATION_TOKEN_INVALID, statusCode: 400 };
	}

	if (user.passwordResetExpires < Date.now()) {
		throw { messageCode: AUTH.TOKEN_EXPIRED, statusCode: 400 };
	}

	user.password = newPassword;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	user.loginAttempts = 0;
	user.lockUntil = undefined;
	if (user.status === USER_STATUS.LOCKED) {
		user.status = USER_STATUS.ACTIVE;
	}
	await user.save();

	return { messageCode: AUTH.PASSWORD_RESET_SUCCESS };
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
