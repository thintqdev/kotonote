import { processEmailDigests } from '../services/emailDigestService.js';
import { STUDY_REMINDER_TICK_MS } from '../constants/userSettings.js';

function msUntilNextUtcHalfHour() {
	const now = new Date();
	const min = now.getUTCMinutes();
	const sec = now.getUTCSeconds();
	const ms = now.getUTCMilliseconds();
	if (min < 30) {
		return (30 - min) * 60_000 - sec * 1000 - ms;
	}
	return (60 - min) * 60_000 - sec * 1000 - ms;
}

export function startEmailDigestScheduler() {
	const tick = () => {
		processEmailDigests().catch((err) => {
			// eslint-disable-next-line no-console
			console.error('[EmailDigest]', err);
		});
	};

	setTimeout(() => {
		tick();
		setInterval(tick, STUDY_REMINDER_TICK_MS);
	}, msUntilNextUtcHalfHour());
}
