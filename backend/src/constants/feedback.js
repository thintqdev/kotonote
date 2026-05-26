export const FEEDBACK_CATEGORY = {
	BUG: 'bug',
	FEATURE: 'feature',
	CONTENT: 'content',
	OTHER: 'other',
};

export const FEEDBACK_STATUS = {
	OPEN: 'open',
	READ: 'read',
	DONE: 'done',
};

export const FEEDBACK_CATEGORY_KEYS = Object.values(FEEDBACK_CATEGORY);
export const FEEDBACK_STATUS_KEYS = Object.values(FEEDBACK_STATUS);

/** Tối đa số góp ý mỗi user mỗi ngày (theo UTC). */
export const FEEDBACK_DAILY_LIMIT = 3;

export const FEEDBACK_MESSAGE_MAX = 2000;

/** Đính kèm tối đa (ảnh/video) cho mỗi góp ý — upload từng file giống notebook. */
export const FEEDBACK_MAX_ATTACHMENTS = 5;

/** Dung lượng tối đa một file (ảnh hoặc video). */
export const FEEDBACK_MEDIA_MAX_BYTES = 40 * 1024 * 1024;
