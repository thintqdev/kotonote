/** Cấu trúc đề JLPT — phần (part) trong từng khối sectionType */

export const EXAM_VOCAB_PART_TYPES = [
	'kanji_to_reading',
	'reading_to_kanji',
	'word_formation',
	'context_word',
	'same_meaning',
	'synonym',
	'word_usage',
];

export const EXAM_GRAMMAR_PART_TYPES = [
	'grammar_form',
	'sentence_order',
	'star_question',
	'text_grammar',
];

export const EXAM_READING_PART_TYPES = [
	'short_passage',
	'medium_passage',
	'long_passage',
	'info_search',
];

export const EXAM_LISTENING_PART_TYPES = [
	'task',
	'point',
	'outline',
	'expression',
	'quick_response',
	'integrated',
];

/** @type {Record<string, string[]>} */
export const EXAM_PART_TYPES_BY_SECTION = {
	vocabulary: EXAM_VOCAB_PART_TYPES,
	grammar: EXAM_GRAMMAR_PART_TYPES,
	reading: EXAM_READING_PART_TYPES,
	listening: EXAM_LISTENING_PART_TYPES,
};

/** Metadata hiển thị (VI / JA) */
export const EXAM_PART_META = {
	kanji_to_reading: {
		titleVi: 'Đọc kanji (Kanji → Hiragana)',
		titleJa: '漢字の読み',
		descVi: 'Chọn cách đọc hiragana đúng của từ kanji.',
	},
	reading_to_kanji: {
		titleVi: 'Chọn kanji (Hiragana → Kanji)',
		titleJa: '表記',
		descVi: 'Chọn cách viết kanji đúng theo hiragana.',
	},
	word_formation: {
		titleVi: 'Cấu tạo từ',
		titleJa: '語形成',
		descVi: 'Chọn hình thái từ phù hợp (N2/N1).',
	},
	context_word: {
		titleVi: 'Chọn từ theo ngữ cảnh',
		titleJa: '文脈規定',
		descVi: 'Chọn từ vựng phù hợp với câu/đoạn.',
	},
	same_meaning: {
		titleVi: 'Dạng câu cùng nghĩa',
		titleJa: '同義語',
		descVi: 'Chọn từ/cụm có nghĩa gần giống hoặc đồng nghĩa với từ gạch chân.',
	},
	synonym: {
		titleVi: '言い換え・類義',
		titleJa: '言い換え類義',
		descVi: 'Chọn cách diễn đạt thay thế gần nghĩa nhất (言い換え).',
	},
	word_usage: {
		titleVi: 'Cách sử dụng từ',
		titleJa: '用法',
		descVi: 'Chọn câu dùng từ đúng cách.',
	},
	grammar_form: {
		titleVi: 'Dạng ngữ pháp',
		titleJa: '文法形式の判断',
		descVi: 'Chọn mẫu ngữ pháp đúng vào chỗ trống.',
	},
	sentence_order: {
		titleVi: 'Sắp xếp câu',
		titleJa: '文の組み立て',
		descVi: 'Sắp xếp các đoạn thành câu hoàn chỉnh.',
	},
	star_question: {
		titleVi: 'Câu hỏi dấu sao (*)',
		titleJa: '★問題',
		descVi: 'Chọn đáp án cho vị trí ★ trong câu có ô trống (____).',
	},
	text_grammar: {
		titleVi: 'Ngữ pháp trong đoạn văn (*)',
		titleJa: '文章の文法',
		descVi: 'Đoạn văn có dấu * — chọn ngữ pháp phù hợp từng chỗ.',
	},
	short_passage: {
		titleVi: 'Đoạn văn ngắn',
		titleJa: '短文読解',
		descVi: 'Đọc đoạn ngắn và trả lời câu hỏi.',
	},
	medium_passage: {
		titleVi: 'Đoạn văn trung bình',
		titleJa: '中文読解',
		descVi: 'Đọc đoạn trung văn (1–2 trang).',
	},
	long_passage: {
		titleVi: 'Đoạn văn dài',
		titleJa: '長文読解',
		descVi: 'Đọc trường văn / luận văn ngắn.',
	},
	info_search: {
		titleVi: 'Tìm thông tin',
		titleJa: '情報検索',
		descVi: 'Tìm thông tin trong quảng cáo, bảng thông báo.',
	},
	task: {
		titleVi: 'Hiểu nhiệm vụ (課題理解)',
		titleJa: '課題理解',
		descVi: 'Nghe và chọn hành động phù hợp nhất.',
	},
	point: {
		titleVi: 'Hiểu điểm chính (ポイント理解)',
		titleJa: 'ポイント理解',
		descVi: 'Nghe hội thoại — chọn ý đúng nhất.',
	},
	outline: {
		titleVi: 'Hiểu tổng quan (概要理解)',
		titleJa: '概要理解',
		descVi: 'Nghe đoạn dài — chọn tóm tắt / mục đích.',
	},
	expression: {
		titleVi: 'Biểu đạt phát ngôn (発言表現)',
		titleJa: '発言表現',
		descVi: 'Chọn cách nói phù hợp tình huống.',
	},
	quick_response: {
		titleVi: 'Phản xạ nhanh (即時応答)',
		titleJa: '即時応答',
		descVi: 'Nghe câu hỏi ngắn — chọn đáp án ngay.',
	},
	integrated: {
		titleVi: 'Hiểu tổng hợp (統合理解)',
		titleJa: '統合理解',
		descVi: 'Nghe đoạn dài + câu hỏi phức hợp (N1).',
	},
};

export const EXAM_SECTION_META = {
	vocabulary: { titleVi: 'Từ vựng', titleJa: '語彙', icon: 'vocab' },
	grammar: { titleVi: 'Ngữ pháp', titleJa: '文法', icon: 'grammar' },
	reading: { titleVi: 'Đọc hiểu', titleJa: '読解', icon: 'reading' },
	listening: { titleVi: 'Nghe hiểu', titleJa: '聴解', icon: 'listening' },
};

/** Thứ tự part mặc định theo JLPT (N3 làm chuẩn; N5/N4 bỏ bớt part nâng cao) */
const PARTS_BY_JLPT = {
	N5: {
		vocabulary: ['kanji_to_reading', 'reading_to_kanji', 'context_word', 'same_meaning'],
		grammar: ['grammar_form', 'sentence_order', 'star_question', 'text_grammar'],
		reading: ['short_passage', 'medium_passage'],
		listening: ['task', 'point', 'quick_response'],
	},
	N4: {
		vocabulary: ['kanji_to_reading', 'reading_to_kanji', 'context_word', 'same_meaning', 'word_usage'],
		grammar: ['grammar_form', 'sentence_order', 'star_question', 'text_grammar'],
		reading: ['short_passage', 'medium_passage'],
		listening: ['task', 'point', 'outline', 'expression', 'quick_response'],
	},
	N3: {
		vocabulary: EXAM_VOCAB_PART_TYPES,
		grammar: EXAM_GRAMMAR_PART_TYPES,
		reading: ['short_passage', 'medium_passage', 'long_passage'],
		listening: ['task', 'point', 'outline', 'expression', 'quick_response'],
	},
	N2: {
		vocabulary: EXAM_VOCAB_PART_TYPES,
		grammar: EXAM_GRAMMAR_PART_TYPES,
		reading: ['short_passage', 'medium_passage', 'long_passage', 'info_search'],
		listening: ['task', 'point', 'outline', 'expression', 'quick_response', 'integrated'],
	},
	N1: {
		vocabulary: EXAM_VOCAB_PART_TYPES,
		grammar: EXAM_GRAMMAR_PART_TYPES,
		reading: EXAM_READING_PART_TYPES,
		listening: EXAM_LISTENING_PART_TYPES,
	},
};

/**
 * @param {string} jlpt
 * @returns {import('./examPaperStructureTypes.js').ExamSection[]}
 */
export function buildDefaultExamSections(jlpt = 'N3') {
	const level = PARTS_BY_JLPT[jlpt] ? jlpt : 'N3';
	const config = PARTS_BY_JLPT[level];
	let order = 0;
	const sections = [];

	for (const sectionType of ['vocabulary', 'grammar', 'reading', 'listening']) {
		const partTypes = config[sectionType] ?? [];
		for (const partType of partTypes) {
			order += 1;
			const meta = EXAM_PART_META[partType] ?? {};
			sections.push({
				sectionType,
				partType,
				titleVi: meta.titleVi ?? partType,
				titleJa: meta.titleJa ?? '',
				descriptionVi: meta.descVi ?? '',
				order,
				timeLimitMinutes: 0,
				passageJa: '',
				passageVi: '',
				audioUrl: '',
				imageUrl: '',
				questions: [],
			});
		}
	}

	return sections;
}

/**
 * @param {string} sectionType
 * @param {string} partType
 */
export function isValidPartTypeForSection(sectionType, partType) {
	const allowed = EXAM_PART_TYPES_BY_SECTION[sectionType];
	return Array.isArray(allowed) && allowed.includes(partType);
}
