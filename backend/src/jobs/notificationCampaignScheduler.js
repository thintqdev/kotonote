import { processDueCampaigns } from '../services/notificationCampaignService.js';

const TICK_MS = 30_000;

/**
 * Bắt đầu vòng lặp gửi campaign đã lên lịch.
 * Không bắt buộc Redis cho một máy chủ; Redis + Bull khi fan-out lớn / nhiều replica.
 */
export function startNotificationCampaignScheduler() {
	setInterval(() => {
		processDueCampaigns().catch((err) => {
			// eslint-disable-next-line no-console
			console.error('[CampaignScheduler]', err);
		});
	}, TICK_MS);

	processDueCampaigns().catch((err) => {
		// eslint-disable-next-line no-console
		console.error('[CampaignScheduler] initial tick', err);
	});
}
