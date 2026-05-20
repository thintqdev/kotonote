/**
 * Dữ liệu demo bài nghe — khớp body gửi tới listeningExerciseService.create (admin create).
 * audioUrl: file MP3 công khai (HTML5 <audio> trên trang luyện nghe).
 */

const DEMO_AUDIO =
	'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

const DEMO_IMAGE =
	'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=400&fit=crop&q=80';

export const LISTENING_DEMO_EXERCISES = [
	{
		titleVi: 'Đặt món tại quán cà phê',
		titleJa: 'カフェで注文する',
		jlpt: 'N5',
		type: 'task',
		duration: 45,
		audioUrl: DEMO_AUDIO,
		image: DEMO_IMAGE,
		scriptJa:
			'店員：いらっしゃいませ。お好きな席へどうぞ。\n客：すみません、ホットコーヒーを一つお願いします。\n店員：サイズはいかがなさいますか。\n客：中サイズでお願いします。',
		scriptVi:
			'Nhân viên: Xin chào, mời bạn chọn chỗ ngồi.\nKhách: Cho tôi một ly cà phê nóng.\nNhân viên: Bạn muốn size nào ạ?\nKhách: Size vừa, cảm ơn.',
		isPublished: true,
		displayOrder: 1,
		questions: [
			{
				questionVi: 'Khách đã gọi món gì?',
				questionJa: '客は何を注文しましたか。',
				choices: ['紅茶', 'ホットコーヒー', 'ジュース', '水'],
				choiceImages: ['', '', '', ''],
				answerIndex: 1,
				explainVi: '客は「ホットコーヒーを一つ」と言いました。',
			},
		],
	},
	{
		titleVi: 'Một ngày của tôi',
		titleJa: '私の一日',
		jlpt: 'N4',
		type: 'point',
		duration: 60,
		audioUrl: DEMO_AUDIO,
		image:
			'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop&q=80',
		scriptJa:
			'私は毎朝六時に起きます。顔を洗ってから、朝ごはんを食べます。八時に家を出て、電車で会社へ行きます。',
		scriptVi:
			'Tôi dậy lúc 6 giờ sáng mỗi ngày. Rửa mặt rồi ăn sáng. 8 giờ ra khỏi nhà và đi công ty bằng tàu điện.',
		isPublished: true,
		displayOrder: 2,
		questions: [
			{
				questionVi: 'Người nói đi làm bằng phương tiện gì?',
				questionJa: '話し手は何で会社へ行きますか。',
				choices: ['バス', '自転車', '電車', '車'],
				choiceImages: ['', '', '', ''],
				answerIndex: 2,
				explainVi: '「電車で会社へ行きます」とあります。',
			},
		],
	},
	{
		titleVi: 'Bốn mùa ở Nhật',
		titleJa: '日本の四季',
		jlpt: 'N3',
		type: 'summary',
		duration: 90,
		audioUrl: DEMO_AUDIO,
		image:
			'https://images.unsplash.com/photo-1528164344701-ba54ebddf7e9?w=800&h=400&fit=crop&q=80',
		scriptJa:
			'日本では春に桜が咲き、夏は祭りや花火が楽しみです。秋は紅葉、冬は雪景色が人気です。季節ごとに行事や食べ物も変わります。',
		scriptVi:
			'Ở Nhật mùa xuân có hoa anh đào, mùa hè có lễ hội và pháo hoa. Mùa thu lá đỏ, mùa đông cảnh tuyết. Mỗi mùa có phong tục và món ăn khác nhau.',
		isPublished: true,
		displayOrder: 3,
		questions: [
			{
				questionVi: 'Đoạn văn nói về điều gì?',
				questionJa: 'この話の主な内容は何ですか。',
				choices: [
					'日本の交通',
					'日本の四季と文化',
					'日本の料理だけ',
					'日本の仕事',
				],
				choiceImages: ['', '', '', ''],
				answerIndex: 1,
				explainVi: '四季、祭り、紅葉など季節の話が中心です。',
			},
		],
	},
	{
		titleVi: 'Phản xạ: Chào hỏi buổi sáng',
		titleJa: '即時応答：朝のあいさつ',
		jlpt: 'N4',
		type: 'response',
		duration: 20,
		audioUrl: DEMO_AUDIO,
		image: '',
		scriptJa: 'A：おはようございます。\nB：＿＿＿',
		scriptVi: 'A: Chào buổi sáng.\nB: ___ (chọn câu trả lời phù hợp nhất)',
		isPublished: true,
		displayOrder: 4,
		questions: [
			{
				questionVi: 'Câu trả lời tự nhiên nhất là gì?',
				questionJa: '最も自然な返事はどれですか。',
				choices: [
					'おはようございます',
					'こんばんは',
					'さようなら',
					'ありがとう',
				],
				choiceImages: ['', '', '', ''],
				answerIndex: 0,
				explainVi: '朝のあいさつには同じ表現で返します。',
			},
		],
	},
];
