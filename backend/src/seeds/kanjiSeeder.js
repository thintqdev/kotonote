import Kanji from '../models/Kanji.js';
import KanjiDeck from '../models/KanjiDeck.js';

const deckData = {
	titleVi: 'Kanji cơ bản N3 - Bài 1',
	titleJa: 'N3基本漢字 - レッスン1',
	descriptionVi: 'Các chữ Kanji cơ bản về học tập và giao tiếp',
	descriptionJa: '学習とコミュニケーションに関する基本漢字',
	jlpt: 'N3',
	displayOrder: 1,
	isActive: true,
};

const kanjiData = [
	{
		char: '漢',
		onYomi: 'カン',
		kunYomi: '—',
		hanViet: 'Hán',
		meaningVi: 'chữ Hán',
		vocabJa: '漢字（かんじ）',
		exampleJa: '毎日、漢字を五つ覚えています。',
		exampleVi: 'Mỗi ngày tôi học thuộc năm chữ Kanji.',
		displayOrder: 12,
	},
	{
		char: '字',
		onYomi: 'ジ',
		kunYomi: 'あざ',
		hanViet: 'Tự',
		meaningVi: 'chữ, tự',
		vocabJa: '文字（もじ）',
		exampleJa: 'この字の読み方を教えてください。',
		exampleVi: 'Làm ơn chỉ cho tôi cách đọc chữ này.',
		displayOrder: 11,
	},
	{
		char: '勉',
		onYomi: 'ベン',
		kunYomi: 'つと(む)',
		hanViet: 'Miễn',
		meaningVi: 'chăm, cố gắng',
		vocabJa: '勉強（べんきょう）',
		exampleJa: '試験のために毎晩勉強しています。',
		exampleVi: 'Tôi học mỗi tối để chuẩn bị cho kỳ thi.',
		displayOrder: 10,
	},
	{
		char: '強',
		onYomi: 'キョウ・ゴウ',
		kunYomi: 'つよ(い)',
		hanViet: 'Cường',
		meaningVi: 'mạnh, ép buộc',
		vocabJa: '強い（つよい）',
		exampleJa: '彼は意志が強いです。',
		exampleVi: 'Anh ấy có ý chí rất mạnh.',
		displayOrder: 9,
	},
	{
		char: '習',
		onYomi: 'シュウ',
		kunYomi: 'なら(う)',
		hanViet: 'Tập',
		meaningVi: 'luyện tập, học',
		vocabJa: '習う（ならう）',
		exampleJa: '先生に日本語の作文を習いました。',
		exampleVi: 'Tôi đã học viết luận tiếng Nhật với giáo viên.',
		displayOrder: 8,
	},
	{
		char: '慣',
		onYomi: 'カン',
		kunYomi: 'な(れる)',
		hanViet: 'Quán',
		meaningVi: 'quen',
		vocabJa: '慣れる（なれる）',
		exampleJa: '新しい環境に少しずつ慣れてきました。',
		exampleVi: 'Tôi dần quen với môi trường mới.',
		displayOrder: 7,
	},
	{
		char: '練',
		onYomi: 'レン',
		kunYomi: 'ね(る)',
		hanViet: 'Luyện',
		meaningVi: 'luyện (tập)',
		vocabJa: '練習（れんしゅう）',
		exampleJa: '発音を練習してから録音しました。',
		exampleVi: 'Sau khi luyện phát âm tôi đã ghi âm.',
		displayOrder: 6,
	},
	{
		char: '復',
		onYomi: 'フク',
		kunYomi: 'ま(た)',
		hanViet: 'Phục',
		meaningVi: 'ôn lại, phục',
		vocabJa: '復習（ふくしゅう）',
		exampleJa: '週末に今週の単語を復習します。',
		exampleVi: 'Cuối tuần tôi ôn lại từ vựng của tuần này.',
		displayOrder: 5,
	},
	{
		char: '読',
		onYomi: 'ドク・トク',
		kunYomi: 'よ(む)',
		hanViet: 'Độc',
		meaningVi: 'đọc',
		vocabJa: '読む（よむ）',
		exampleJa: '図書館で雑誌を読みました。',
		exampleVi: 'Tôi đã đọc tạp chí ở thư viện.',
		displayOrder: 4,
	},
	{
		char: '書',
		onYomi: 'ショ',
		kunYomi: 'か(く)',
		hanViet: 'Thư',
		meaningVi: 'viết',
		vocabJa: '書く（かく）',
		exampleJa: '手紙に住所を書き忘れないでください。',
		exampleVi: 'Đừng quên viết địa chỉ vào thư nhé.',
		displayOrder: 3,
	},
	{
		char: '聞',
		onYomi: 'ブン・モン',
		kunYomi: 'き(く)',
		hanViet: 'Văn / Vấn',
		meaningVi: 'nghe; hỏi',
		vocabJa: '聞く（きく）',
		exampleJa: 'ニュースを聞きながら朝ごはんを食べます。',
		exampleVi: 'Tôi ăn sáng vừa nghe tin tức.',
		displayOrder: 2,
	},
	{
		char: '話',
		onYomi: 'ワ',
		kunYomi: 'はな(す)・はなし',
		hanViet: 'Thoại',
		meaningVi: 'nói chuyện; chuyện',
		vocabJa: '話す（はなす）',
		exampleJa: '友だちと電話で長い話をしました。',
		exampleVi: 'Tôi đã nói chuyện điện thoại rất lâu với bạn.',
		displayOrder: 1,
	},
];

export const seedKanji = async () => {
	try {
		// Check if kanji deck already exists
		const existingDeck = await KanjiDeck.findOne({ titleVi: deckData.titleVi });
		
		if (existingDeck) {
			console.log('Kanji deck already exists. Skipping...');
			return;
		}
		
		// Create deck
		const deck = await KanjiDeck.create(deckData);
		console.log(`✓ Created kanji deck: ${deck.titleVi}`);
		
		// Add deckId to all kanji
		const kanjiWithDeck = kanjiData.map(k => ({ ...k, deckId: deck._id }));
		
		// Insert kanji
		await Kanji.insertMany(kanjiWithDeck);
		
		console.log(`✓ Successfully seeded ${kanjiData.length} kanji characters`);
	} catch (error) {
		console.error('Error seeding kanji:', error);
		throw error;
	}
};

export default seedKanji;
