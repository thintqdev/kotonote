import * as surveyRepository from '../repositories/surveyRepository.js';
import { SURVEY } from '../constants/messages.js';

export const submitSurvey = async (userId, surveyData) => {
	// Check if user already completed survey
	const existingSurvey = await surveyRepository.findSurveyByUserId(userId);
	
	if (existingSurvey) {
		// Update existing survey
		const updatedSurvey = await surveyRepository.updateSurvey(userId, surveyData);
		return {
			survey: updatedSurvey,
			isNew: false,
		};
	}
	
	// Create new survey
	const survey = await surveyRepository.createSurvey({
		userId,
		...surveyData,
	});
	
	return {
		survey,
		isNew: true,
	};
};

export const getUserSurvey = async (userId) => {
	const survey = await surveyRepository.findSurveyByUserId(userId);
	
	if (!survey) {
		throw { messageCode: SURVEY.NOT_FOUND, statusCode: 404 };
	}
	
	return survey;
};

export const getAllSurveys = async (filters) => {
	return await surveyRepository.getAllSurveys(filters);
};

export const getSurveyStatistics = async () => {
	return await surveyRepository.getSurveyStats();
};
