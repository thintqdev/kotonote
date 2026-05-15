/** Tuỳ chọn danh mục huy hiệu (khớp backend `Badge.category`) */
export const BADGE_CATEGORY_OPTIONS = [
	{ value: "streak", label: "Chuỗi ngày" },
	{ value: "vocabulary", label: "Từ vựng" },
	{ value: "kanji", label: "Kanji" },
	{ value: "grammar", label: "Ngữ pháp" },
	{ value: "reading", label: "Đọc hiểu" },
	{ value: "listening", label: "Nghe hiểu" },
	{ value: "quiz", label: "Quiz / kiểm tra" },
	{ value: "general", label: "Chung" },
	{ value: "other", label: "Khác" },
];

/** Độ hiếm (hiển thị / gamification) */
export const BADGE_RARITY_OPTIONS = [
	{ value: "common", label: "Thường" },
	{ value: "rare", label: "Hiếm" },
	{ value: "epic", label: "Cao cấp" },
	{ value: "legendary", label: "Huyền thoại" },
];

export function badgeCategoryLabel(value) {
	const o = BADGE_CATEGORY_OPTIONS.find((x) => x.value === value);
	return o ? o.label : value || "—";
}

export function badgeRarityLabel(value) {
	const o = BADGE_RARITY_OPTIONS.find((x) => x.value === value);
	return o ? o.label : value || "—";
}
