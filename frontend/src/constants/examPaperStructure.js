import { EXAM_LISTENING_DEFAULT_QUESTION_JA } from './examPaperFieldMeta.js';
import { countSectionQuestions as countReadingSectionQuestions } from '../utils/examReadingPassages.js';

export const EXAM_SECTION_ORDER = ['vocabulary', 'grammar', 'reading', 'listening'];

export const EXAM_SECTION_META = {
	vocabulary: { titleVi: 'Từ vựng', titleJa: '語彙' },
	grammar: { titleVi: 'Ngữ pháp', titleJa: '文法' },
	reading: { titleVi: 'Đọc hiểu', titleJa: '読解' },
	listening: { titleVi: 'Nghe hiểu', titleJa: '聴解' },
};

export const EXAM_PART_TYPES_BY_SECTION = {
	vocabulary: [
		'kanji_to_reading',
		'reading_to_kanji',
		'word_formation',
		'context_word',
		'same_meaning',
		'synonym',
		'word_usage',
	],
	grammar: ['grammar_form', 'sentence_order', 'star_question', 'text_grammar'],
	reading: ['short_passage', 'medium_passage', 'long_passage', 'info_search'],
	listening: ['task', 'point', 'outline', 'expression', 'quick_response', 'integrated'],
};

export const EXAM_PART_META = {
	kanji_to_reading: { titleVi: 'Kanji → Hiragana', titleJa: '漢字の読み' },
	reading_to_kanji: { titleVi: 'Hiragana → Kanji', titleJa: '表記' },
	word_formation: { titleVi: 'Cấu tạo từ', titleJa: '語形成' },
	context_word: { titleVi: 'Chọn từ theo ngữ cảnh', titleJa: '文脈規定' },
	same_meaning: { titleVi: 'Dạng câu cùng nghĩa', titleJa: '同義語' },
	synonym: { titleVi: '言い換え・類義', titleJa: '言い換え類義' },
	word_usage: { titleVi: 'Cách sử dụng từ', titleJa: '用法' },
	grammar_form: { titleVi: 'Dạng ngữ pháp', titleJa: '文法形式' },
	sentence_order: { titleVi: 'Sắp xếp câu', titleJa: '文の組み立て' },
	star_question: { titleVi: 'Câu hỏi dấu sao (*)', titleJa: '★問題' },
	text_grammar: { titleVi: 'Ngữ pháp đoạn văn (*)', titleJa: '文章の文法' },
	short_passage: { titleVi: 'Đoạn ngắn', titleJa: '短文' },
	medium_passage: { titleVi: 'Đoạn trung bình', titleJa: '中文' },
	long_passage: { titleVi: 'Đoạn dài', titleJa: '長文' },
	info_search: { titleVi: 'Tìm thông tin', titleJa: '情報検索' },
	task: { titleVi: '課題理解', titleJa: '課題理解' },
	point: { titleVi: 'ポイント理解', titleJa: 'ポイント理解' },
	outline: { titleVi: '概要理解', titleJa: '概要理解' },
	expression: { titleVi: '発言表現', titleJa: '発言表現' },
	quick_response: { titleVi: '即時応答', titleJa: '即時応答' },
	integrated: { titleVi: '統合理解', titleJa: '統合理解' },
};

export const EXAM_IMPORT_VERSION = 1;

/** Mẫu JSON tối thiểu để import */
export function buildExamImportSample() {
	return {
		version: EXAM_IMPORT_VERSION,
		merge: false,
		sections: [
			{
				sectionType: 'vocabulary',
				partType: 'kanji_to_reading',
				titleVi: 'Đọc kanji',
				titleJa: '漢字の読み',
				order: 1,
				questions: [
					{
						questionNumber: 1,
						questionJa: '先生',
						questionType: 'multiple_choice',
						choices: ['せんせい', 'せんせ', 'さくせい', 'ぜんせい'],
						answerIndex: 0,
						explainVi: 'Đọc là せんせい',
					},
				],
			},
			{
				sectionType: 'grammar',
				partType: 'text_grammar',
				titleVi: 'Ngữ pháp trong đoạn',
				passageJa:
					'田中さんは___中学校___の***先生***です。{漢字|かんじ}の読み方も確認しましょう。',
				questions: [
					{
						questionNumber: 1,
						questionJa: '（　）に入る言葉',
						questionType: 'multiple_choice',
						choices: ['べんきょう', 'べんきょ', 'べんきゅう', 'べんきょうう'],
						answerIndex: 0,
					},
				],
			},
		],
	};
}

/**
 * @param {Array<{ sectionType?: string, partType?: string, questions?: unknown[] }>} sections
 * @param {string} sectionType
 */
export function filterSectionsByType(sections, sectionType) {
	return (sections ?? [])
		.filter((s) => s.sectionType === sectionType)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function countSectionQuestions(section) {
	return countReadingSectionQuestions(section);
}

/** Mẫu JSON import cho một part cụ thể */
export function buildPartImportSample(sectionType, partType) {
	const base = {
		passageJa: '',
		audioUrl: '',
		questions: [
			{
				questionNumber: 1,
				questionJa: '先生',
				questionType: 'multiple_choice',
				choices: ['せんせい', 'せんせ', 'さくせい', 'ぜんせい'],
				answerIndex: 0,
				explainVi: '',
			},
		],
	};

	if (sectionType === 'grammar' && partType === 'text_grammar') {
		base.passageJa =
			'田中さんは中学校の***先生***です。彼は毎日*勉強*します。_(1)_に入る言葉を選びなさい。';
		base.questions[0] = {
			questionNumber: 1,
			questionJa: '（　）に入る言葉',
			questionType: 'multiple_choice',
			choices: ['べんきょう', 'べんきょ', 'べんきゅう', 'べんきょうう'],
			answerIndex: 0,
			explainVi: '',
		};
	}

	if (sectionType === 'grammar' && partType === 'star_question') {
		base.questions[0] = {
			questionNumber: 10,
			questionJa: 'きょうは ____ ____ ★ ____ 。',
			questionType: 'star_question',
			choices: ['疲れたので', '早く', '寝ます', '学校'],
			answerIndex: 2,
			explainVi: 'Câu đúng: きょうは 疲れたので 早く 寝ます。 ★ là 寝ます',
		};
	}

	if (sectionType === 'vocabulary' && partType === 'same_meaning') {
		base.passageJa = '彼は毎日*真面目*に勉強しています。';
		base.questions[0] = {
			questionNumber: 1,
			questionJa: '「***真面目***」と同じ意味の言葉はどれですか。',
			questionType: 'multiple_choice',
			choices: ['まじめ', 'うそ', 'あまい', 'つよい'],
			answerIndex: 0,
			explainVi: '真面目 ≈ まじめ',
		};
	}

	if (sectionType === 'reading') {
		base.passageJa = '昨日、友達と映画を見に行きました。';
		base.questions[0] = {
			questionNumber: 1,
			questionJa: 'この文章の内容として正しいものはどれですか。',
			questionType: 'multiple_choice',
			choices: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
			answerIndex: 0,
			explainVi: '',
		};
	}

	if (sectionType === 'listening') {
		base.questions = [
			{
				questionNumber: 1,
				questionJa: EXAM_LISTENING_DEFAULT_QUESTION_JA,
				questionType: 'multiple_choice',
				choices: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
				mediaUrl: '',
				answerIndex: 0,
				explainVi: '',
			},
			{
				questionNumber: 2,
				questionJa: EXAM_LISTENING_DEFAULT_QUESTION_JA,
				questionType: 'multiple_choice',
				choices: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
				mediaUrl: '',
				answerIndex: 0,
				explainVi: '',
			},
		];
	}

	return base;
}

/** @param {string} sectionType @param {string} partType */
export function inferBlueprintFlags(sectionType, partType) {
	let needsPassage = false;
	let needsMedia = false;
	if (sectionType === 'reading') needsPassage = true;
	if (sectionType === 'grammar' && partType === 'text_grammar') needsPassage = true;
	if (
		sectionType === 'vocabulary' &&
		['context_word', 'same_meaning', 'word_usage', 'synonym'].includes(partType)
	) {
		needsPassage = true;
	}
	if (sectionType === 'listening') needsMedia = true;
	if (partType === 'info_search') {
		needsMedia = true;
		needsPassage = false;
	}
	return { needsPassage, needsMedia };
}

/**
 * Tạo blueprint section mới khi thêm part
 * @param {string} sectionType
 * @param {string} partType
 * @param {number} order
 */
export function buildBlueprintSection(sectionType, partType, order = 1) {
	const meta = EXAM_PART_META[partType] ?? {};
	const flags = inferBlueprintFlags(sectionType, partType);
	return {
		sectionType,
		partType,
		titleVi: meta.titleVi ?? partType,
		titleJa: meta.titleJa ?? '',
		descriptionVi: meta.descVi ?? '',
		order,
		isEnabled: true,
		needsPassage: flags.needsPassage,
		needsMedia: flags.needsMedia,
	};
}

/**
 * Part trong catalog chưa có trong khung hiện tại
 * @param {string} sectionType
 * @param {Array<{ sectionType?: string, partType?: string }>} sections
 */
export function getAvailablePartsForSection(sectionType, sections = []) {
	const all = EXAM_PART_TYPES_BY_SECTION[sectionType] ?? [];
	const used = new Set(
		sections
			.filter((s) => s.sectionType === sectionType)
			.map((s) => s.partType),
	);
	return all.filter((pt) => !used.has(pt));
}

export function nextBlueprintOrder(sections = []) {
	if (!sections.length) return 1;
	return (
		sections.reduce((max, s) => Math.max(max, Number(s.order) || 0), 0) + 1
	);
}
