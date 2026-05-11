import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Verify JWT token and attach user to request
 */
export const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (req.headers.authorization?.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(new AppError('Not authorized, please login', 401));
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decoded.id).select('-password');

		if (!req.user) {
			return next(new AppError('User not found', 401));
		}

		next();
	} catch (error) {
		return next(new AppError('Invalid token', 401));
	}
});

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError('You do not have permission', 403));
		}
		next();
	};
};
