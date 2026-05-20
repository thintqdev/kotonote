/**
 * Trích JSON array từ phản hồi Gemini (có thể bọc markdown).
 * @param {string} text
 * @returns {unknown[]}
 */
export function parseJsonArrayFromAIText(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) {
		throw new Error('Empty AI response');
	}

	const tryParse = (raw) => {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed;
		}
		if (parsed && typeof parsed === 'object') {
			const obj = /** @type {Record<string, unknown>} */ (parsed);
			for (const key of ['vocabulary', 'items', 'words', 'data']) {
				if (Array.isArray(obj[key])) {
					return obj[key];
				}
			}
		}
		throw new Error('Not a JSON array');
	};

	try {
		return tryParse(trimmed);
	} catch {
		// continue
	}

	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fenced?.[1]) {
		return tryParse(fenced[1].trim());
	}

	const start = trimmed.indexOf('[');
	const end = trimmed.lastIndexOf(']');
	if (start >= 0 && end > start) {
		return tryParse(trimmed.slice(start, end + 1));
	}

	throw new Error('Could not parse JSON array from AI response');
}

/**
 * Trích JSON object hoặc array từ phản hồi Gemini.
 * @param {string} text
 * @returns {unknown}
 */
export function parseJsonFromAIText(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) {
		throw new Error('Empty AI response');
	}

	const tryParse = (raw) => JSON.parse(raw);

	const unwrap = (parsed) => {
		if (Array.isArray(parsed)) {
			return parsed;
		}
		if (parsed && typeof parsed === 'object') {
			const obj = /** @type {Record<string, unknown>} */ (parsed);
			for (const key of [
				'grammar',
				'article',
				'reading',
				'data',
				'result',
			]) {
				if (obj[key] && typeof obj[key] === 'object') {
					return obj[key];
				}
			}
			return parsed;
		}
		throw new Error('Not JSON object or array');
	};

	try {
		return unwrap(tryParse(trimmed));
	} catch {
		// continue
	}

	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fenced?.[1]) {
		return unwrap(tryParse(fenced[1].trim()));
	}

	const objStart = trimmed.indexOf('{');
	const objEnd = trimmed.lastIndexOf('}');
	if (objStart >= 0 && objEnd > objStart) {
		return unwrap(tryParse(trimmed.slice(objStart, objEnd + 1)));
	}

	const arrStart = trimmed.indexOf('[');
	const arrEnd = trimmed.lastIndexOf(']');
	if (arrStart >= 0 && arrEnd > arrStart) {
		return unwrap(tryParse(trimmed.slice(arrStart, arrEnd + 1)));
	}

	throw new Error('Could not parse JSON from AI response');
}
