import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

/**
 * @param {import('joi').ObjectSchema} schema
 * @param {'body' | 'params' | 'query'} [source]
 */
export const validate = (schema, source = 'body') => {
	return (req, res, next) => {
		const target =
			source === 'params'
				? req.params
				: source === 'query'
					? req.query
					: req.body;
		const { error, value } = schema.validate(target, {
			abortEarly: false,
			stripUnknown: true,
		});
		if (!error && value) {
			if (source === 'params') req.params = value;
			else if (source === 'query') req.query = value;
			else req.body = value;
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
