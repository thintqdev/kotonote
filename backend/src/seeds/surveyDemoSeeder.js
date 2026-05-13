import User from '../models/User.js';
import Survey from '../models/Survey.js';
import { DEMO_USER_EMAIL_RE } from './userDemoSeeder.js';

const LEVELS = ['begin', 'n5', 'n4', 'n3', 'n2up'];
const GOALS = ['jlpt', 'travel', 'work', 'school', 'hobby'];
const DAILIES = ['lt15', '15-30', '30-60', 'gt60'];
const DISCOVERIES = ['friend', 'sns', 'search', 'other'];
const WEAK = ['grammar', 'vocab', 'kanji', 'listen', 'read'];

function buildWeakAreas(i) {
	const count = (i % 3) + 1;
	const start = i % WEAK.length;
	const chosen = [];
	for (let j = 0; j < count; j += 1) {
		chosen.push(WEAK[(start + j) % WEAK.length]);
	}
	return [...new Set(chosen)];
}

/**
 * Khảo sát demo cho user đã seed (`seed.demo.user*@kotonote.seed`).
 * Xóa khảo sát hiện có của các user đó rồi insert lại — idempotent, phù hợp biểu đồ admin.
 * Phải chạy sau `seedDemoUsers`.
 */
export const seedSurveyDemo = async () => {
	const users = await User.find({ email: DEMO_USER_EMAIL_RE }).sort({
		email: 1,
	});
	if (users.length === 0) {
		console.log(
			'Survey demo: không có user *@kotonote.seed — bỏ qua (chạy seed user demo trước).',
		);
		return;
	}

	const userIds = users.map((u) => u._id);
	await Survey.deleteMany({ userId: { $in: userIds } });

	const docs = users.map((u, i) => {
		const discovery = DISCOVERIES[i % DISCOVERIES.length];
		const doc = {
			userId: u._id,
			level: LEVELS[i % LEVELS.length],
			goal: GOALS[i % GOALS.length],
			dailyTime: DAILIES[i % DAILIES.length],
			weakAreas: buildWeakAreas(i),
			completedAt: new Date(Date.now() - (i + 1) * 36 * 60 * 60 * 1000),
		};

		// Một vài bản ghi không có discovery → bucket `unspecified` trên stats
		if (i % 5 !== 0) {
			doc.discovery = discovery;
			if (discovery === 'other') {
				doc.discoveryNote = `Kênh khác (seed #${i + 1})`;
			}
		}

		if (i % 4 === 0) {
			doc.freeNote =
				'Ghi chú seed — để QA danh sách & biểu đồ khảo sát admin.';
		}

		return doc;
	});

	await Survey.insertMany(docs);
	console.log(
		`✓ Đã seed ${docs.length} khảo sát demo cho user *@kotonote.seed (đã thay thế bản cũ nếu có).`,
	);
};

export default seedSurveyDemo;
