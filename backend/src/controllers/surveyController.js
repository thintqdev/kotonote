import asyncHandler from 'express-async-handler';
import * as surveyService from '../services/surveyService.js';
import { apiSuccess } from '../utils/response.js';
import { SURVEY } from '../constants/messages.js';

export const submitSurvey = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const surveyData = req.body;

	const result = await surveyService.submitSurvey(userId, surveyData);

	const messageCode = result.isNew ? SURVEY.CREATED : SURVEY.UPDATED;
	const statusCode = result.isNew ? 201 : 200;

	return apiSuccess(res, { survey: result.survey }, messageCode, statusCode);
});

export const getMySurvey = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	const survey = await surveyService.getUserSurvey(userId);

	return apiSuccess(res, { survey }, SURVEY.FETCHED, 200);
});

/**
 * @desc    Đã gửi khảo sát hay chưa (guard frontend)
 * @route   GET /api/surveys/me/status
 * @access  Private
 */
export const getMySurveyStatus = asyncHandler(async (req, res) => {
	const result = await surveyService.getSurveyCompletionStatus(req.user._id);
	return apiSuccess(res, result, SURVEY.FETCHED, 200);
});

export const getAllSurveys = asyncHandler(async (req, res) => {
	const { level, goal } = req.query;

	const filters = {};
	if (level) filters.level = level;
	if (goal) filters.goal = goal;

	const surveys = await surveyService.getAllSurveys(filters);

	return apiSuccess(res, { surveys, total: surveys.length }, SURVEY.FETCHED, 200);
});

export const getSurveyStats = asyncHandler(async (req, res) => {
	const stats = await surveyService.getSurveyStatistics();

	return apiSuccess(res, { stats }, SURVEY.FETCHED, 200);
});
