/**
 * Audio nghe hiểu — lưu ở cấp đề thi.
 * @param {Record<string, unknown> | null | undefined} paper
 */
export function resolveListeningAudioUrl(paper) {
	const top = String(paper?.listeningAudioUrl ?? '').trim();
	if (top) return top;
	for (const section of paper?.sections ?? []) {
		if (section?.sectionType !== 'listening') continue;
		const partAudio = String(section.audioUrl ?? '').trim();
		if (partAudio) return partAudio;
	}
	return '';
}

/**
 * Gom audio legacy từ part → paper nếu chưa có.
 * @param {Record<string, unknown>} paper
 * @param {Array<Record<string, unknown>>} sections
 */
export function migrateListeningAudioToPaper(paper, sections) {
	let listeningAudioUrl = String(paper?.listeningAudioUrl ?? '').trim();
	if (listeningAudioUrl) return listeningAudioUrl;
	for (const section of sections ?? []) {
		if (section?.sectionType !== 'listening') continue;
		const partAudio = String(section.audioUrl ?? '').trim();
		if (partAudio) return partAudio;
	}
	return '';
}
