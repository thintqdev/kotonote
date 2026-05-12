import * as userRepository from '../repositories/userRepository.js';
import { USER } from '../constants/messages.js';

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
