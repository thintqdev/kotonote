/** JLPT & dạng bài nghe — dùng chung admin + app */
export const LISTENING_JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'];

export const LISTENING_TYPES = [
	{ key: 'task', labelVi: 'Hiểu nhiệm vụ', labelJa: '課題理解' },
	{ key: 'point', labelVi: 'Hiểu chi tiết', labelJa: 'ポイント理解' },
	{ key: 'summary', labelVi: 'Hiểu khái quát', labelJa: '概要理解' },
	{ key: 'utterance', labelVi: 'Biểu đạt tình huống', labelJa: '発話表現' },
	{ key: 'response', labelVi: 'Phản xạ nhanh', labelJa: '即時応答' },
];

/** @param {string} typeKey */
export function getListeningTypeLabel(typeKey) {
	const t = LISTENING_TYPES.find((x) => x.key === typeKey);
	return t ? `${t.labelVi} (${t.labelJa})` : typeKey;
}
