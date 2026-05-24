import {
	createMemoryImageUpload,
	imageExtFromFile,
} from '../utils/multerUpload.js';

export const avatarUploadMiddleware = createMemoryImageUpload({
	field: 'avatar',
	maxSize: 2 * 1024 * 1024,
	fileFilter: (_req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('ONLY_IMAGE'));
		}
	},
	resolveMeta: (req, file) => {
		const ext = imageExtFromFile(file);
		return {
			folder: 'avatars',
			filename: `${req.user._id}-${Date.now()}${ext}`,
		};
	},
	customMessages: {
		ONLY_IMAGE: 'Only image files are allowed',
		LIMIT_FILE_SIZE: 'Image must be at most 2MB',
	},
});
