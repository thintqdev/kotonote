/**
 * Backend chuẩn hóa body: { success, messageCode, data? }
 * @param {unknown} body
 * @returns {unknown} payload trong trường data
 */
export function getApiData(body) {
	if (!body || typeof body !== 'object' || body.success !== true) {
		throw new Error('Phản hồi API không hợp lệ');
	}
	return body.data;
}
