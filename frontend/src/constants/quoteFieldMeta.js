/** Giá trị enum backend Quote.category */

export const QUOTE_CATEGORY_OPTIONS = [
	{ value: 'motivation', label: 'Động viên' },
	{ value: 'learning', label: 'Học tập' },
	{ value: 'wisdom', label: 'Tri thức' },
	{ value: 'perseverance', label: 'Kiên trì' },
	{ value: 'success', label: 'Thành công' },
];

export function quoteCategoryLabel(value) {
	return QUOTE_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
