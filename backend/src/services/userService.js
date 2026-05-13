import mongoose from 'mongoose';
import * as userRepository from '../repositories/userRepository.js';
import { USER } from '../constants/messages.js';
import { USER_STATUS } from '../constants/userStatus.js';

export const getCurrentUser = async (userId) => {
	const user = await userRepository.findUserById(userId);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	return user;
};

export const updateProfile = async (userId, updateData) => {
	const user = await userRepository.findUserById(userId);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	// Only allow updating certain fields
	const allowedFields = ['name', 'avatar'];
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			user[key] = updateData[key];
		}
	});
	
	await user.save();
	
	return user;
};

// ============ ADMIN USER MANAGEMENT ============

/**
 * Get all users with filters
 */
export const getAllUsers = async (filters = {}) => {
	return await userRepository.getAllUsers(filters);
};

/**
 * Get user by ID (admin view)
 */
export const getUserById = async (userId) => {
	const user = await userRepository.findUserByIdAdmin(userId);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	return user;
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (userId, status) => {
	const validStatuses = Object.values(USER_STATUS);
	
	if (!validStatuses.includes(status)) {
		throw { messageCode: USER.UPDATED, statusCode: 400 };
	}
	
	const user = await userRepository.updateUserStatus(userId, status);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	return user;
};

/**
 * Cập nhật trạng thái hàng loạt (admin).
 * Bỏ qua id không phải ObjectId, id không tồn tại, và **không** áp dụng lên chính admin đang thao tác (`actorUserId`).
 * @param {string[]} userIds
 * @param {string} status
 * @param {string} [actorUserId] — req.user._id dạng string
 */
export const bulkUpdateUsersStatus = async (userIds, status, actorUserId) => {
	const validStatuses = Object.values(USER_STATUS);
	if (!validStatuses.includes(status)) {
		throw { messageCode: USER.UPDATED, statusCode: 400 };
	}

	const unique = [...new Set((userIds || []).map((id) => String(id).trim()).filter(Boolean))];

	const invalidFormatIds = [];
	const validHexIds = [];
	for (const id of unique) {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			invalidFormatIds.push(id);
			continue;
		}
		if (new mongoose.Types.ObjectId(id).toString() !== id) {
			invalidFormatIds.push(id);
			continue;
		}
		if (actorUserId && id === String(actorUserId)) {
			continue;
		}
		validHexIds.push(id);
	}

	const objectIds = validHexIds.map((id) => new mongoose.Types.ObjectId(id));
	const result = await userRepository.bulkUpdateUsersStatus(objectIds, status);

	const skippedSelfCount = actorUserId
		? unique.filter((id) => id === String(actorUserId)).length
		: 0;

	return {
		status,
		requested: unique.length,
		eligibleIdCount: validHexIds.length,
		matchedCount: result.matchedCount ?? 0,
		modifiedCount: result.modifiedCount ?? 0,
		notFoundIdCount: Math.max(0, validHexIds.length - (result.matchedCount ?? 0)),
		invalidFormatIds,
		skippedSelfCount,
	};
};

/**
 * Get user statistics
 */
export const getUserStatistics = async () => {
	return await userRepository.getUserStatistics();
};
