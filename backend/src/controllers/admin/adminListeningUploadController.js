import asyncHandler from 'express-async-handler';
import { apiError, apiSuccess } from '../../utils/response.js';
import { LISTENING, COMMON } from '../../constants/messages.js';

export const uploadListeningAudio = asyncHandler(async (req, res) => {
	if (!req.file?.publicPath) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'audio', message: 'Audio file is required' },
		]);
	}
	return apiSuccess(
		res,
		{ url: req.file.publicPath },
		LISTENING.AUDIO_UPLOADED,
		201,
	);
});

export const uploadListeningImage = asyncHandler(async (req, res) => {
	if (!req.file?.publicPath) {
		return apiError(res, COMMON.VALIDATION_ERROR, 400, [
			{ field: 'image', message: 'Image file is required' },
		]);
	}
	return apiSuccess(
		res,
		{ url: req.file.publicPath },
		LISTENING.IMAGE_UPLOADED,
		201,
	);
});
