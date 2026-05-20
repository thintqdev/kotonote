import {
	generateAdminGrammar,
	generateAdminReading,
} from '../services/adminAIService.js';

export const GRAMMAR_AI_GENERATE = {
	promptType: 'grammar',
	modalTitle: 'Generate ngữ pháp (AI)',
	defaultTemplate: (jlpt) => {
		const lv = String(jlpt ?? 'N5').toUpperCase();
		if (lv === 'N3' || lv === 'N2' || lv === 'N1') return 'n3-lesson';
		return 'n5-basic';
	},
	generate: async ({ templateName, prompt, jlpt, patternHint }) => {
		const result = await generateAdminGrammar({
			templateName,
			prompt,
			jlpt,
			patternHint,
		});
		return {
			item: result.grammar ?? null,
			source: result.source ?? '',
		};
	},
	previewLines: (item) => {
		if (!item) return [];
		return [
			`Pattern: ${item.pattern ?? ''}`,
			`Teaser: ${item.teaser?.vi ?? item.teaser?.ja ?? ''}`,
			`Ví dụ: ${item.examples?.length ?? 0} · Luyện tập: ${item.practice?.items?.length ?? 0}`,
		];
	},
};

export const READING_AI_GENERATE = {
	promptType: 'reading',
	modalTitle: 'Generate bài đọc (AI)',
	defaultTemplate: (jlpt) => {
		const lv = String(jlpt ?? 'N5').toUpperCase();
		if (lv === 'N3' || lv === 'N2' || lv === 'N1') return 'n3-article';
		return 'n5-basic';
	},
	generate: async ({ templateName, prompt, jlpt }) => {
		const result = await generateAdminReading({
			templateName,
			prompt,
			jlpt,
		});
		return {
			item: result.article ?? null,
			source: result.source ?? '',
		};
	},
	previewLines: (item) => {
		if (!item) return [];
		return [
			`Tiêu đề: ${item.titleJa ?? ''}`,
			`Đoạn: ${item.paragraphsJa?.length ?? 0} · Từ vựng: ${item.vocabulary?.length ?? 0}`,
			`Câu hỏi: ${item.questions?.length ?? 0}`,
		];
	},
};
