import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

export const validate = (schema) => {
	return (req, res, next) => {
		const { error, value } = schema.validate(req.body, {
			abortEarly: false,
			stripUnknown: true,
		});
		if (!error && value) {
			req.body = value;
		}
		
		if (error) {
			const errors = error.details.map((detail) => ({
				field: detail.path[0],
				message: detail.message,
			}));
			return apiError(res, COMMON.VALIDATION_ERROR, 400, errors);
		}
		
		next();
	};
};
