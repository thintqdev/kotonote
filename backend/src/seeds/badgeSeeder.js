import Badge from '../models/Badge.js';

const MILESTONE_BADGES = [
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
	{
		key: 'reading_complete_1',
		nameVi: 'Bài đọc đầu tiên',
		nameJa: '初めての読解',
		descriptionVi: 'Hoàn thành 1 bài đọc hiểu.',
		descriptionJa: '読解を1本完了しました。',
		category: 'reading',
		rarity: 'common',
		emoji: '📖',
		displayOrder: 20,
	},
	{
		key: 'reading_complete_10',
		nameVi: 'Đọc giỏi 10 bài',
		nameJa: '読解10本達成',
		descriptionVi: 'Hoàn thành 10 bài đọc hiểu.',
		descriptionJa: '読解を10本完了しました。',
		category: 'reading',
		rarity: 'rare',
		emoji: '📚',
		displayOrder: 21,
	},
];

/**
 * Seed badge mốc tự động (bỏ qua nếu key đã tồn tại).
 */
export const seedBadges = async () => {
	let created = 0;
	for (const row of MILESTONE_BADGES) {
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
		console.log(`✓ Seeded ${created} milestone badge(s)`);
	} else {
		console.log('Badges: milestone keys already present, skipped.');
	}
};

export default seedBadges;
