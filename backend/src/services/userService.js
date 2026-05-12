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
 * Get user statistics
 */
export const getUserStatistics = async () => {
	return await userRepository.getUserStatistics();
};
