import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

export const validate = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body, { abortEarly: false });
		
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
