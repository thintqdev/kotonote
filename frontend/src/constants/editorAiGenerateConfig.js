import {
	generateAdminGrammar,
	generateAdminKaiwa,
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
			fallbackReason: result.fallbackReason ?? null,
		};
	},
	previewLines: (item) => {
		if (!item) return [];
		const tags = Array.isArray(item.tagIds) ? item.tagIds.join(', ') : '';
		return [
			`Slug: ${item.slug ?? '—'}`,
			`Pattern: ${item.pattern ?? ''}`,
			`Tags: ${tags || '—'}`,
			`Teaser: ${item.teaser?.vi ?? item.teaser?.ja ?? ''}`,
			`Ví dụ: ${item.examples?.length ?? 0} · Luyện tập: ${item.practice?.items?.length ?? 0}`,
		];
	},
};

/** Mẫu prompt Kaiwa theo JLPT (không chọn thủ công trên UI). */
export function resolveKaiwaPromptTemplate(jlpt) {
	const lv = String(jlpt ?? 'N5').toUpperCase();
	if (lv === 'N4') return 'n4-situation';
	if (lv === 'N3') return 'n3-situation';
	if (lv === 'N2') return 'n2-situation';
	if (lv === 'N1') return 'n1-situation';
	return 'n5-basic';
}

/**
 * Payload generate Kaiwa: mẫu prompt theo JLPT, nội dung gợi ý = tiêu đề (VI).
 * @param {{ titleVi: string, jlpt: string, category: string }} formSlice
 */
export function buildKaiwaAIGeneratePayload(formSlice) {
	const titleVi = String(formSlice.titleVi ?? '').trim();
	return {
		templateName: resolveKaiwaPromptTemplate(formSlice.jlpt),
		prompt: titleVi,
		jlpt: formSlice.jlpt ?? 'N5',
		category: formSlice.category ?? 'daily',
	};
}

export const KAIWA_AI_GENERATE = {
	promptType: 'kaiwa',
	defaultTemplate: resolveKaiwaPromptTemplate,
	generate: async ({ templateName, prompt, jlpt, category }) => {
		const result = await generateAdminKaiwa({
			templateName,
			prompt,
			jlpt,
			category: category || 'daily',
		});
		return {
			item: result.context ?? null,
			source: result.source ?? '',
		};
	},
	previewLines: (item) => {
		if (!item) return [];
		return [
			`Tiêu đề: ${item.titleVi ?? ''}`,
			`Tình huống: ${(item.situationVi ?? '').slice(0, 80)}…`,
			`Vai: ${item.roles?.length ?? 0} · Cụm từ: ${item.keyPhrases?.length ?? 0}`,
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
