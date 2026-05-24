/**
 * Audio nghe hiểu — lưu ở cấp đề thi, không gắn từng part.
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
