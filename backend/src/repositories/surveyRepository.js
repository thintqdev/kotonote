import Survey from '../models/Survey.js';

export const findSurveyByUserId = async (userId) => {
	return await Survey.findOne({ userId });
};

export const createSurvey = async (surveyData) => {
	const survey = new Survey(surveyData);
	return await survey.save();
};

export const updateSurvey = async (userId, updateData) => {
	return await Survey.findOneAndUpdate(
		{ userId },
		{ ...updateData, completedAt: Date.now() },
		{ new: true, runValidators: true }
	);
};

export const getAllSurveys = async (filters = {}) => {
	return await Survey.find(filters).populate('userId', 'name email');
};

export const getSurveyStats = async () => {
	const stats = await Survey.aggregate([
		{
			$group: {
				_id: null,
				totalSurveys: { $sum: 1 },
				levelDistribution: {
					$push: '$level',
				},
				goalDistribution: {
					$push: '$goal',
				},
			},
		},
	]);
	
	return stats[0] || { totalSurveys: 0 };
};
