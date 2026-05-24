/** JLPT & chủ đề tình huống Kaiwa — admin */
export const KAIWA_JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'];

export const KAIWA_CATEGORY_OPTIONS = [
	{ value: 'daily', label: 'Sinh hoạt hằng ngày' },
	{ value: 'travel', label: 'Du lịch' },
	{ value: 'restaurant', label: 'Nhà hàng / quán' },
	{ value: 'shopping', label: 'Mua sắm' },
	{ value: 'business', label: 'Công việc' },
	{ value: 'school', label: 'Trường học' },
	{ value: 'hospital', label: 'Bệnh viện' },
	{ value: 'work', label: 'Văn phòng' },
	{ value: 'other', label: 'Khác' },
];

export function kaiwaCategoryLabel(value) {
	return (
		KAIWA_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '—'
	);
}

/** Nhãn chủ đề — ưu tiên i18n `kaiwaPage.categories.*` */
export function kaiwaCategoryLabelI18n(t, value) {
	if (!value) return '—';
	const key = `kaiwaPage.categories.${value}`;
	const translated = t(key);
	if (translated && translated !== key) return translated;
	return kaiwaCategoryLabel(value);
}
