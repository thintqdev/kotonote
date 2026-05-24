import { deleteByUrl, parseObjectKey } from './objectStorageService.js';

/** @param {string | null | undefined} url */
export function isManagedMediaUrl(url) {
	return Boolean(parseObjectKey(url));
}

/**
 * @param {{ audioUrl?: string, image?: string, questions?: { choiceImages?: string[] }[] } | null | undefined} doc
 */
export async function deleteExerciseMedia(doc) {
	if (!doc) return;
	await deleteByUrl(doc.audioUrl);
	await deleteByUrl(doc.image);
	for (const q of doc.questions || []) {
		for (const img of q.choiceImages || []) {
			if (img) await deleteByUrl(img);
		}
	}
}

/**
 * @param {string | null | undefined} prev
 * @param {string | null | undefined} next
 */
export async function deleteReplacedMedia(prev, next) {
	if (prev && prev !== next && isManagedMediaUrl(prev)) {
		await deleteByUrl(prev);
	}
}

/**
 * @param {{ choiceImages?: string[] }[]} prevQs
 * @param {{ choiceImages?: string[] }[]} nextQs
 */
export async function deleteReplacedChoiceImages(prevQs = [], nextQs = []) {
	const nextSet = new Set();
	for (const q of nextQs) {
		for (const img of q.choiceImages || []) {
			if (img) nextSet.add(img);
		}
	}
	for (const q of prevQs) {
		for (const img of q.choiceImages || []) {
			if (img && !nextSet.has(img) && isManagedMediaUrl(img)) {
				await deleteByUrl(img);
			}
		}
	}
}
