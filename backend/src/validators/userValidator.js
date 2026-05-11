import { body, validationResult } from 'express-validator';

/**
 * User validation rules
 */
export const validateUser = [
	body('email')
		.isEmail()
		.withMessage('Please provide valid email')
		.normalizeEmail(),
	body('name')
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Name must be between 2 and 50 characters'),
	body('password')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters'),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array()
			});
		}
		next();
	}
];
