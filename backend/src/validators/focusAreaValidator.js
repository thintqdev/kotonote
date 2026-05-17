import Joi from 'joi';
import { FOCUS_AREA_KEYS, FOCUS_AREA_MAX } from '../constants/focusAreas.js';

export const updateFocusAreasSchema = Joi.object({
	focusAreaKeys: Joi.array()
		.items(Joi.string().valid(...FOCUS_AREA_KEYS))
		.min(0)
		.max(FOCUS_AREA_MAX)
		.unique()
		.required(),
}).unknown(false);
