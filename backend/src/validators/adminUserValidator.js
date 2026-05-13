import Joi from 'joi';
import { USER_STATUS } from '../constants/userStatus.js';

const statusValues = Object.values(USER_STATUS);

/** Cập nhật trạng thái nhiều user — tối đa 100 id mỗi request. */
export const bulkUsersStatusSchema = Joi.object({
	userIds: Joi.array()
		.items(Joi.string().trim().min(1))
		.min(1)
		.max(100)
		.required()
		.messages({
			'array.min': 'At least one user ID is required',
			'any.required': 'userIds is required',
		}),
	status: Joi.string()
		.valid(...statusValues)
		.required()
		.messages({
			'any.only': 'status must be active, locked, or suspended',
			'any.required': 'status is required',
		}),
});
