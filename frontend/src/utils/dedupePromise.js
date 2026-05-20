/** @type {Map<string, Promise<unknown>>} */
const inflight = new Map();

/**
 * Gộp các promise cùng key đang chạy song song (vd. React Strict Mode).
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} factory
 * @returns {Promise<T>}
 */
export function dedupePromise(key, factory) {
	const existing = inflight.get(key);
	if (existing) {
		return /** @type {Promise<T>} */ (existing);
	}

	const promise = factory().finally(() => {
		inflight.delete(key);
	});
	inflight.set(key, promise);
	return promise;
}
