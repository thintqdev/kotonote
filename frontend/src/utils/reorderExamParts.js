import { EXAM_SECTION_ORDER } from '../constants/examPaperStructure.js';

/**
 * @template T
 * @param {T[]} list
 * @param {number} fromIndex
 * @param {number} toIndex
 */
export function reorderList(list, fromIndex, toIndex) {
	if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return list;
	const next = [...list];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
}

/**
 * Sắp xếp lại part trong một khối JLPT, cập nhật `order` toàn cục.
 * @param {Array<{ sectionType?: string, order?: number }>} allSections
 * @param {string} sectionType
 * @param {number} fromIndex — index trong khối (đã sort theo order)
 * @param {number} toIndex
 */
export function reorderExamPartsInSection(allSections, sectionType, fromIndex, toIndex) {
	const sorted = [...(allSections ?? [])].sort(
		(a, b) => (a.order ?? 0) - (b.order ?? 0),
	);
	const groups = {};
	for (const key of EXAM_SECTION_ORDER) {
		groups[key] = sorted.filter((s) => s.sectionType === key);
	}
	const group = groups[sectionType] ?? [];
	groups[sectionType] = reorderList(group, fromIndex, toIndex);
	const merged = EXAM_SECTION_ORDER.flatMap((key) => groups[key] ?? []);
	return merged.map((s, idx) => ({ ...s, order: idx + 1 }));
}
