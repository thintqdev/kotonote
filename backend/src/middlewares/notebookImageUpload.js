import {
	createMemoryImageUpload,
	imageExtFromFile,
} from '../utils/multerUpload.js';

export const notebookImageUploadMiddleware = createMemoryImageUpload({
	field: 'image',
	maxSize: 5 * 1024 * 1024,
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
			folder: `notebook/${req.user._id}`,
			filename: `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`,
		};
	},
	customMessages: {
		ONLY_IMAGE: 'Only image files are allowed',
		LIMIT_FILE_SIZE: 'Image must be at most 5MB',
	},
});
