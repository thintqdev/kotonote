import ArenaSettings from '../models/ArenaSettings.js';
import ArenaGame from '../models/ArenaGame.js';
import ArenaKanjiPool from '../models/ArenaKanjiPool.js';
import ArenaVocabItem from '../models/ArenaVocabItem.js';
import ArenaParticleItem from '../models/ArenaParticleItem.js';
import { ARENA_GAME_DEFAULTS, ARENA_GAME_KEYS, ARENA_SETTINGS_ID } from '../constants/arena.js';

const GAMES = [
	{
		gameKey: ARENA_GAME_KEYS.KANJI_RAIN,
		order: 1,
		titleVi: 'Kanji Rain',
		titleJa: '漢字レイン',
		descriptionVi: 'Nhìn Kanji, gõ Hán Việt — 2 phút; sai/bỏ qua −5s',
		descriptionJa: '漢字→漢越 — 2分、誤答・スキップで5秒減',
		...ARENA_GAME_DEFAULTS[ARENA_GAME_KEYS.KANJI_RAIN],
	},
	{
		gameKey: ARENA_GAME_KEYS.VOCAB_BOX,
		order: 2,
		titleVi: 'Hộp từ vựng',
		titleJa: '語彙ボックス',
		descriptionVi: '12 hộp — trắc nghiệm nghĩa. 3 ngôi sao hi vọng (+20/-10đ)',
		descriptionJa: '12箱 — 意味を選択。希望の星3つ',
		...ARENA_GAME_DEFAULTS[ARENA_GAME_KEYS.VOCAB_BOX],
	},
	{
		gameKey: ARENA_GAME_KEYS.PARTICLE_QUIZ,
		order: 3,
		titleVi: 'Chọn trợ từ đúng',
		titleJa: '助詞クイズ',
		descriptionVi: '20 câu — gõ trợ từ phù hợp với ngữ pháp',
		descriptionJa: '20問 — 助詞を入力',
		...ARENA_GAME_DEFAULTS[ARENA_GAME_KEYS.PARTICLE_QUIZ],
	},
	{
		gameKey: ARENA_GAME_KEYS.READING_RUSH,
		order: 4,
		isActive: false,
		titleVi: 'Đọc nhanh',
		titleJa: '読みラッシュ',
		descriptionVi:
			'15 câu — nhìn từ tiếng Nhật, chọn cách đọc hiragana đúng (dùng kho từ vựng)',
		descriptionJa: '15問 — 単語を見て正しい読みを選択（語彙プール）',
		...ARENA_GAME_DEFAULTS[ARENA_GAME_KEYS.READING_RUSH],
	},
	{
		gameKey: ARENA_GAME_KEYS.MEANING_RUSH,
		order: 5,
		isActive: false,
		titleVi: 'Đoán nghĩa',
		titleJa: '意味ラッシュ',
		descriptionVi:
			'15 câu — nhìn từ tiếng Nhật, chọn nghĩa tiếng Việt đúng (dùng kho từ vựng)',
		descriptionJa: '15問 — 単語を見て正しい意味（ベトナム語）を選択',
		...ARENA_GAME_DEFAULTS[ARENA_GAME_KEYS.MEANING_RUSH],
	},
];

const SAMPLE_KANJI = [
	{ char: '日', hanViet: 'nhật', onYomi: 'ニチ', kunYomi: 'ひ' },
	{ char: '月', hanViet: 'nguyệt', onYomi: 'ゲツ', kunYomi: 'つき' },
	{ char: '水', hanViet: 'thủy', onYomi: 'スイ', kunYomi: 'みず' },
	{ char: '火', hanViet: 'hỏa', onYomi: 'カ', kunYomi: 'ひ' },
	{ char: '木', hanViet: 'mộc', onYomi: 'モク', kunYomi: 'き' },
	{ char: '金', hanViet: 'kim', onYomi: 'キン', kunYomi: 'かね' },
	{ char: '土', hanViet: 'thổ', onYomi: 'ド', kunYomi: 'つち' },
	{ char: '人', hanViet: 'nhân', onYomi: 'ジン', kunYomi: 'ひと' },
	{ char: '山', hanViet: 'sơn', onYomi: 'サン', kunYomi: 'やま' },
	{ char: '川', hanViet: 'xuyên', onYomi: 'セン', kunYomi: 'かわ' },
	{ char: '学', hanViet: 'học', onYomi: 'ガク', kunYomi: 'まな' },
	{ char: '校', hanViet: 'hiệu', onYomi: 'コウ', kunYomi: '' },
	{ char: '食', hanViet: 'thực', onYomi: 'ショク', kunYomi: 'た' },
	{ char: '飲', hanViet: 'ẩm', onYomi: 'イン', kunYomi: 'の' },
	{ char: '見', hanViet: 'kiến', onYomi: 'ケン', kunYomi: 'み' },
	{ char: '聞', hanViet: 'văn', onYomi: 'ブン', kunYomi: 'き' },
	{ char: '話', hanViet: 'thoại', onYomi: 'ワ', kunYomi: 'はな' },
	{ char: '読', hanViet: 'độc', onYomi: 'ドク', kunYomi: 'よ' },
	{ char: '書', hanViet: 'thư', onYomi: 'ショ', kunYomi: 'か' },
	{ char: '買', hanViet: 'mãi', onYomi: 'バイ', kunYomi: 'か' },
	{ char: '安', hanViet: 'an', onYomi: 'アン', kunYomi: 'やす' },
];

const SAMPLE_VOCAB = [
	{
		wordJa: '食べる',
		reading: 'たべる',
		choices: ['ăn', 'uống', 'ngủ', 'đi'],
		answerIndex: 0,
	},
	{
		wordJa: '飲む',
		reading: 'のむ',
		choices: ['uống', 'ăn', 'nấu', 'mua'],
		answerIndex: 0,
	},
	{
		wordJa: '学校',
		reading: 'がっこう',
		choices: ['trường học', 'bệnh viện', 'công viên', 'nhà ga'],
		answerIndex: 0,
	},
	{
		wordJa: '友達',
		reading: 'ともだち',
		choices: ['bạn bè', 'gia đình', 'đồng nghiệp', 'hàng xóm'],
		answerIndex: 0,
	},
	{
		wordJa: '勉強',
		reading: 'べんきょう',
		choices: ['học tập', 'làm việc', 'nghỉ ngơi', 'vui chơi'],
		answerIndex: 0,
	},
	{
		wordJa: '映画',
		reading: 'えいが',
		choices: ['phim', 'nhạc', 'sách', 'báo'],
		answerIndex: 0,
	},
	{
		wordJa: '天気',
		reading: 'てんき',
		choices: ['thời tiết', 'mùa', 'nhiệt độ', 'gió'],
		answerIndex: 0,
	},
	{
		wordJa: '旅行',
		reading: 'りょこう',
		choices: ['du lịch', 'công tác', 'chuyển nhà', 'tập thể dục'],
		answerIndex: 0,
	},
	{
		wordJa: '病院',
		reading: 'びょういん',
		choices: ['bệnh viện', 'nhà thuốc', 'phòng khám', 'trường học'],
		answerIndex: 0,
	},
	{
		wordJa: '料理',
		reading: 'りょうり',
		choices: ['nấu ăn', 'dọn phòng', 'giặt đồ', 'mua sắm'],
		answerIndex: 0,
	},
	{
		wordJa: '宿題',
		reading: 'しゅくだい',
		choices: ['bài tập về nhà', 'bài kiểm tra', 'bài thuyết trình', 'bài tập nhóm'],
		answerIndex: 0,
	},
	{
		wordJa: '電車',
		reading: 'でんしゃ',
		choices: ['tàu điện', 'xe buýt', 'taxi', 'máy bay'],
		answerIndex: 0,
	},
];

const SAMPLE_PARTICLES = [
	{
		sentenceJa: '私は毎日コーヒー___飲みます。',
		sentenceVi: 'Tôi uống cà phê mỗi ngày.',
		answer: 'を',
	},
	{
		sentenceJa: '図書館___本を読みます。',
		sentenceVi: 'Tôi đọc sách ở thư viện.',
		answer: 'で',
	},
	{
		sentenceJa: '友達___映画を見ました。',
		sentenceVi: 'Tôi đã xem phim với bạn.',
		answer: 'と',
	},
	{
		sentenceJa: '日本語___勉強しています。',
		sentenceVi: 'Tôi đang học tiếng Nhật.',
		answer: 'を',
	},
	{
		sentenceJa: '駅___電車に乗ります。',
		sentenceVi: 'Tôi lên tàu ở ga.',
		answer: 'で',
	},
];

export async function seedArena() {
	await ArenaSettings.findByIdAndUpdate(
		ARENA_SETTINGS_ID,
		{
			$set: {
				enabled: true,
				startTime: '20:00',
				endTime: '24:00',
				timezone: 'Asia/Ho_Chi_Minh',
				jlpt: 'N4',
				weekdays: [6],
				reminderMinutesBefore: 30,
			},
			$setOnInsert: { _id: ARENA_SETTINGS_ID },
		},
		{ upsert: true },
	);

	for (const game of GAMES) {
		await ArenaGame.findOneAndUpdate({ gameKey: game.gameKey }, game, {
			upsert: true,
			new: true,
		});
	}

	const kanjiCount = await ArenaKanjiPool.countDocuments();
	if (kanjiCount < 15) {
		await ArenaKanjiPool.insertMany(
			SAMPLE_KANJI.map((k) => ({ ...k, jlpt: 'N4', isActive: true })),
		);
	}

	const vocabCount = await ArenaVocabItem.countDocuments();
	if (vocabCount < 10) {
		await ArenaVocabItem.insertMany(
			SAMPLE_VOCAB.map((v, i) => ({
				...v,
				jlpt: 'N4',
				isActive: true,
				displayOrder: i,
			})),
		);
	}

	const particleCount = await ArenaParticleItem.countDocuments();
	if (particleCount < 5) {
		await ArenaParticleItem.insertMany(
			SAMPLE_PARTICLES.map((p, i) => ({
				...p,
				jlpt: 'N4',
				isActive: true,
				displayOrder: i,
			})),
		);
	}

	return { ok: true };
}
