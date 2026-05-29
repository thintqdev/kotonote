import Joi from 'joi';
import { PAID_TIER_IDS } from '../constants/membership.js';

export const createCheckoutSchema = Joi.object({
	tierId: Joi.string()
		.valid(...PAID_TIER_IDS)
		.required(),
	billing: Joi.string().valid('yearly', 'lifetime').required(),
});

export const checkoutIdParamSchema = Joi.object({
	checkoutId: Joi.string().hex().length(24).required(),
});

export const refundRequestSchema = Joi.object({
	note: Joi.string().max(500).allow('', null).optional(),
});
