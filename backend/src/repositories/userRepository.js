import User from '../models/User.js';

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

export const findUserByVerificationToken = async (token) => {
	return await User.findOne({
		emailVerificationToken: token,
		emailVerificationExpires: { $gt: Date.now() },
	});
};
