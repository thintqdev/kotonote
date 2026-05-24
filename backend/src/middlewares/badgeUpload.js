import {
	badgeExtFromMimetype,
	createMemoryImageUpload,
} from '../utils/multerUpload.js';

export const badgeUploadMiddleware = createMemoryImageUpload({
	field: 'icon',
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
			cb(new Error('BADGE_ICON_TYPE'));
		}
	},
	resolveMeta: (req, file) => {
		const id = String(req.params?.id || 'badge').replace(/[^a-f0-9]/gi, '');
		const ext = badgeExtFromMimetype(file);
		return {
			folder: 'badges',
			filename: `badge-${id || 'x'}-${Date.now()}${ext}`,
		};
	},
	customMessages: {
		BADGE_ICON_TYPE:
			'Use PNG, WebP, GIF or JPEG (square transparent PNG/WebP recommended)',
		LIMIT_FILE_SIZE: 'Image must be at most 2MB',
	},
});
