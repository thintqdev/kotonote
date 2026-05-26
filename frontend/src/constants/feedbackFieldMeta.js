/** Khớp backend `FEEDBACK_MAX_ATTACHMENTS` / `FEEDBACK_MEDIA_MAX_BYTES`. */
export const FEEDBACK_MAX_FILES = 5;
export const FEEDBACK_MAX_FILE_BYTES = 40 * 1024 * 1024;

export const FEEDBACK_CATEGORY_OPTIONS = [
	{ value: 'bug', labelKey: 'feedbackPage.categories.bug' },
	{ value: 'feature', labelKey: 'feedbackPage.categories.feature' },
	{ value: 'content', labelKey: 'feedbackPage.categories.content' },
	{ value: 'other', labelKey: 'feedbackPage.categories.other' },
];

export const FEEDBACK_STATUS_OPTIONS = [
	{ value: 'open', labelKey: 'feedbackAdmin.status.open' },
	{ value: 'read', labelKey: 'feedbackAdmin.status.read' },
	{ value: 'done', labelKey: 'feedbackAdmin.status.done' },
];
