import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';

class UserService {
	async getUsers(page = 1, limit = 10, search = '') {
		const query = search ? { name: { $regex: search, $options: 'i' } } : {};
		
		const skip = (page - 1) * limit;
		const usersPromise = userRepository.findAll(query)
			.select('-password')
			.limit(Number(limit))
			.skip(skip)
			.sort({ createdAt: -1 })
			.lean();
			
		const countPromise = userRepository.count(query);
		
		const [users, count] = await Promise.all([usersPromise, countPromise]);
		
		return {
			users,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: count,
				pages: Math.ceil(count / limit)
			}
		};
	}

	async getUserById(id) {
		const user = await userRepository.findById(id).select('-password');
		if (!user) {
			throw new AppError('User not found', 404);
		}
		return user;
	}

	async createUser(userData) {
		const { email, name, password } = userData;
		
		const existingUser = await userRepository.findByEmail(email);
		if (existingUser) {
			throw new AppError('Email already registered', 400);
		}
		
		const user = await userRepository.create({ email, name, password });
		user.password = undefined; // Remove password from response
		return user;
	}

	async updateUser(id, updateData) {
		const user = await userRepository.update(id, updateData).select('-password');
		if (!user) {
			throw new AppError('User not found', 404);
		}
		return user;
	}

	async deleteUser(id) {
		const user = await userRepository.delete(id);
		if (!user) {
			throw new AppError('User not found', 404);
		}
		return user;
	}
}

export default new UserService();
