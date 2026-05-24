import Joi from 'joi';
import { MEMBERSHIP_TIER_IDS } from '../constants/membership.js';

export const updateUserMembershipSchema = Joi.object({
	tierId: Joi.string()
		.valid(...MEMBERSHIP_TIER_IDS)
		.required(),
	billing: Joi.string().valid('free', 'yearly', 'lifetime').required(),
	status: Joi.string().valid('active', 'expired').required(),
	expiresAt: Joi.alternatives()
		.try(Joi.date().iso(), Joi.valid(null))
		.optional(),
});

export const userIdParamSchema = Joi.object({
	userId: Joi.string().hex().length(24).required(),
});
