import Quote from '../models/Quote.js';

const quotes = [
	{
		quoteVi: 'Học tập là món quà dành cho chính bạn trong tương lai.',
		quoteJa: '学ぶことは、未来の自分への贈り物です。',
		author: null,
		category: 'learning',
		displayOrder: 1,
	},
	{
		quoteVi: 'Mỗi ngày là cơ hội vượt qua chính mình hôm qua một chút.',
		quoteJa: '毎日は、昨日の自分を少しだけ超えるチャンスです。',
		author: null,
		category: 'motivation',
		displayOrder: 2,
	},
	{
		quoteVi: 'Không có con đường tắt đến thành công. Chỉ có sự kiên trì mỗi ngày.',
		quoteJa: '成功への近道はない。毎日の努力だけがある。',
		author: null,
		category: 'perseverance',
		displayOrder: 3,
	},
	{
		quoteVi: 'Ngôn ngữ là cánh cửa mở ra một thế giới mới.',
		quoteJa: '言語は新しい世界への扉です。',
		author: null,
		category: 'learning',
		displayOrder: 4,
	},
	{
		quoteVi: 'Thất bại chỉ là bước đệm để thành công lớn hơn.',
		quoteJa: '失敗は、より大きな成功への踏み台に過ぎない。',
		author: null,
		category: 'wisdom',
		displayOrder: 5,
	},
	{
		quoteVi: 'Hành trình ngàn dặm bắt đầu từ một bước chân.',
		quoteJa: '千里の道も一歩から。',
		author: 'Lão Tử',
		category: 'perseverance',
		displayOrder: 6,
	},
	{
		quoteVi: 'Học không bao giờ là muộn. Quan trọng là bạn bắt đầu hôm nay.',
		quoteJa: '学ぶのに遅すぎることはない。大切なのは今日始めることだ。',
		author: null,
		category: 'motivation',
		displayOrder: 7,
	},
	{
		quoteVi: 'Sai lầm là bằng chứng bạn đang cố gắng.',
		quoteJa: '間違いは、あなたが努力している証拠です。',
		author: null,
		category: 'learning',
		displayOrder: 8,
	},
	{
		quoteVi: 'Kiên nhẫn và luyện tập là chìa khóa thành thạo.',
		quoteJa: '忍耐と練習が上達の鍵です。',
		author: null,
		category: 'perseverance',
		displayOrder: 9,
	},
	{
		quoteVi: 'Mỗi từ mới bạn học là một viên gạch xây nên tương lai.',
		quoteJa: '学ぶ新しい言葉は、未来を築くレンガです。',
		author: null,
		category: 'success',
		displayOrder: 10,
	},
	{
		quoteVi: 'Đừng so sánh tiến độ của bạn với người khác. Mỗi người có nhịp riêng.',
		quoteJa: '他人と進歩を比べないで。それぞれのペースがあります。',
		author: null,
		category: 'wisdom',
		displayOrder: 11,
	},
	{
		quoteVi: 'Thành công không phải đích đến, mà là hành trình mỗi ngày.',
		quoteJa: '成功は目的地ではなく、毎日の旅です。',
		author: null,
		category: 'success',
		displayOrder: 12,
	},
];

export const seedQuotes = async () => {
	try {
		// Check if quotes already exist
		const count = await Quote.countDocuments();
		
		if (count > 0) {
			console.log('Quotes already seeded. Skipping...');
			return;
		}
		
		// Insert quotes
		await Quote.insertMany(quotes);
		console.log(`✓ Successfully seeded ${quotes.length} quotes`);
	} catch (error) {
		console.error('Error seeding quotes:', error);
		throw error;
	}
};

export default seedQuotes;
