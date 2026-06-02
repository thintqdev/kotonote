import { ARENA_MAX_ACTIVE_GAMES } from '../constants/arena.js';

/**
 * Chọn item cố định theo dateKey (mọi user cùng bộ trong phiên).
 * @param {Array} pool
 * @param {string} dateKey
 * @param {number} count
 */
export function pickByDateSeed(pool, dateKey, count) {
	const active = [...(pool || [])].filter((row) => row.isActive !== false);
	if (!active.length) return [];

	const scored = active.map((row) => {
		const id = String(row._id);
		let hash = 0;
		const seed = `${dateKey}:${id}`;
		for (let i = 0; i < seed.length; i += 1) {
			hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
		}
		return { row, hash };
	});
	scored.sort(
		(a, b) => a.hash - b.hash || String(a.row._id).localeCompare(String(b.row._id)),
	);
	return scored.slice(0, Math.min(count, scored.length)).map((s) => s.row);
}

export function normalizeAnswer(s) {
	return String(s || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '');
}

function hashSeed(seed) {
	let hash = 0;
	for (let i = 0; i < seed.length; i += 1) {
		hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return hash;
}

/**
 * Tạo lựa chọn trợ từ (đáp án đúng + nhiễu), ưu tiên CORE (は・の・へ…), xáo trộn theo seed.
 * @param {string} answer
 * @param {string[]} acceptAnswers
 * @param {string} seed
 * @param {string[]} pool
 * @param {number} [size=8]
 * @param {string[]} [corePool]
 */
export function buildParticleMcqChoices(
	answer,
	acceptAnswers = [],
	seed,
	pool,
	size = 8,
	corePool = [],
) {
	const correct = String(answer || '').trim();
	if (!correct) return { choices: [], answerIndex: 0 };

	const blocked = new Set(
		[correct, ...(acceptAnswers || [])].map((a) => normalizeAnswer(a)),
	);
	const picked = [correct];
	const canAdd = (p) => {
		const label = String(p).trim();
		return label && !blocked.has(normalizeAnswer(label)) && !picked.includes(label);
	};

	for (const p of corePool || []) {
		if (picked.length >= size) break;
		if (canAdd(p)) picked.push(String(p).trim());
	}

	const distractors = (pool || [])
		.filter((p) => !blocked.has(normalizeAnswer(p)))
		.map((p) => String(p).trim())
		.filter((p) => !picked.includes(p));

	const scored = distractors.map((p) => ({
		p,
		h: hashSeed(`${seed}:d:${p}`),
	}));
	scored.sort((a, b) => a.h - b.h || a.p.localeCompare(b.p));

	for (const { p } of scored) {
		if (picked.length >= size) break;
		if (!picked.includes(p)) picked.push(p);
	}
	while (picked.length < Math.min(size, 1 + distractors.length + corePool.length)) {
		const fallback = distractors.find((p) => !picked.includes(p));
		if (!fallback) break;
		picked.push(fallback);
	}

	const order = picked.map((label, i) => ({
		label,
		h: hashSeed(`${seed}:o:${label}:${i}`),
	}));
	order.sort((a, b) => a.h - b.h || a.label.localeCompare(b.label));
	const choices = order.map((o) => o.label);
	const answerIndex = choices.findIndex((c) => normalizeAnswer(c) === normalizeAnswer(correct));

	return {
		choices,
		answerIndex: answerIndex >= 0 ? answerIndex : 0,
	};
}

/**
 * Trắc nghiệm cách đọc (hiragana) — 4 lựa chọn, nhiễu từ pool readings.
 */
export function buildReadingMcqChoices(correctReading, poolReadings, seed, size = 4) {
	return buildParticleMcqChoices(
		correctReading,
		[],
		seed,
		poolReadings,
		size,
		[],
	);
}

/**
 * Trắc nghiệm nghĩa tiếng Việt — xáo đáp án theo seed, giữ đáp án đúng.
 */
export function shuffleVocabChoices(choices, answerIndex, seed) {
	const labels = (choices || []).map((c) => String(c).trim()).filter(Boolean);
	if (!labels.length) return { choices: [], answerIndex: 0 };
	const safeIndex =
		Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < labels.length
			? answerIndex
			: 0;
	const correct = labels[safeIndex];
	const order = labels.map((label, i) => ({
		label,
		h: hashSeed(`${seed}:m:${label}:${i}`),
	}));
	order.sort((a, b) => a.h - b.h || a.label.localeCompare(b.label));
	const shuffled = order.map((o) => o.label);
	const newIndex = shuffled.indexOf(correct);
	return {
		choices: shuffled,
		answerIndex: newIndex >= 0 ? newIndex : 0,
	};
}

/**
 * Gom mọi đáp án nghĩa từ kho từ vựng (dùng làm nhiễu).
 */
export function collectMeaningPool(vocabRows) {
	const set = new Set();
	for (const row of vocabRows || []) {
		for (const c of row.choices || []) {
			const label = String(c).trim();
			if (label) set.add(label);
		}
	}
	return [...set];
}

export function buildMeaningMcqChoices(correctMeaning, poolMeanings, seed, size = 4) {
	return buildParticleMcqChoices(
		correctMeaning,
		[],
		seed,
		poolMeanings,
		size,
		[],
	);
}

/**
 * @param {Array<{ isActive?: boolean, order?: number }>} games
 */
export function resolveActiveArenaGames(games) {
	return [...(games || [])]
		.filter((g) => g.isActive !== false)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.slice(0, ARENA_MAX_ACTIVE_GAMES);
}
