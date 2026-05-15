import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { apiError } from '../utils/response.js';
import { COMMON } from '../constants/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Thư mục lưu file: `<repo>/backend/uploads/avatars` */
export const avatarsUploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');

export function ensureAvatarsUploadDir() {
	fs.mkdirSync(avatarsUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, avatarsUploadDir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname || '').toLowerCase();
		const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
		const useExt = allowed.includes(ext) ? ext : '.jpg';
		const base = `${req.user._id}-${Date.now()}`;
		cb(null, `${base}${useExt}`);
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
	limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

/**
 * Multer + lỗi kích thước / loại file → 400
 */
export function avatarUploadMiddleware(req, res, next) {
	upload(req, res, (err) => {
		if (!err) {
			return next();
		}
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				return apiError(res, COMMON.VALIDATION_ERROR, 400, [
					{ field: 'avatar', message: 'Image must be at most 2MB' },
				]);
			}
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field: 'avatar', message: err.message },
			]);
		}
		if (err.message === 'ONLY_IMAGE') {
			return apiError(res, COMMON.VALIDATION_ERROR, 400, [
				{ field: 'avatar', message: 'Only image files are allowed' },
			]);
		}
		return next(err);
	});
}
