const STORAGE_PREFIX = 'exam-result:';

export function saveExamResult(slug, payload, attemptId = null) {
	if (!payload) return;
	try {
		const record = { ...payload, savedAt: Date.now() };
		if (slug) {
			sessionStorage.setItem(
				`${STORAGE_PREFIX}${slug}`,
				JSON.stringify(record),
			);
		}
		if (attemptId) {
			sessionStorage.setItem(
				`${STORAGE_PREFIX}id:${attemptId}`,
				JSON.stringify(record),
			);
		}
	} catch {
		// quota / private mode
	}
}

export function loadExamResult(slug, attemptId = null) {
	try {
		if (attemptId) {
			const raw = sessionStorage.getItem(`${STORAGE_PREFIX}id:${attemptId}`);
			if (raw) return JSON.parse(raw);
		}
		if (!slug) return null;
		const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${slug}`);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearExamResult(slug) {
	if (!slug) return;
	try {
		sessionStorage.removeItem(`${STORAGE_PREFIX}${slug}`);
	} catch {
		// ignore
	}
}
