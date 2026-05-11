import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, search } = req.query;

	const query = search
		? { name: { $regex: search, $options: 'i' } }
		: {};

	const users = await User.find(query)
		.select('-password')
		.limit(limit * 1)
		.skip((page - 1) * limit)
		.sort({ createdAt: -1 })
		.lean();

	const count = await User.countDocuments(query);

	res.status(200).json({
		success: true,
		data: users,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total: count,
			pages: Math.ceil(count / limit)
		}
	});
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id).select('-password');

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	res.status(200).json({
		success: true,
		data: user
	});
});

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Public
 */
export const createUser = asyncHandler(async (req, res) => {
	const { email, name, password } = req.body;

	// Check if user exists
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new AppError('Email already registered', 400);
	}

	const user = await User.create({ email, name, password });

	// Remove password from response
	user.password = undefined;

	res.status(201).json({
		success: true,
		message: 'User created successfully',
		data: user
	});
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
export const updateUser = asyncHandler(async (req, res, next) => {
	const { name, email } = req.body;

	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ name, email },
		{ new: true, runValidators: true }
	).select('-password');

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	res.status(200).json({
		success: true,
		message: 'User updated successfully',
		data: user
	});
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	res.status(200).json({
		success: true,
		message: 'User deleted successfully'
	});
});
