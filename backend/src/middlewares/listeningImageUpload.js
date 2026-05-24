import {
	createMemoryFileUpload,
	imageExtFromFile,
} from '../utils/multerUpload.js';

export const listeningImageUploadMiddleware = createMemoryFileUpload({
	field: 'image',
	maxSize: 2 * 1024 * 1024,
	fileFilter: (_req, file, cb) => {
		if (file.mimetype && file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('ONLY_IMAGE'));
		}
	},
	resolveMeta: (_req, file) => ({
		folder: 'listening/images',
		filename: `img-${Date.now()}-${Math.round(Math.random() * 1e6)}${imageExtFromFile(file)}`,
	}),
	customMessages: {
		ONLY_IMAGE: 'Only image files are allowed',
		LIMIT_FILE_SIZE: 'Image must be at most 2MB',
	},
});
