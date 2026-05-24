import KaiwaContext from '../models/KaiwaContext.js';

const DEMO_CONTEXTS = [
	{
		titleVi: 'Gọi món tại quán cà phê',
		titleJa: 'カフェで注文する',
		jlpt: 'N5',
		category: 'restaurant',
		settingVi: 'Quán cà phê nhỏ gần ga tàu',
		settingJa: '駅近くの小さなカフェ',
		situationVi:
			'Bạn là khách du lịch, muốn gọi một ly cà phê và bánh ngọt. Nhân viên chào hỏi và hỏi bạn ngồi tại quán hay mang đi.',
		situationJa: '旅行者がカフェで飲み物とスイーツを注文する場面です。',
		objectivesVi: 'Chào hỏi · Gọi món · Hỏi giá · Cảm ơn',
		objectivesJa: '挨拶・注文・値段・お礼',
		roles: [
			{
				nameVi: 'Khách',
				nameJa: '客',
				descriptionVi: 'Người học tiếng Nhật',
				descriptionJa: '日本語を学ぶ旅行者',
			},
			{
				nameVi: 'Nhân viên',
				nameJa: '店員',
				descriptionVi: 'Phục vụ lịch sự',
				descriptionJa: '丁寧な店員',
			},
		],
		keyPhrases: [
			{
				phraseJa: 'いらっしゃいませ',
				reading: 'いらっしゃいませ',
				meaningVi: 'Xin chào (nhân viên)',
			},
			{
				phraseJa: '〜をください',
				reading: '〜をください',
				meaningVi: 'Cho tôi …',
			},
			{
				phraseJa: 'いくらですか',
				reading: 'いくらですか',
				meaningVi: 'Bao nhiêu tiền?',
			},
		],
		culturalNotesVi: 'Dùng です・ます với nhân viên quán.',
		culturalNotesJa: '店員には丁寧語を使います。',
		isPublished: true,
		displayOrder: 1,
	},
	{
		titleVi: 'Hỏi đường khi đi du lịch',
		titleJa: '道を尋ねる',
		jlpt: 'N5',
		category: 'travel',
		settingVi: 'Trước ga tàu điện ngầm',
		settingJa: '地下鉄の駅前',
		situationVi:
			'Bạn cần đến một điểm du lịch nhưng bản đồ khó đọc. Bạn nhờ người địa phương chỉ đường đến ga hoặc địa danh.',
		situationJa: '観光客が駅や観光地への行き方を尋ねる場面です。',
		objectivesVi: 'Xin giúp đỡ · Nghe hướng dẫn · Cảm ơn',
		objectivesJa: '助けを求める・道順を聞く・感謝する',
		roles: [
			{
				nameVi: 'Du khách',
				nameJa: '旅行者',
				descriptionVi: 'Học viên N5',
				descriptionJa: 'N5の学習者',
			},
			{
				nameVi: 'Người địa phương',
				nameJa: '通行人',
				descriptionVi: 'Sẵn sàng giúp đỡ',
				descriptionJa: '親切な通行人',
			},
		],
		keyPhrases: [
			{
				phraseJa: 'すみません',
				reading: 'すみません',
				meaningVi: 'Xin lỗi / nhờ giúp',
			},
			{
				phraseJa: '〜はどこですか',
				reading: '〜はどこですか',
				meaningVi: '… ở đâu?',
			},
		],
		culturalNotesVi: 'Bắt đầu bằng すみません khi nhờ người lạ.',
		culturalNotesJa: '見知らぬ人に声をかけるときは「すみません」から始めます。',
		isPublished: true,
		displayOrder: 2,
	},
];

export default async function seedKaiwaDemo() {
	let created = 0;
	let skipped = 0;

	for (const row of DEMO_CONTEXTS) {
		const exists = await KaiwaContext.findOne({
			titleVi: row.titleVi,
			jlpt: row.jlpt,
		}).lean();
		if (exists) {
			skipped += 1;
			continue;
		}
		await KaiwaContext.create(row);
		created += 1;
	}

	console.log(`   Kaiwa demo: ${created} created, ${skipped} skipped`);
}
