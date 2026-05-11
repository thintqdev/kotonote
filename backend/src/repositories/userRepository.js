import User from '../models/User.js';

class UserRepository {
	findAll(query = {}) {
		return User.find(query);
	}

	findById(id) {
		return User.findById(id);
	}

	findByEmail(email) {
		return User.findByEmail(email);
	}

	create(userData) {
		return User.create(userData);
	}

	update(id, updateData) {
		return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
	}

	delete(id) {
		return User.findByIdAndDelete(id);
	}

	count(query = {}) {
		return User.countDocuments(query);
	}
}

export default new UserRepository();
