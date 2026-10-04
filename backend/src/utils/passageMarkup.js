/**
 * Chuyển markup đoạn văn (cùng cú pháp với frontend `examPassageMarkup.js`) sang plain text
 * dễ đọc cho AI: phần nhấn mạnh / gạch chân bọc 「」, furigana giữ chữ gốc.
 * @param {string} source
 * @returns {string}
 */
export function passageMarkupToPlainText(source) {
	return String(source ?? '')
		.replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1')
		.replace(/_\((\d+)\)_/g, '（$1）')
		.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '「$1」')
		.replace(/___([\s\S]+?)___/g, '「$1」')
		.replace(/\*\*([\s\S]+?)\*\*/g, '「$1」')
		.replace(/__([\s\S]+?)__/g, '「$1」')
		.replace(/\[\[([\s\S]+?)\]\]/g, '「$1」')
		.replace(/==([\s\S]+?)==/g, '「$1」')
		.replace(/~~([\s\S]+?)~~/g, '$1')
		.replace(/\*([^*]+?)\*/g, '$1')
		.replace(/\^([^^]+?)\^/g, '$1')
		.replace(/~([^~]+?)~/g, '$1');
}
