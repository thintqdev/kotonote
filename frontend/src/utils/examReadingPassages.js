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
export function countSectionQuestions(section) {
	if (sectionHasReadingPassages(section)) {
		return section.passages.reduce(
			(sum, p) => sum + (Array.isArray(p.questions) ? p.questions.length : 0),
			0,
		);
	}
	return Array.isArray(section.questions) ? section.questions.length : 0;
}

export function emptyReadingPassageBlock() {
	return {
		passageJa: '',
		passageVi: '',
		audioUrl: '',
		mediaUrl: '',
		imageUrl: '',
		questions: [],
	};
}

/**
 * Chuẩn bị draft đọc hiểu cho tab soạn tay (passages[]).
 * @param {Record<string, unknown>} draft
 */
export function prepareReadingDraftForManual(draft) {
	if (draft?.sectionType !== 'reading') return draft;

	if (sectionHasReadingPassages(draft)) {
		return {
			...draft,
			passages: draft.passages.map((block) => ({
				...emptyReadingPassageBlock(),
				...block,
				questions: [...(block.questions ?? [])],
			})),
		};
	}

	const hasLegacy =
		String(draft.passageJa ?? '').trim() ||
		String(draft.passageVi ?? '').trim() ||
		(draft.questions?.length ?? 0) > 0;

	if (hasLegacy) {
		return {
			...draft,
			passages: [
				{
					passageJa: draft.passageJa ?? '',
					passageVi: draft.passageVi ?? '',
					audioUrl: draft.audioUrl ?? '',
					mediaUrl: draft.mediaUrl ?? draft.imageUrl ?? '',
					imageUrl: draft.imageUrl ?? '',
					questions: [...(draft.questions ?? [])],
				},
			],
			passageJa: '',
			passageVi: '',
			audioUrl: '',
			imageUrl: '',
		};
	}

	return {
		...draft,
		passages: [emptyReadingPassageBlock()],
	};
}

/**
 * Đồng bộ questionNumber và questions[] phẳng từ passages.
 * @param {Array<Record<string, unknown>>} passages
 */
export function syncReadingPassagesQuestions(passages) {
	let nextNum = 1;
	const syncedPassages = (passages ?? []).map((block) => {
		const blockQuestions = (block.questions ?? []).map((q) => {
			const nq = { ...q, questionNumber: nextNum };
			nextNum += 1;
			return nq;
		});
		return { ...block, questions: blockQuestions };
	});
	const flatQuestions = syncedPassages.flatMap((p) => p.questions ?? []);
	return { passages: syncedPassages, questions: flatQuestions };
}

/**
 * @param {unknown} parsed
 * @param {string} sectionType
 */
/**
 * Nghe hiểu: gom passages → audioUrl chung + questions[] phẳng.
 * @param {Record<string, unknown>} draft
 */
export function prepareListeningDraftForManual(draft) {
	if (draft?.sectionType !== 'listening') return draft;

	/** @type {Array<Record<string, unknown>>} */
	let questions = [...(draft.questions ?? [])];

	if (sectionHasReadingPassages(draft)) {
		for (const block of draft.passages ?? []) {
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
		...draft,
		audioUrl: '',
		imageUrl: '',
		questions,
		passages: [],
		passageJa: '',
		passageVi: '',
	};
}

/**
 * Import mảng đoạn nghe → audioUrl + questions phẳng.
 * @param {unknown} parsed
 * @param {string} sectionType
 */
export function parseListeningPartImportRoot(parsed, sectionType) {
	if (sectionType !== 'listening') {
		if (Array.isArray(parsed)) {
			throw new Error('Import dạng mảng chỉ dùng cho reading hoặc listening');
		}
		return null;
	}
	if (!Array.isArray(parsed)) return null;

	let audioUrl = '';
	let nextNum = 1;
	/** @type {Array<Record<string, unknown>>} */
	const questions = [];

	for (let i = 0; i < parsed.length; i += 1) {
		const block = parsed[i];
		if (!isPassageBlockLike(block)) {
			throw new Error(`[${i}]: cần audioUrl hoặc questions`);
		}
		const b = /** @type {Record<string, unknown>} */ (block);
		if (!audioUrl && String(b.audioUrl ?? '').trim()) {
			audioUrl = String(b.audioUrl).trim();
		}
		for (const q of b.questions ?? []) {
			questions.push(normalizeQuestionRef(q, nextNum));
			nextNum += 1;
		}
	}

	if (questions.length === 0 && !audioUrl) {
		throw new Error('Cần ít nhất audioUrl hoặc một câu hỏi');
	}

	return { audioUrl, questions, passages: [] };
}

export function parseReadingPartImportRoot(parsed, sectionType) {
	if (sectionType !== 'reading') {
		if (Array.isArray(parsed)) {
			throw new Error('Import dạng mảng chỉ dùng cho phần đọc hiểu (reading)');
		}
		return null;
	}
	if (Array.isArray(parsed)) {
		return normalizeReadingPassagesFromBlocks(parsed);
	}
	if (
		parsed &&
		typeof parsed === 'object' &&
		Array.isArray(/** @type {Record<string, unknown>} */ (parsed).passages)
	) {
		return normalizeReadingPassagesFromBlocks(
			/** @type {Record<string, unknown>} */ (parsed).passages,
		);
	}
	return null;
}
