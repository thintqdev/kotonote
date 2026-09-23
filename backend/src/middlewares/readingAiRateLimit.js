import rateLimit from 'express-rate-limit';

export const readingAiRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => String(req.user._id),
	message: { success: false, messageCode: 'MSG_429' },
});
