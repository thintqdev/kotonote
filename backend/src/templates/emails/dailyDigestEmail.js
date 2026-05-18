import { buildAuthEmail } from './emailLayout.js';

/**
 * @param {{
 *   name: string,
 *   useJa: boolean,
 *   dashboardUrl: string,
 *   stats: { label: string, value: string }[],
 *   isWeekly?: boolean,
 * }} options
 */
export function dailyDigestEmailTemplate(options) {
	const { name, useJa, dashboardUrl, stats, isWeekly = false } = options;

	const title = isWeekly
		? useJa
			? '週間レポート'
			: 'Báo cáo tuần'
		: useJa
			? '今日の学習サマリー'
			: 'Tóm tắt học tập hôm nay';

	const intro = isWeekly
		? useJa
			? '今週の学習の様子をまとめました。'
			: 'Tổng hợp tuần của bạn trên Kotonote:'
		: useJa
			? '今日も一緒に頑張りましょう。'
			: 'Tiến độ học tập của bạn hôm nay:';

	const preheader = isWeekly
		? useJa
			? '今週のストリークと目標'
			: 'Streak và mục tiêu tuần này'
		: useJa
			? 'ストリークと今日の目標'
			: 'Streak và mục tiêu hôm nay';

	const ctaLabel = useJa ? 'アプリを開く' : 'Mở Kotonote';

	const note = useJa
		? 'メール配信は設定画面でいつでもオフにできます。'
		: 'Tắt email tóm tắt tại Cài đặt → Thông báo.';

	return buildAuthEmail({
		preheader,
		title,
		greetingName: name,
		intro,
		ctaLabel,
		ctaUrl: dashboardUrl,
		steps: stats.map((row) => `${row.label}: ${row.value}`),
		note,
		linkFallbackLabel: useJa ? 'ブラウザで開く:' : 'Hoặc mở link:',
	});
}
