import {
	badgeExtFromMimetype,
	createMemoryImageUpload,
} from '../utils/multerUpload.js';

export const readingCoverUploadMiddleware = createMemoryImageUpload({
	field: 'cover',
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
			cb(new Error('READING_COVER_TYPE'));
		}
	},
	resolveMeta: (req, file) => {
		const id = String(req.params?.id || 'draft').replace(/[^a-f0-9]/gi, '');
		const ext = badgeExtFromMimetype(file);
		return {
			folder: 'reading',
			filename: `reading-${id || 'x'}-${Date.now()}${ext}`,
		};
	},
	customMessages: {
		READING_COVER_TYPE: 'Use PNG, WebP, GIF or JPEG',
		LIMIT_FILE_SIZE: 'Image must be at most 2MB',
	},
});
