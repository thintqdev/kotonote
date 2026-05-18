/** Giai đoạn tối đa: 0=hạt … 3=hoa (khớp frontend VOCAB_LESSON_GROWTH_MAX) */
export const VOCAB_GROWTH_STAGE_MAX = 3;

export function levelToJlpt(level) {
	const v = String(level || '').trim();
	if (!v) return '';
	const upper = v.toUpperCase();
	return upper.startsWith('N') ? upper : `N${upper}`;
}
