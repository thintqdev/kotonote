import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const notebookUploadRoot = path.join(__dirname, '..', '..', 'uploads', 'notebook');

export function ensureNotebookUploadDir() {
	fs.mkdirSync(notebookUploadRoot, { recursive: true });
}

function userDir(userId) {
	const dir = path.join(notebookUploadRoot, String(userId));
	fs.mkdirSync(dir, { recursive: true });
	return dir;
}

const storage = multer.diskStorage({
	destination: (req, _file, cb) => {
		cb(null, userDir(req.user._id));
	},
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname || '').toLowerCase();
		const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
		const useExt = allowed.includes(ext) ? ext : '.jpg';
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${useExt}`);
	},
});

const fileFilter = (_req, file, cb) => {
	if (file.mimetype && file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('ONLY_IMAGE'));
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

export function notebookImageUploadMiddleware(req, res, next) {
	upload(req, res, (err) => {
		if (!err) return next();
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return apiError(res, COMMON.VALIDATION_ERROR, 400, [
					{ field: 'image', message: 'Image must be at most 5MB' },
				]);
			}
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field: 'image', message: err.message },
			]);
		}
		if (err.message === 'ONLY_IMAGE') {
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field: 'image', message: 'Only image files are allowed' },
			]);
		}
		return next(err);
	});
}
