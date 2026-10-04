/**
 * Hash djb2 ngắn gọn để so sánh nội dung (không dùng cho bảo mật).
 * @param {string} source
 * @returns {string}
 */
export function hashText(source) {
  let hash = 5381;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) + hash + source.charCodeAt(i)) | 0;
  }
  return String(hash);
}
