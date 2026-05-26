import { expireDueMemberships } from '../services/membershipExpiryService.js';

const TICK_MS = 60 * 60 * 1000;

/** Chạy lúc :10 mỗi giờ UTC (tránh trùng :00 với job khác). */
function msUntilNextUtcHourMark(minuteMark = 10) {
	const now = new Date();
	const min = now.getUTCMinutes();
	const sec = now.getUTCSeconds();
	const ms = now.getUTCMilliseconds();
	if (min < minuteMark) {
		return (minuteMark - min) * 60_000 - sec * 1000 - ms;
	}
	return (60 - min + minuteMark) * 60_000 - sec * 1000 - ms;
}

export function startMembershipExpiryScheduler() {
	const tick = () => {
		expireDueMemberships()
			.then((r) => {
				if (r.expiredCount > 0) {
					// eslint-disable-next-line no-console
					console.log(
						`[MembershipExpiry] Expired ${r.expiredCount} yearly membership(s)`,
					);
				}
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error('[MembershipExpiry]', err);
			});
	};

	setTimeout(() => {
		tick();
		setInterval(tick, TICK_MS);
	}, msUntilNextUtcHourMark(10));
}
