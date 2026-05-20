export const PROMPT_TYPE_OPTIONS = [
	{ value: 'vocabulary', label: 'Từ vựng' },
	{ value: 'kanji', label: 'Kanji' },
	{ value: 'grammar', label: 'Ngữ pháp' },
	{ value: 'reading', label: 'Đọc hiểu' },
	{ value: 'listening', label: 'Nghe hiểu' },
	{ value: 'other', label: 'Khác' },
];

export const JLPT_LEVEL_OPTIONS = [
	{ value: '', label: '— Không chọn —' },
	{ value: 'N5', label: 'N5' },
	{ value: 'N4', label: 'N4' },
	{ value: 'N3', label: 'N3' },
	{ value: 'N2', label: 'N2' },
	{ value: 'N1', label: 'N1' },
];

export function promptTypeLabel(type) {
	return PROMPT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type ?? '—';
}
