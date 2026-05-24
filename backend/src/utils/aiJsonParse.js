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
				'analysis',
				'journal',
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

/**
 * Đóng ngoặc JSON bị cắt cụt (Gemini max tokens).
 * @param {string} raw
 */
function closeTruncatedJson(raw) {
	const stack = [];
	let inString = false;
	let escape = false;

	for (const ch of raw) {
		if (escape) {
			escape = false;
			continue;
		}
		if (ch === '\\' && inString) {
			escape = true;
			continue;
		}
		if (ch === '"') {
			inString = !inString;
			continue;
		}
		if (inString) continue;
		if (ch === '{') stack.push('}');
		else if (ch === '[') stack.push(']');
		else if (ch === '}' || ch === ']') stack.pop();
	}

	let suffix = '';
	if (inString) suffix += '"';
	suffix += stack.reverse().join('');
	return raw + suffix;
}

/**
 * Parse JSON object khi Gemini trả về JSON hỏng hoặc bị cắt.
 * @param {string} text
 * @returns {unknown}
 */
export function parseJsonObjectLenient(text) {
	try {
		return parseJsonFromAIText(text);
	} catch {
		// continue
	}

	const trimmed = String(text ?? '').trim();
	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const body = (fenced?.[1] ?? trimmed).trim();
	const start = body.indexOf('{');
	if (start < 0) {
		throw new Error('No JSON object in AI response');
	}

	let slice = body.slice(start);

	for (let attempt = 0; attempt < 3; attempt += 1) {
		try {
			return JSON.parse(slice);
		} catch {
			// trim từ cuối đến khi parse được
			let end = slice.lastIndexOf('}');
			while (end > start + 20) {
				try {
					const parsed = JSON.parse(slice.slice(0, end + 1));
					return parsed;
				} catch {
					end = slice.lastIndexOf('}', end - 1);
				}
			}
			slice = closeTruncatedJson(slice);
		}
	}

	throw new Error('Could not lenient-parse JSON object from AI response');
}
