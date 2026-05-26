import Feedback from '../models/Feedback.js';

export const createFeedback = async (data) => {
	const doc = new Feedback(data);
	return doc.save();
};

export const countUserFeedbackSince = async (userId, sinceDate) => {
	return Feedback.countDocuments({
		userId,
		createdAt: { $gte: sinceDate },
	});
};

export const findFeedbackById = async (id) => {
	return Feedback.findById(id).populate('userId', 'name email');
};

export const listFeedbackByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
	const skip = (page - 1) * limit;
	const query = { userId };
	const [items, total] = await Promise.all([
		Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
		Feedback.countDocuments(query),
	]);
	return {
		feedbacks: items,
		total,
		page: Number(page),
		totalPages: Math.ceil(total / limit) || 0,
	};
};

export const listFeedbackAdmin = async (filters = {}) => {
	const {
		status,
		category,
		search,
		page = 1,
		limit = 20,
	} = filters;

	const query = {};
	if (status) query.status = status;
	if (category) query.category = category;

	const skip = (Number(page) - 1) * Number(limit);

	let feedbackQuery = Feedback.find(query)
		.populate('userId', 'name email')
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(Number(limit));

	if (search?.trim()) {
		const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		feedbackQuery = Feedback.find({
			...query,
			$or: [{ message: re }, { pageUrl: re }],
		})
			.populate('userId', 'name email')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit));
	}

	const countQuery =
		search?.trim()
			? {
					...query,
					$or: [
						{
							message: new RegExp(
								search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
								'i'
							),
						},
						{
							pageUrl: new RegExp(
								search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
								'i'
							),
						},
					],
				}
			: query;

	const [feedbacks, total] = await Promise.all([
		feedbackQuery,
		Feedback.countDocuments(countQuery),
	]);

	return {
		feedbacks,
		total,
		page: Number(page),
		totalPages: Math.ceil(total / Number(limit)) || 0,
	};
};

export const updateFeedbackStatus = async (id, { status, adminNote }) => {
	const update = { status };
	if (adminNote !== undefined) {
		update.adminNote = adminNote;
	}
	return Feedback.findByIdAndUpdate(id, update, {
		new: true,
		runValidators: true,
	}).populate('userId', 'name email');
};
