import { useCallback, useEffect, useState } from 'react';
import {
	EXAM_PART_META as FALLBACK_PART_META,
	EXAM_SECTION_META as FALLBACK_SECTION_META,
	EXAM_SECTION_ORDER,
} from '../constants/examPaperStructure.js';
import { getExamStructureMeta } from '../services/adminExamStructureService.js';

/**
 * Meta cấu trúc đề từ DB (blueprint JLPT) — fallback constants nếu API lỗi.
 * @param {string} [jlpt]
 */
export function useExamStructureMeta(jlpt = 'N3') {
	const [meta, setMeta] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = useCallback(async () => {
		if (!jlpt) return;
		setLoading(true);
		setError('');
		try {
			const data = await getExamStructureMeta(jlpt);
			setMeta(data);
		} catch (e) {
			setError(e?.message || 'Không tải cấu trúc đề');
			setMeta({
				jlpt,
				sectionMeta: FALLBACK_SECTION_META,
				partMeta: FALLBACK_PART_META,
				sectionOrder: EXAM_SECTION_ORDER,
				enabledPartTypes: [],
			});
		} finally {
			setLoading(false);
		}
	}, [jlpt]);

	useEffect(() => {
		void load();
	}, [load]);

	const sectionMeta = meta?.sectionMeta ?? FALLBACK_SECTION_META;
	const partMeta = meta?.partMeta ?? FALLBACK_PART_META;
	const sectionOrder = meta?.sectionOrder ?? EXAM_SECTION_ORDER;

	return {
		meta,
		sectionMeta,
		partMeta,
		sectionOrder,
		loading,
		error,
		reload: load,
	};
}

/**
 * @param {Record<string, { needsPassage?: boolean, needsMedia?: boolean, needsAudio?: boolean, sectionType?: string }>} partMeta
 * @param {string} sectionType
 * @param {string} partType
 */
export function partNeedsPassageFromMeta(partMeta, sectionType, partType) {
	const m = partMeta?.[partType];
	if (m?.needsPassage != null) return m.needsPassage;
	if (partType === 'info_search') return false;
	if (sectionType === 'reading') return true;
	if (sectionType === 'grammar' && partType === 'text_grammar') return true;
	if (
		sectionType === 'vocabulary' &&
		['context_word', 'same_meaning', 'word_usage', 'synonym'].includes(partType)
	) {
		return true;
	}
	return false;
}

export function partNeedsMediaFromMeta(partMeta, sectionType, partType) {
	const m = partMeta?.[partType];
	if (m?.needsMedia != null) return m.needsMedia;
	if (m?.needsAudio != null) return m.needsAudio;
	if (partType === 'info_search') return true;
	return sectionType === 'listening';
}

/** @deprecated dùng partNeedsMediaFromMeta */
export const partNeedsAudioFromMeta = partNeedsMediaFromMeta;
