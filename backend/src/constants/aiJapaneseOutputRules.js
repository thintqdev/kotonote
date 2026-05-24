/**
 * Quy tắc chữ Nhật — ghép vào mọi prompt AI (file + DB) khi gọi getAIPrompt*.
 */
export const AI_JAPANESE_OUTPUT_RULES = `
---
Quy tắc chữ viết tiếng Nhật (BẮT BUỘC):
- KHÔNG dùng romaji / chữ Latin (a-z) cho cách đọc hoặc phiên âm.
- Trường "reading" (từ vựng, cụm Kaiwa): chỉ hiragana (ưu tiên) hoặc katakana nếu là âm ngoại lai.
- Kanji: onYomi = katakana (có thể nhiều âm, cách nhau bằng ・); kunYomi = hiragana (có thể thêm okurigana).
- Ví dụ SAI: "gakkou", "arigatou"; ĐÚNG: "がっこう", "ありがとう".
- Nội dung tiếng Nhật (câu ví dụ, script nghe, hội thoại): kanji + kana, không chèn romaji trong ngoặc.
`.trim();
