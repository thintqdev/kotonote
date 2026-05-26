/** Rate limit đơn giản cho webhook (theo IP). */

const buckets = new Map();

/**
 * @param {{ windowMs?: number, max?: number }} [opts]
 */
export function webhookRateLimit(opts = {}) {
	const windowMs = opts.windowMs ?? 60_000;
	const max = opts.max ?? 120;

	return (req, res, next) => {
		const ip =
			req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
			req.ip ||
			'unknown';
		const now = Date.now();
		let bucket = buckets.get(ip);
		if (!bucket || now - bucket.start > windowMs) {
			bucket = { start: now, count: 0 };
			buckets.set(ip, bucket);
		}
		bucket.count += 1;
		if (bucket.count > max) {
			return res.status(429).json({
				success: false,
				messageCode: 'MSG_002',
			});
		}
		return next();
	};
}
