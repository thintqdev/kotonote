export const READING_JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const READING_DEFAULT_PAGE_SIZE = 12;
export const READING_MAX_PAGE_SIZE = 50;
export const READING_ADMIN_DEFAULT_PAGE_SIZE = 20;

/** Mục tiêu đọc (hiển thị trên list — có thể đổi sau) */
export const READING_WEEKLY_GOAL = 60;

export const READING_STATUS = ['not_started', 'in_progress', 'done'];

/** plain: hiển thị nguyên văn; markup: hiểu cú pháp `___gạch chân___`, `**đậm**`… */
export const READING_CONTENT_FORMATS = ['plain', 'markup'];

/** Vai trò thành phần câu trong phân tích luyện dịch theo câu */
export const READING_SENTENCE_ROLES = [
	'topic',
	'subject',
	'predicate',
	'object',
	'complement',
	'modifier',
	'adverbial',
	'connector',
	'clause',
];

/** Số câu tối đa mỗi lần nộp chấm */
export const READING_SENTENCE_FEEDBACK_MAX_ITEMS = 10;
