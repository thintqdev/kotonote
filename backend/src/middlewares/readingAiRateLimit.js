import rateLimit from 'express-rate-limit';

/** Mỗi lượt nộp có thể gồm 1 câu, nên hạn mức cao hơn so với chấm cả bài. */
export const readingSentenceAiRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 60,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => String(req.user._id),
	message: { success: false, messageCode: 'MSG_429' },
});
