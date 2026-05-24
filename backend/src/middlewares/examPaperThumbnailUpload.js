import {
	badgeExtFromMimetype,
	createMemoryImageUpload,
} from '../utils/multerUpload.js';

export const examPaperThumbnailUploadMiddleware = createMemoryImageUpload({
	field: 'thumbnail',
	maxSize: 2 * 1024 * 1024,
	fileFilter: (_req, file, cb) => {
		const ok =
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/webp' ||
			file.mimetype === 'image/gif' ||
			file.mimetype === 'image/jpeg';
		if (ok) {
			cb(null, true);
		} else {
			cb(new Error('EXAM_THUMBNAIL_TYPE'));
		}
	},
	resolveMeta: (req, file) => {
		const id = String(req.params?.id || 'draft').replace(/[^a-f0-9]/gi, '');
		const ext = badgeExtFromMimetype(file);
		return {
			folder: 'exam/thumbnails',
			filename: `exam-${id || 'x'}-${Date.now()}${ext}`,
		};
	},
	customMessages: {
		EXAM_THUMBNAIL_TYPE: 'Use PNG, WebP, GIF or JPEG',
		LIMIT_FILE_SIZE: 'Image must be at most 2MB',
	},
});
