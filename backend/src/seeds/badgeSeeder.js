import Badge from '../models/Badge.js';

const STREAK_BADGES = [
	{
		key: 'streak_7',
		nameVi: 'Lửa tuần đầu',
		nameJa: '初週の連続学習',
		descriptionVi: 'Học liên tục 7 ngày.',
		descriptionJa: '7日間連続で学習しました。',
		category: 'streak',
		rarity: 'common',
		emoji: '🔥',
		displayOrder: 10,
	},
	{
		key: 'streak_30',
		nameVi: 'Thói quen 30 ngày',
		nameJa: '30日の習慣',
		descriptionVi: 'Duy trì streak 30 ngày.',
		descriptionJa: '30日連続ストリーク。',
		category: 'streak',
		rarity: 'rare',
		emoji: '📅',
		displayOrder: 11,
	},
	{
		key: 'streak_100',
		nameVi: 'Bậc thầy kiên trì',
		nameJa: '継続の達人',
		descriptionVi: '100 ngày streak — xuất sắc!',
		descriptionJa: '100日連続 — 素晴らしい！',
		category: 'streak',
		rarity: 'epic',
		emoji: '🏆',
		displayOrder: 12,
	},
];

/**
 * Seed badge mốc streak (bỏ qua nếu key đã tồn tại).
 */
export const seedBadges = async () => {
	let created = 0;
	for (const row of STREAK_BADGES) {
		const exists = await Badge.findOne({ key: row.key }).lean();
		if (exists) continue;
		await Badge.create({
			...row,
			isActive: true,
			iconImage: '',
		});
		created += 1;
	}
	if (created > 0) {
		console.log(`✓ Seeded ${created} badge(s) (streak milestones)`);
	} else {
		console.log('Badges: streak keys already present, skipped.');
	}
};

export default seedBadges;
