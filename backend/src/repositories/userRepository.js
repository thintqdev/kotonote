import mongoose from 'mongoose';
import User from '../models/User.js';
import { USER_STATUS } from '../constants/userStatus.js';

export const findUserByEmail = async (email) => {
	return await User.findOne({ email });
};

export const findUserByGoogleId = async (googleId) => {
	return await User.findOne({ googleId });
};

export const createUser = async (userData) => {
	const user = new User(userData);
	return await user.save();
};

export const findUserById = async (userId) => {
	return await User.findById(userId).select('-password');
};

/** Có hash mật khẩu — dùng cho đổi mật khẩu (không dùng `.select('-password')`). */
export const findUserByIdWithPassword = async (userId) => {
	return await User.findById(userId);
};

export const findUserByVerificationToken = async (token) => {
	return await User.findOne({
		emailVerificationToken: token,
		emailVerificationExpires: { $gt: Date.now() },
	});
};

// ============ ADMIN USER MANAGEMENT ============

/**
 * Get all users with filters (admin)
 */
export const getAllUsers = async (filters = {}) => {
	const { status, role, authProvider, search, page = 1, limit = 20 } = filters;
	
	const query = {};
	
	if (status) query.status = status;
	if (role) query.role = role;
	if (authProvider) query.authProvider = authProvider;
	if (search) {
		query.$or = [
			{ email: { $regex: search, $options: 'i' } },
			{ name: { $regex: search, $options: 'i' } },
		];
	}
	
	const skip = (page - 1) * limit;
	
	const [users, total] = await Promise.all([
		User.find(query)
			.select('-password -emailVerificationToken -emailVerificationExpires')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		User.countDocuments(query),
	]);
	
	return {
		users,
		total,
		page: parseInt(page),
		totalPages: Math.ceil(total / limit),
	};
};

/**
 * Find user by ID (admin view with more details)
 */
export const findUserByIdAdmin = async (userId) => {
	return await User.findById(userId).select('-password');
};

/**
 * Update user status
 */
export const updateUserStatus = async (userId, status) => {
	const updates = { status };
	
	// Reset lock if status is being set to active
	if (status === USER_STATUS.ACTIVE) {
		updates.loginAttempts = 0;
		updates.lockUntil = null;
	}
	
	return await User.findByIdAndUpdate(
		userId,
		updates,
		{ new: true, runValidators: true }
	).select('-password');
};

/**
 * Cập nhật cùng một `status` cho nhiều user (chỉ các _id hợp lệ trong DB).
 * @param {import('mongoose').Types.ObjectId[]} objectIds
 * @param {string} status
 * @returns {Promise<import('mongoose').mongodb.UpdateResult>}
 */
export const bulkUpdateUsersStatus = async (objectIds, status) => {
	if (!objectIds?.length) {
		return { matchedCount: 0, modifiedCount: 0 };
	}
	const filter = { _id: { $in: objectIds } };
	const updateDoc =
		status === USER_STATUS.ACTIVE
			? { $set: { status, loginAttempts: 0 }, $unset: { lockUntil: 1 } }
			: { $set: { status } };

	return await User.updateMany(filter, updateDoc, { runValidators: true });
};

/**
 * Get user statistics
 */
export const getUserStatistics = async () => {
	const [
		totalUsers,
		activeUsers,
		lockedUsers,
		suspendedUsers,
		googleUsers,
		localUsers,
		verifiedUsers,
		recentUsers,
	] = await Promise.all([
		User.countDocuments(),
		User.countDocuments({ status: USER_STATUS.ACTIVE }),
		User.countDocuments({ status: USER_STATUS.LOCKED }),
		User.countDocuments({ status: USER_STATUS.SUSPENDED }),
		User.countDocuments({ authProvider: 'google' }),
		User.countDocuments({ authProvider: 'local' }),
		User.countDocuments({ isEmailVerified: true }),
		User.countDocuments({
			createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
		}),
	]);
	
	return {
		totalUsers,
		activeUsers,
		lockedUsers,
		suspendedUsers,
		googleUsers,
		localUsers,
		verifiedUsers,
		recentUsers,
		usersByStatus: {
			active: activeUsers,
			locked: lockedUsers,
			suspended: suspendedUsers,
		},
		usersByProvider: {
			google: googleUsers,
			local: localUsers,
		},
	};
};
