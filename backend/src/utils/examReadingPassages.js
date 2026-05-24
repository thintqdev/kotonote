/**
 * Nhiều block đoạn văn / đoạn nghe (reading, listening).
 */

/** @param {Record<string, unknown>} o */
export function resolveBlockImageUrl(o) {
	return String(o.mediaUrl ?? o.imageUrl ?? '').trim();
}

/** @param {unknown} block */
function isPassageBlockLike(block) {
	if (!block || typeof block !== 'object' || Array.isArray(block)) return false;
	const o = /** @type {Record<string, unknown>} */ (block);
	return (
		String(o.passageJa ?? '').trim() !== '' ||
		String(o.passageVi ?? '').trim() !== '' ||
		String(o.audioUrl ?? '').trim() !== '' ||
		resolveBlockImageUrl(o) !== '' ||
		(Array.isArray(o.questions) && o.questions.length > 0)
	);
}

/**
 * @param {Record<string, unknown>} section
 */
export function sectionHasReadingPassages(section) {
	return (
		(section?.sectionType === 'reading' || section?.sectionType === 'listening') &&
		Array.isArray(section.passages) &&
		section.passages.length > 0
	);
}

/**
 * @param {Record<string, unknown>} section
 * @returns {Array<{ passageJa: string, passageVi: string, audioUrl: string, imageUrl: string, questions: unknown[] }>}
 */
export function getReadingPassageBlocks(section) {
	if (sectionHasReadingPassages(section)) {
		return section.passages.map((block) => ({
			passageJa: String(block.passageJa ?? '').trim(),
			passageVi: String(block.passageVi ?? '').trim(),
			audioUrl:
				section?.sectionType === 'listening'
					? ''
					: String(block.audioUrl ?? '').trim(),
			mediaUrl: resolveBlockImageUrl(block),
			imageUrl: String(block.imageUrl ?? '').trim(),
			questions: Array.isArray(block.questions) ? block.questions : [],
		}));
	}
	const isListening = section?.sectionType === 'listening';
	return [
		{
			passageJa: String(section.passageJa ?? '').trim(),
			passageVi: String(section.passageVi ?? '').trim(),
			audioUrl: isListening ? '' : String(section.audioUrl ?? '').trim(),
			imageUrl: isListening ? '' : String(section.imageUrl ?? '').trim(),
			questions: Array.isArray(section.questions) ? section.questions : [],
		},
	];
}

/**
 * @param {unknown} q
 * @param {number} questionNumber
 */
function normalizeQuestionRef(q, questionNumber) {
	const o = q && typeof q === 'object' ? /** @type {Record<string, unknown>} */ (q) : {};
	return {
		...o,
		questionNumber,
	};
}

/**
 * Chuẩn hóa mảng import `[{ passageJa, questions }, …]` → passages + questions phẳng.
 * @param {unknown[]} blocks
 */
export function normalizeReadingPassagesFromBlocks(blocks) {
	if (!Array.isArray(blocks) || blocks.length === 0) {
		throw new Error('Mảng đoạn văn không được rỗng');
	}
	let nextNum = 1;
	/** @type {Array<Record<string, unknown>>} */
	const passages = [];
	/** @type {Array<Record<string, unknown>>} */
	const flatQuestions = [];

	for (let i = 0; i < blocks.length; i += 1) {
		const block = blocks[i];
		if (!isPassageBlockLike(block)) {
			throw new Error(`passages[${i}]: cần passageJa, mediaUrl hoặc questions`);
		}
		const b = /** @type {Record<string, unknown>} */ (block);
		const rawQs = Array.isArray(b.questions) ? b.questions : [];
		/** @type {Array<Record<string, unknown>>} */
		const blockQuestions = [];

		for (const q of rawQs) {
			const nq = normalizeQuestionRef(q, nextNum);
			nextNum += 1;
			blockQuestions.push(nq);
			flatQuestions.push(nq);
		}

		passages.push({
			passageJa: String(b.passageJa ?? '').trim(),
			passageVi: String(b.passageVi ?? '').trim(),
			audioUrl: String(b.audioUrl ?? '').trim(),
			mediaUrl: resolveBlockImageUrl(b),
			imageUrl: '',
			questions: blockQuestions,
		});
	}

	const hasAnyMedia = passages.some(
		(p) => resolveBlockImageUrl(p) !== '' || String(p.audioUrl ?? '').trim() !== '',
	);
	if (flatQuestions.length === 0 && !hasAnyMedia) {
		throw new Error('Cần ít nhất một câu hỏi hoặc ảnh tài liệu');
	}

	return { passages, questions: flatQuestions };
}

/**
 * @param {Record<string, unknown>} section
 */
/**
 * @param {Record<string, unknown>} section
 */
export function prepareListeningSectionForStorage(section) {
	if (section?.sectionType !== 'listening') return section;

	/** @type {Array<Record<string, unknown>>} */
	let questions = Array.isArray(section.questions) ? [...section.questions] : [];

	if (sectionHasReadingPassages(section)) {
		for (const block of section.passages ?? []) {
			questions.push(...(block.questions ?? []));
		}
	}

	let nextNum = 1;
	questions = questions.map((q) => ({
		...q,
		questionNumber:
			Number(q.questionNumber) > 0 ? Number(q.questionNumber) : nextNum++,
	}));

	return {
		...section,
		audioUrl: '',
		imageUrl: '',
		questions,
		passages: [],
		passageJa: '',
		passageVi: '',
	};
}

export function normalizeReadingSectionForStorage(section) {
	if (section.sectionType !== 'reading') {
		return section;
	}
	const blocks = sectionHasReadingPassages(section)
		? section.passages
		: getReadingPassageBlocks(section);
	const { passages, questions } = normalizeReadingPassagesFromBlocks(blocks);
	return {
		...section,
		passages,
		questions,
		passageJa: '',
		passageVi: '',
		audioUrl: '',
		imageUrl: '',
	};
}

/**
 * @param {Record<string, unknown>} section
 */
export function countSectionQuestions(section) {
	if (sectionHasReadingPassages(section)) {
		return section.passages.reduce(
			(sum, p) => sum + (Array.isArray(p.questions) ? p.questions.length : 0),
			0,
		);
	}
	return Array.isArray(section.questions) ? section.questions.length : 0;
}
