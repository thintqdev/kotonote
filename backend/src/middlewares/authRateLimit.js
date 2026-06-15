import rateLimit from 'express-rate-limit';
import { apiError } from '../utils/response.js';
import { AUTH } from '../constants/messages.js';

const standardHeaders = true;
const legacyHeaders = false;

/**
 * @param {{ windowMs?: number, max?: number }} opts
 */
function createAuthLimiter(opts = {}) {
	return rateLimit({
		windowMs: opts.windowMs ?? 15 * 60 * 1000,
		max: opts.max ?? 20,
		standardHeaders,
		legacyHeaders,
		handler: (_req, res) =>
			apiError(res, AUTH.RATE_LIMIT_EXCEEDED, 429),
	});
}

/** Đăng nhập / đăng ký / Google — 20 req / 15 phút / IP */
export const authCredentialRateLimit = createAuthLimiter({ max: 20 });

/** Admin login — chặt hơn: 10 req / 15 phút / IP */
export const adminLoginRateLimit = createAuthLimiter({ max: 10 });

/** Quên mật khẩu / gửi lại verify — 5 req / giờ / IP */
export const authSensitiveRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	standardHeaders,
	legacyHeaders,
	handler: (_req, res) =>
		apiError(res, AUTH.RATE_LIMIT_EXCEEDED, 429),
});
